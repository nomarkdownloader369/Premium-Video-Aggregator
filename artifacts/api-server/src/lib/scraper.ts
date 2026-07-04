import { load } from "cheerio";
import { eq, sql } from "drizzle-orm";
import { logger } from "./logger";
import { getPfDb, pfVideosTable } from "./pfDb";
import type { PfVideoInsert } from "@workspace/db/schema";

const BASE = "https://hqporner.com";

const STUDIO_WHITELIST = new Set([
  "brazzers",
  "blacked",
  "tushy",
  "mylf",
  "team skeet",
  "bangbros",
  "nubiles",
  "reality kings",
  "mofos",
  "naughty america",
  "digital playground",
]);

const QUALITY_ACCEPT = new Set(["1080p", "2k", "4k"]);

const CATEGORY_MAP: Record<string, string> = {
  milf: "milf",
  anal: "anal",
  lesbian: "lesbian",
  teen: "teen",
  pov: "pov",
  amateur: "amateur",
  interracial: "interracial",
  blowjob: "blowjob",
  "big tits": "big tits",
  creampie: "creampie",
  threesome: "threesome",
  stepmom: "stepmom",
  cosplay: "cosplay",
  public: "public",
};

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  Referer: BASE,
};

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function slugify(title: string, id: string) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) +
    "-" +
    id
  );
}

function parseDuration(text: string): number {
  const clean = text.trim().replace(/[^0-9:]/g, "");
  const parts = clean.split(":").map(Number);
  if (parts.length === 3) return (parts[0] ?? 0) * 3600 + (parts[1] ?? 0) * 60 + (parts[2] ?? 0);
  if (parts.length === 2) return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
  return 0;
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function resolveCategory(tags: string[]): string {
  for (const tag of tags) {
    const key = tag.toLowerCase().trim();
    if (CATEGORY_MAP[key]) return CATEGORY_MAP[key];
  }
  return "amateur";
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) {
      logger.warn({ url, status: res.status }, "Scraper: non-OK response");
      return null;
    }
    return res.text();
  } catch (err) {
    logger.warn({ url, err }, "Scraper: fetch error");
    return null;
  }
}

interface VideoStub {
  url: string;
  title: string;
  thumbUrl: string;
  durationText: string;
  durationSeconds: number;
  views: number;
}

async function scrapeListingPage(pageUrl: string): Promise<VideoStub[]> {
  const html = await fetchHtml(pageUrl);
  if (!html) return [];

  const $ = load(html);
  const stubs: VideoStub[] = [];

  // HQporner video cards — selector may need tuning if layout changes
  $("article.col, .video-item, article, .col-xs-6").each((_, el) => {
    try {
      const a = $(el).find("a[href*='/hdporn/']").first();
      const href = a.attr("href");
      if (!href) return;

      const url = href.startsWith("http") ? href : BASE + href;
      const title = (
        a.attr("title") ||
        $(el).find(".title, h3, h2, .video-title").first().text() ||
        ""
      ).trim();
      const thumb =
        $(el).find("img[data-src], img[src]").first().attr("data-src") ||
        $(el).find("img[data-src], img[src]").first().attr("src") ||
        "";
      const durText = $(el).find(".duration, .time, [class*='dur']").first().text().trim();
      const durSecs = parseDuration(durText);

      const viewsRaw = $(el).find(".views, [class*='view']").first().text().replace(/[^0-9]/g, "");
      const views = viewsRaw ? parseInt(viewsRaw, 10) : 0;

      if (!title || !href) return;

      stubs.push({ url, title, thumbUrl: thumb, durationText: durText, durationSeconds: durSecs, views });
    } catch {
      // skip malformed card
    }
  });

  return stubs;
}

