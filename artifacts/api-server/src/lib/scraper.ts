import { load } from "cheerio";
import { sql } from "drizzle-orm";
import { logger } from "./logger";
import { getPfDb, pfVideosTable } from "./pfDb";
import type { PfVideoInsert } from "@workspace/db/schema";

const BASE = "https://hqporner.com";
const CDN = "https:"; // thumbnails start with //fastporndelivery.hqporner.com

const STUDIO_WHITELIST: Record<string, string> = {
  brazzers: "Brazzers",
  blacked: "BLACKED",
  tushy: "TUSHY",
  mylf: "MYLF",
  "team skeet": "Team Skeet",
  bangbros: "Bangbros",
  nubiles: "Nubiles",
  "reality kings": "Reality Kings",
  mofos: "Mofos",
  "naughty america": "Naughty America",
  "digital playground": "Digital Playground",
};

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
  bigass: "big ass",
  creampie: "creampie",
  threesome: "threesome",
  stepmom: "stepmom",
  "step-mom": "stepmom",
  cosplay: "cosplay",
  public: "public",
};

const QUALITY_ACCEPT = new Set(["1080p", "2k", "4k"]);

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Sec-Ch-Ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "same-origin",
  Referer: BASE,
  Connection: "keep-alive",
};

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Parse HQporner duration format: "20m 1s", "49m 15s", "1h 3m 42s"
 */
function parseDuration(text: string): number {
  let secs = 0;
  const h = text.match(/(\d+)h/);
  const m = text.match(/(\d+)m/);
  const s = text.match(/(\d+)s/);
  if (h) secs += parseInt(h[1], 10) * 3600;
  if (m) secs += parseInt(m[1], 10) * 60;
  if (s) secs += parseInt(s[1], 10);
  return secs;
}

/**
 * Format duration seconds back to text like "34:45" or "1:03:42"
 */
function formatDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

