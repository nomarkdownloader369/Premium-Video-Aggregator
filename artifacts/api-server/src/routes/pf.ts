import { Router } from "express";
import { eq, ilike, or, sql, desc, asc, and } from "drizzle-orm";
import { getPfDb, pfVideosTable } from "../lib/pfDb";
import { runScraper } from "../lib/scraper";
import { logger } from "../lib/logger";

const router = Router();

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatViews(n: number | null): string {
  const v = n ?? 0;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

function toFrontendVideo(row: typeof pfVideosTable.$inferSelect) {
  const quality =
    row.qualityLabel?.toUpperCase() === "4K"
      ? "4K"
      : row.qualityLabel?.includes("2K")
        ? "1080p"
        : "1080p";
  return {
    slug: row.slug,
    title: row.title,
    studio: row.studio ?? "Unknown",
    stars: row.pornstars ?? [],
    year: new Date(row.createdAt).getFullYear(),
    duration: row.durationText ?? "00:00",
    views: formatViews(row.views),
    quality: quality as "4K" | "1080p" | "HD",
    description:
      row.description ??
      "A meticulously produced full-length feature shot on cinema-grade cameras.",
    thumbSeed: row.thumbnailUrl,
    thumbnailUrl: row.thumbnailUrl,
    embedUrl: row.embedUrl,
    tags: row.tags ?? [],
    category: row.category ?? "amateur",
  };
}

// ─── GET /api/pf/videos ──────────────────────────────────────────────────────
router.get("/videos", async (req, res) => {
  try {
    const db = getPfDb();
    const page = Math.max(1, parseInt(String(req.query["page"] ?? "1"), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query["limit"] ?? "24"), 10)));
    const offset = (page - 1) * limit;
    const sort = String(req.query["sort"] ?? "new");
    const q = req.query["q"] ? String(req.query["q"]) : null;
    const category = req.query["category"] ? String(req.query["category"]) : null;
    const studio = req.query["studio"] ? String(req.query["studio"]) : null;
    const pornstar = req.query["pornstar"] ? String(req.query["pornstar"]) : null;

    const conditions = [eq(pfVideosTable.status, "published")];

    if (q) {
      conditions.push(
        or(
          ilike(pfVideosTable.title, `%${q}%`),
          ilike(pfVideosTable.studio, `%${q}%`)
        )!
      );
    }
    if (category) conditions.push(eq(pfVideosTable.category, category));
    if (studio) conditions.push(ilike(pfVideosTable.studio, `%${studio}%`));
    if (pornstar) {
      conditions.push(
        sql`${pfVideosTable.pornstars} @> ARRAY[${pornstar}]::text[]`
      );
    }

    const orderBy =
      sort === "views"
        ? desc(pfVideosTable.views)
        : sort === "top"
          ? desc(pfVideosTable.likes)
          : desc(pfVideosTable.createdAt);

    const rows = await db
      .select()
      .from(pfVideosTable)
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    res.json(rows.map(toFrontendVideo));
  } catch (err) {
    req.log.error({ err }, "GET /pf/videos error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/pf/videos/:slug ────────────────────────────────────────────────
router.get("/videos/:slug", async (req, res) => {
  try {
    const db = getPfDb();
    const rows = await db
      .select()
      .from(pfVideosTable)
      .where(eq(pfVideosTable.slug, req.params["slug"] ?? ""))
      .limit(1);

    if (!rows.length) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(toFrontendVideo(rows[0]!));
  } catch (err) {
    req.log.error({ err }, "GET /pf/videos/:slug error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/pf/browse/studios ──────────────────────────────────────────────
router.get("/browse/studios", async (req, res) => {
  try {
    const db = getPfDb();
    const rows = await db.execute(sql`
      SELECT
        studio,
        COUNT(*)::int AS video_count,
        (
          SELECT thumbnail_url
          FROM pf_videos v2
          WHERE v2.studio = pf_videos.studio
            AND v2.status = 'published'
          ORDER BY v2.views DESC
          LIMIT 1
        ) AS top_thumbnail
      FROM pf_videos
      WHERE status = 'published' AND studio IS NOT NULL
      GROUP BY studio
      ORDER BY video_count DESC
    `);
    res.json(rows.rows);
  } catch (err) {
    req.log.error({ err }, "GET /pf/browse/studios error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/pf/browse/pornstars ────────────────────────────────────────────
router.get("/browse/pornstars", async (req, res) => {
  try {
    const db = getPfDb();
    const rows = await db.execute(sql`
      SELECT
        pornstar,
        COUNT(*)::int AS video_count,
        SUM(views)::int AS total_views,
        (
          SELECT thumbnail_url
          FROM pf_videos v2
          WHERE v2.pornstars @> ARRAY[pornstar]::text[]
            AND v2.status = 'published'
          ORDER BY v2.views DESC
          LIMIT 1
        ) AS top_thumbnail
      FROM pf_videos, unnest(pornstars) AS pornstar
      WHERE status = 'published'
      GROUP BY pornstar
      ORDER BY total_views DESC
      LIMIT 100
    `);
    res.json(rows.rows);
  } catch (err) {
    req.log.error({ err }, "GET /pf/browse/pornstars error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/pf/browse/categories ───────────────────────────────────────────
router.get("/browse/categories", async (req, res) => {
  try {
    const db = getPfDb();
    const rows = await db.execute(sql`
      SELECT category, COUNT(*)::int AS video_count
      FROM pf_videos
      WHERE status = 'published' AND category IS NOT NULL
      GROUP BY category
      ORDER BY video_count DESC
    `);
    const cats = (rows.rows as { category: string }[]).map((r) => r.category);
    res.json(cats.length ? cats : [
      "amateur","milf","anal","lesbian","teen","pov","interracial",
      "blowjob","big tits","creampie","threesome","stepmom","cosplay","public"
    ]);
  } catch (err) {
    req.log.error({ err }, "GET /pf/browse/categories error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/pf/cron/scrape-hq ─────────────────────────────────────────────
router.get("/cron/scrape-hq", async (req, res) => {
  res.json({ ok: true, message: "Scraper triggered — running in background" });
  // Fire and forget
  runScraper().catch((err) => logger.error({ err }, "Cron scrape error"));
});

export default router;