async function scrapeVideoPage(stub: VideoStub): Promise<PfVideoInsert | null> {
  const html = await fetchHtml(stub.url);
  if (!html) return null;

  const $ = load(html);

  // Extract video ID from URL: /hdporn/{id}/title
  const idMatch = stub.url.match(/\/hdporn\/([a-zA-Z0-9_-]+)/);
  const videoId = idMatch?.[1] ?? "";
  if (!videoId) return null;

  // Quality: look for resolution labels in source list or quality menu
  const qualityLabels: string[] = [];
  $("[data-res], .quality-item, .btn-quality, option[value], .source-item").each((_, el) => {
    const text = ($(el).attr("data-res") || $(el).text()).toLowerCase().trim();
    if (text.includes("4k") || text.includes("2160")) qualityLabels.push("4k");
    else if (text.includes("2k") || text.includes("1440")) qualityLabels.push("2k");
    else if (text.includes("1080")) qualityLabels.push("1080p");
  });

  // Also scan all text for quality hints
  const bodyText = $("body").text().toLowerCase();
  if (!qualityLabels.length) {
    if (bodyText.includes("4k") || bodyText.includes("2160p")) qualityLabels.push("4k");
    else if (bodyText.includes("2k") || bodyText.includes("1440p")) qualityLabels.push("2k");
    else if (bodyText.includes("1080p")) qualityLabels.push("1080p");
  }

  const hasAcceptableQuality = qualityLabels.some((q) => QUALITY_ACCEPT.has(q));
  if (!hasAcceptableQuality) {
    logger.debug({ url: stub.url, qualityLabels }, "Scraper: filtered — no premium quality");
    return null;
  }

  const qualityLabel = qualityLabels.includes("4k")
    ? "4K"
    : qualityLabels.includes("2k")
      ? "2K"
      : "1080p";

  // Studio
  const studioRaw = (
    $(".studio a, .studio, [class*='studio'], .pornstar-studio a, .cat-studio").first().text() ||
    $("a[href*='/studio/']").first().text() ||
    ""
  )
    .trim()
    .toLowerCase();

  const studioNormalized = Array.from(STUDIO_WHITELIST).find(
    (s) => studioRaw.includes(s) || s.includes(studioRaw)
  );

  if (!studioNormalized) {
    logger.debug({ url: stub.url, studioRaw }, "Scraper: filtered — studio not in whitelist");
    return null;
  }

  // Tags / categories
  const tags: string[] = [];
  $(".tag a, .tags a, .category a, [class*='tag'] a, [class*='cat'] a").each((_, el) => {
    const t = $(el).text().trim().toLowerCase();
    if (t && t.length < 40) tags.push(t);
  });

  // Pornstars
  const pornstars: string[] = [];
  $(".pornstar a, [class*='pornstar'] a, .model a, [class*='model'] a, [class*='actress'] a").each(
    (_, el) => {
      const n = $(el).text().trim();
      if (n && n.length < 60) pornstars.push(n);
    }
  );

  // Description
  const description =
    $(".video-description, .description, [class*='desc']").first().text().trim() ||
    `Full-length premium studio release from ${studioNormalized}.`;

  // Thumbnail
  const thumbnailUrl =
    stub.thumbUrl ||
    $("meta[property='og:image']").attr("content") ||
    $("video[poster]").attr("poster") ||
    "";

  // Embed URL — HQporner embed pattern
  const embedUrl = `${BASE}/embed/${videoId}/`;

  const slug = slugify(stub.title, videoId);
  const category = resolveCategory(tags);

  // Title-case studio
  const studioDisplay = studioNormalized
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    slug,
    title: stub.title,
    description,
    embedUrl,
    thumbnailUrl,
    durationSeconds: stub.durationSeconds,
    durationText: stub.durationText || null,
    views: stub.views || 0,
    likes: 0,
    qualityLabel,
    category,
    studio: studioDisplay,
    tags,
    pornstars,
    status: "published",
  };
}

async function batchUpsert(rows: PfVideoInsert[]) {
  if (!rows.length) return;
  const db = getPfDb();
  // Split into chunks of 50
  for (let i = 0; i < rows.length; i += 50) {
    const chunk = rows.slice(i, i + 50);
    try {
      await db
        .insert(pfVideosTable)
        .values(chunk)
        .onConflictDoUpdate({
          target: pfVideosTable.slug,
          set: {
            thumbnailUrl: sql`EXCLUDED.thumbnail_url`,
            views: sql`EXCLUDED.views`,
            qualityLabel: sql`EXCLUDED.quality_label`,
            updatedAt: sql`NOW()`,
          },
        });
      logger.info({ count: chunk.length }, "Scraper: upserted batch");
    } catch (err) {
      logger.error({ err }, "Scraper: upsert batch failed");
    }
  }
}

export async function runScraper(): Promise<void> {
  logger.info("Scraper: starting HQporner ingestion run");

  const pages = [
    `${BASE}/`,
    `${BASE}/latest/`,
    `${BASE}/most-viewed/`,
    `${BASE}/page/2/`,
    `${BASE}/page/3/`,
  ];

  const results: PfVideoInsert[] = [];

  for (const pageUrl of pages) {
    const stubs = await scrapeListingPage(pageUrl);
    logger.info({ page: pageUrl, count: stubs.length }, "Scraper: listing page scraped");

    // Filter by minimum duration early (skip video-page fetch for short clips)
    const candidates = stubs.filter((s) => {
      if (s.durationSeconds > 0 && s.durationSeconds < 900) {
        logger.debug({ title: s.title, dur: s.durationSeconds }, "Scraper: filtered — too short");
        return false;
      }
      return true;
    });

    for (const stub of candidates) {
      await delay(200);
      try {
        const video = await scrapeVideoPage(stub);
        if (!video) continue;
        // Re-check duration after full scrape (may have been refined)
        if ((video.durationSeconds ?? 0) < 900) {
          logger.debug({ slug: video.slug }, "Scraper: filtered after detail fetch — too short");
          continue;
        }
        results.push(video);
      } catch (err) {
        logger.warn({ url: stub.url, err }, "Scraper: error on video page, skipping");
      }
    }

    await delay(500);
  }

  logger.info({ total: results.length }, "Scraper: ingestion complete, starting upsert");
  await batchUpsert(results);
}

let _daemonTimer: ReturnType<typeof setTimeout> | null = null;

export function startScraperDaemon(): void {
  const INTERVAL_MS = 3 * 60 * 60 * 1000; // 3 hours

  async function tick() {
    try {
      await runScraper();
    } catch (err) {
      logger.error({ err }, "Scraper daemon: unhandled error");
    }
    _daemonTimer = setTimeout(tick, INTERVAL_MS);
  }

  // First run after 30s to let the server warm up
  _daemonTimer = setTimeout(tick, 30_000);
  logger.info({ intervalHours: 3 }, "Scraper daemon: scheduled");
}
