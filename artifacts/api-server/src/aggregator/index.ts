import { db } from "../db/index.js";
import { logger } from "../lib/logger.js";

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
};

function cleanTitle(title: string): string {
  if (!title) return "";
  return title
    .replace(/[^\x20-\x7E\u00C0-\u024F]/g, " ")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .replace(/[<>{}|\[\]\\^`]/g, "")
    .trim()
    .substring(0, 200);
}

function normalizeDuration(val: string | number | null | undefined): number | null {
  if (!val) return null;
  if (typeof val === "number") return Math.floor(val);
  if (typeof val === "string") {
    if (val.includes(":")) {
      const parts = val.split(":").map(Number);
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    const n = parseInt(val, 10);
    return isNaN(n) ? null : n;
  }
  return null;
}

function slugify(title: string, id: string | number): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 60)
      .replace(/^-|-$/g, "") +
    "-" +
    id
  );
}

function getEmbedUrl(source: string, externalId: string): string {
  switch (source) {
    case "eporner":
      return `https://www.eporner.com/embed/${externalId}`;
    case "pornhub":
      return `https://www.pornhub.com/embed/${externalId}`;
    case "redtube":
      return `https://embed.redtube.com/?id=${externalId}`;
    default:
      return "";
  }
}

function getCategory(tags: string[]): number | null {
  const TAG_MAP: Record<string, string> = {
    milf: "milf", amateur: "amateur", pov: "pov", teen: "teen",
    anal: "anal", lesbian: "lesbians", lesbians: "lesbians",
    "big tits": "big-tits", blowjob: "blowjob", bj: "blowjob",
    threesome: "threesome", bbw: "bbw", interracial: "interracial",
    asian: "asian", latina: "latina", ebony: "ebony", blonde: "blonde",
    brunette: "brunette", redhead: "redhead", squirt: "squirting",
    squirting: "squirting", cumshot: "cumshots", facial: "facial",
    gangbang: "gangbang", hardcore: "hardcore", solo: "solo",
    mature: "mature", massage: "massage", outdoor: "outdoor",
    japanese: "japanese", indian: "indian", hentai: "hentai",
    anime: "anime", bdsm: "bdsm", feet: "feet",
  };
  for (const t of tags) {
    const lower = t.toLowerCase();
    for (const [key, slug] of Object.entries(TAG_MAP)) {
      if (lower.includes(key)) {
        const cat = db.prepare("SELECT id FROM categories WHERE slug = ?").get(slug) as { id: number } | undefined;
        if (cat) return cat.id;
      }
    }
  }
  return null;
}

async function fetchEporner(page = 1) {
  try {
    const url = `https://www.eporner.com/api/v2/video/search/?query=&order=top-weekly&per_page=50&page=${page}&thumbsize=big&format=json`;
    const res = await fetch(url, { headers: BROWSER_HEADERS });
    if (!res.ok) return [];
    const data = await res.json() as { videos?: any[] };
    return (data.videos ?? []).map((v: any) => ({
      external_id: v.id,
      source: "eporner",
      title: cleanTitle(v.title),
      thumbnail_url: v.thumbs?.[2]?.src || v.default_thumb?.src || "",
      duration_seconds: normalizeDuration(v.length_sec),
      views_count: parseInt(v.views, 10) || 0,
      tags: (v.keywords ?? "").split(",").map((t: string) => t.trim()).filter(Boolean),
      embed_url: getEmbedUrl("eporner", v.id),
    }));
  } catch (e) {
    logger.error({ err: e }, "Eporner fetch failed");
    return [];
  }
}

async function fetchPornhub(page = 1) {
  try {
    const url = `https://www.pornhub.com/webmasters/search?search=&ordering=mostviewed&period=weekly&page=${page}&thumbsize=large_hd`;
    const res = await fetch(url, { headers: BROWSER_HEADERS });
    if (!res.ok) return [];
    const data = await res.json() as { videos?: any[] };
    return (data.videos ?? []).map((v: any) => ({
      external_id: v.video_id || v.id,
      source: "pornhub",
      title: cleanTitle(v.title),
      thumbnail_url: v.thumb || v.thumbnail_url || "",
      duration_seconds: normalizeDuration(v.duration),
      views_count: parseInt(v.views, 10) || 0,
      tags: (v.tags ?? []).map((t: any) => typeof t === "string" ? t : t.tag_name).filter(Boolean),
      embed_url: getEmbedUrl("pornhub", v.video_id || v.id),
    }));
  } catch (e) {
    logger.error({ err: e }, "Pornhub fetch failed");
    return [];
  }
}

async function fetchRedtube(page = 1) {
  try {
    const url = `https://api.redtube.com/?data=redtube.Videos.searchVideos&output=json&search=&ordering=mostviewed&period=weekly&thumbsize=big&page=${page}&limit=50`;
    const res = await fetch(url, { headers: BROWSER_HEADERS });
    if (!res.ok) return [];
    const data = await res.json() as { videos?: any[] };
    return (data.videos ?? []).map((item: any) => {
      const v = item.video ?? item;
      return {
        external_id: String(v.video_id || v.id),
        source: "redtube",
        title: cleanTitle(v.title),
        thumbnail_url: v.thumb || v.default_thumb || "",
        duration_seconds: normalizeDuration(v.duration),
        views_count: parseInt(v.views, 10) || 0,
        tags: (v.tags ?? []).map((t: any) => typeof t === "string" ? t : t.tag_name).filter(Boolean),
        embed_url: getEmbedUrl("redtube", String(v.video_id || v.id)),
      };
    });
  } catch (e) {
    logger.error({ err: e }, "Redtube fetch failed");
    return [];
  }
}

const insertVideo = db.prepare(`
  INSERT OR IGNORE INTO videos
    (slug, title, description, thumbnail_url, embed_url, external_id, source, duration_seconds, category_id, status, views_count, likes_count, trending_score, tags, performers, published_at)
  VALUES
    (@slug, @title, @description, @thumbnail_url, @embed_url, @external_id, @source, @duration_seconds, @category_id, 'published', @views_count, 0, @trending_score, @tags, '[]', datetime('now'))
`);

function ingestVideos(videos: any[]) {
  const tx = db.transaction((items: any[]) => {
    let inserted = 0;
    for (const v of items) {
      if (!v.title || !v.external_id) continue;
      const catId = getCategory(v.tags);
      const slug = slugify(v.title, v.external_id);
      const trending = v.views_count * 0.7 + Math.random() * 1000;
      try {
        const result = insertVideo.run({
          slug,
          title: v.title,
          description: null,
          thumbnail_url: v.thumbnail_url,
          embed_url: v.embed_url,
          external_id: v.external_id,
          source: v.source,
          duration_seconds: v.duration_seconds,
          category_id: catId,
          views_count: v.views_count,
          trending_score: trending,
          tags: JSON.stringify(v.tags.slice(0, 20)),
        });
        if (result.changes > 0) inserted++;
      } catch (_) {}
    }
    return inserted;
  });
  return tx(videos);
}

export async function runAggregator() {
  logger.info("Aggregator: starting multi-source ingestion");
  const [eporner, pornhub, redtube] = await Promise.all([
    fetchEporner(1),
    fetchPornhub(1),
    fetchRedtube(1),
  ]);
  const all = [...eporner, ...pornhub, ...redtube];
  // Shuffle to blend sources
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  const inserted = ingestVideos(all);
  logger.info({ inserted, total: all.length }, "Aggregator: ingestion complete");
  // Update trending scores
  db.exec(`
    UPDATE videos SET trending_score = (views_count * 0.7 + likes_count * 2)
    * (1.0 / (1 + (julianday('now') - julianday(published_at)) * 0.1))
    WHERE status = 'published'
  `);
}

export function startAggregatorLoop() {
  const INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
  runAggregator().catch((e) => logger.error({ err: e }, "Aggregator error"));
  setInterval(() => {
    runAggregator().catch((e) => logger.error({ err: e }, "Aggregator error"));
  }, INTERVAL_MS);
  logger.info("Aggregator: loop started (every 30 min)");
}