function resolveCategory(tags: string[]): string {
  for (const tag of tags) {
    const key = tag.toLowerCase().trim();
    if (CATEGORY_MAP[key]) return CATEGORY_MAP[key];
    // partial match
    for (const [pattern, cat] of Object.entries(CATEGORY_MAP)) {
      if (key.includes(pattern)) return cat;
    }
  }
  return "amateur";
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

function absoluteUrl(src: string): string {
  if (!src) return "";
  if (src.startsWith("//")) return CDN + src;
  if (src.startsWith("http")) return src;
  return BASE + src;
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
  videoId: string;
  studioKey: string;
}

/**
 * Parse the HQporner listing page.
 * Each video card is <section class="box feature"> inside a <div class="6u">.
 * The video link is <a href="/hdporn/ID-slug.html">.
 * Thumbnail: <img id="cover_ID" src="//cdn/..." alt="title" />.
 * Duration: <span class="icon fa-clock-o meta-data">20m 1s</span>.
 */
async function scrapeListingPage(pageUrl: string, studioKey: string): Promise<VideoStub[]> {
  const html = await fetchHtml(pageUrl);
  if (!html) return [];

  const $ = load(html);
  const stubs: VideoStub[] = [];
  const seen = new Set<string>();

  // All video links match /hdporn/{id}-{slug}.html
  $("a[href*='/hdporn/']").each((_, el) => {
    try {
      const href = $(el).attr("href") ?? "";
      if (!href.includes("/hdporn/")) return;

      // Extract video ID from href
      const idMatch = href.match(/\/hdporn\/(\d+)-/);
      if (!idMatch?.[1]) return;
      const videoId = idMatch[1];
      if (seen.has(videoId)) return;
      seen.add(videoId);

      const url = absoluteUrl(href);

      // Find thumbnail: img with id="cover_{ID}"
      const imgEl = $(`img#cover_${videoId}`);
      const thumbSrc = imgEl.attr("src") ?? imgEl.attr("data-src") ?? "";
      const thumbUrl = absoluteUrl(thumbSrc);
      const title = (imgEl.attr("alt") ?? "").trim();

      if (!title) return;

      // Find duration: look for .fa-clock-o in the nearest parent section
      const section = $(el).closest("section.box.feature, div.6u");
      const durText = section.find(".fa-clock-o").first().text().trim() ||
        section.find("[class*='clock']").first().text().trim();
      const durSecs = parseDuration(durText);

      stubs.push({ url, title, thumbUrl, durationText: durText, durationSeconds: durSecs, videoId, studioKey });
    } catch {
      // skip malformed card
    }
  });

  logger.info({ page: pageUrl, count: stubs.length }, "Scraper: listing page scraped");
  return stubs;
}

/**
 * Parse the HQporner video detail page.
 * Embed: .videoWrapper iframe[src].
 * Quality: look for "1080p", "2k", "4k" in category tag links or keywords meta.
 * Tags: a.tag-link links.
 * Pornstars: a[href*="/actress/"].
 */
async function scrapeVideoPage(stub: VideoStub): Promise<PfVideoInsert | null> {
  const html = await fetchHtml(stub.url);
  if (!html) return null;

  const $ = load(html);

  // ── Embed URL ─────────────────────────────────────────────────────────────
  const embedSrc =
    $(".videoWrapper iframe").first().attr("src") ??
    $(".video-container iframe").first().attr("src") ??
    $("iframe[src*='mydaddy.cc'], iframe[src*='hqporner.com/embed']").first().attr("src") ??
    "";
  const embedUrl = absoluteUrl(embedSrc);
  if (!embedUrl) {
    logger.debug({ url: stub.url }, "Scraper: no embed URL found, skipping");
    return null;
  }

  // ── Quality ────────────────────────────────────────────────────────────────
  // Check category tag links: <a href="/category/1080p-porn">1080p</a>
  const qualityLabels: string[] = [];
  $("a.tag-link").each((_, el) => {
    const text = $(el).text().toLowerCase().trim();
    const href = ($(el).attr("href") ?? "").toLowerCase();
    if (text === "4k" || href.includes("4k")) qualityLabels.push("4k");
    else if (text === "2k" || href.includes("2k")) qualityLabels.push("2k");
    else if (text === "1080p" || href.includes("1080p")) qualityLabels.push("1080p");
  });

  // Also check the keywords meta tag
  if (!qualityLabels.length) {
    const keywords = ($("meta[name='keywords']").attr("content") ?? "").toLowerCase();
    if (keywords.includes("4k")) qualityLabels.push("4k");
    else if (keywords.includes("2k") || keywords.includes("1440p")) qualityLabels.push("2k");
    else if (keywords.includes("1080p")) qualityLabels.push("1080p");
  }

  const hasAcceptableQuality = qualityLabels.some((q) => QUALITY_ACCEPT.has(q));
  if (!hasAcceptableQuality) {
    logger.debug({ url: stub.url, qualityLabels }, "Scraper: filtered — no premium quality");
    return null;
  }
  const qualityLabel = qualityLabels.includes("4k") ? "4K" : qualityLabels.includes("2k") ? "2K" : "1080p";

  // ── Tags ───────────────────────────────────────────────────────────────────
  const tags: string[] = [];
  const skipTags = new Set(["1080p", "4k", "2k", "720p", "480p", "hd"]);
  $("a.tag-link[href*='/category/']").each((_, el) => {
    const t = $(el).text().toLowerCase().trim();
    if (t && !skipTags.has(t) && t.length < 40) tags.push(t);
  });

  // ── Pornstars ─────────────────────────────────────────────────────────────
  const pornstars: string[] = [];
  $("a[href*='/actress/']").each((_, el) => {
    const n = $(el).text().trim();
    if (n && n.length < 60) pornstars.push(n);
  });

  // ── Studio ────────────────────────────────────────────────────────────────
  const studioDisplay = STUDIO_WHITELIST[stub.studioKey] ?? "";
  if (!studioDisplay) {
    logger.debug({ url: stub.url, studioKey: stub.studioKey }, "Scraper: unknown studio, skipping");
    return null;
  }

  // ── Thumbnail (prefer detail page OG image if listing thumb missing) ───────
  const thumbnailUrl =
    stub.thumbUrl ||
    absoluteUrl($("meta[property='og:image']").attr("content") ?? "") ||
    "";
  if (!thumbnailUrl) {
    logger.debug({ url: stub.url }, "Scraper: no thumbnail, skipping");
    return null;
  }

  // ── Category ──────────────────────────────────────────────────────────────
  const category = resolveCategory(tags);

  // ── Description ───────────────────────────────────────────────────────────
  const description =
    $("meta[name='description']").attr("content")?.trim() ||
    `Full-length ${qualityLabel} studio release from ${studioDisplay}.`;

  const slug = slugify(stub.title, stub.videoId);
  const durationText = stub.durationText || formatDuration(stub.durationSeconds);

  return {
    slug,
    title: stub.title,
    description,
    embedUrl,
    thumbnailUrl,
    durationSeconds: stub.durationSeconds,
    durationText,
    views: 0,
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
            embedUrl: sql`EXCLUDED.embed_url`,
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

  // Build pages to scrape: one search per studio × 2 pages each
  const pages: Array<{ url: string; studioKey: string }> = [];
  for (const studioKey of Object.keys(STUDIO_WHITELIST)) {
    const q = encodeURIComponent(studioKey);
    pages.push({ url: `${BASE}/?q=${q}`, studioKey });
    pages.push({ url: `${BASE}/?q=${q}&page=2`, studioKey });
  }

  const results: PfVideoInsert[] = [];

  for (const { url: pageUrl, studioKey } of pages) {
    const stubs = await scrapeListingPage(pageUrl, studioKey);

    // Filter by minimum duration (saves video-page fetches for obvious short clips)
    const candidates = stubs.filter((s) => {
      if (s.durationSeconds > 0 && s.durationSeconds < 900) {
        logger.debug({ title: s.title, dur: s.durationSeconds }, "Scraper: filtered — too short");
        return false;
      }
      return true;
    });

    for (const stub of candidates) {
      await delay(250);
      try {
        const video = await scrapeVideoPage(stub);
        if (!video) continue;
        if ((video.durationSeconds ?? 0) < 900) {
          logger.debug({ slug: video.slug }, "Scraper: filtered — too short after detail");
          continue;
        }
        results.push(video);
        logger.debug({ slug: video.slug, studio: video.studio }, "Scraper: video accepted");
      } catch (err) {
        logger.warn({ url: stub.url, err }, "Scraper: error on video page, skipping");
      }
    }

    await delay(600);
  }

  logger.info({ total: results.length }, "Scraper: ingestion complete, starting upsert");
  await batchUpsert(results);
  logger.info("Scraper: run finished");
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

  // First run 30s after server boot
  _daemonTimer = setTimeout(tick, 30_000);
  logger.info({ intervalHours: 3 }, "Scraper daemon: scheduled");
}
