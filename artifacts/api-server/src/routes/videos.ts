import { Router } from "express";
import { db } from "../db/index.js";
import { ListVideosQueryParams, GetVideoBySlugParams, IncrementViewParams, SubmitVideoBody } from "@workspace/api-zod";

const router = Router();

function parseVideo(row: any) {
  if (!row) return null;
  return {
    ...row,
    is_editor_pick: row.is_editor_pick === 1 || row.is_editor_pick === true,
    tags: (() => { try { return JSON.parse(row.tags || "[]"); } catch { return []; } })(),
    performers: (() => { try { return JSON.parse(row.performers || "[]"); } catch { return []; } })(),
  };
}

// GET /api/videos
router.get("/", (req, res) => {
  const { limit = "24", offset = "0", category, source, order = "trending", q } = req.query as Record<string, string>;
  const lim = Math.min(parseInt(limit, 10) || 24, 100);
  const off = parseInt(offset, 10) || 0;

  let sql = `SELECT v.*, c.name as category_name FROM videos v LEFT JOIN categories c ON v.category_id = c.id WHERE v.status = 'published'`;
  const params: any[] = [];

  if (category) { sql += ` AND c.slug = ?`; params.push(category); }
  if (source) { sql += ` AND v.source = ?`; params.push(source); }
  if (q) { sql += ` AND (v.title LIKE ? OR v.tags LIKE ?)`; params.push(`%${q}%`, `%${q}%`); }

  const orderMap: Record<string, string> = {
    trending: "v.trending_score DESC",
    views: "v.views_count DESC",
    recent: "v.published_at DESC",
    random: "RANDOM()",
  };
  sql += ` ORDER BY ${orderMap[order] || "v.trending_score DESC"} LIMIT ? OFFSET ?`;
  params.push(lim, off);

  const rows = db.prepare(sql).all(...params);
  res.json(rows.map(parseVideo));
});

// GET /api/videos/featured
router.get("/featured", (req, res) => {
  const limit = Math.min(parseInt((req.query.limit as string) || "10", 10), 20);
  const rows = db.prepare(`
    SELECT v.*, c.name as category_name FROM videos v
    LEFT JOIN categories c ON v.category_id = c.id
    WHERE v.status = 'published'
    ORDER BY v.trending_score DESC LIMIT ?
  `).all(limit);
  res.json(rows.map(parseVideo));
});

// GET /api/videos/top
router.get("/top", (req, res) => {
  const limit = Math.min(parseInt((req.query.limit as string) || "10", 10), 20);
  const rows = db.prepare(`
    SELECT v.*, c.name as category_name FROM videos v
    LEFT JOIN categories c ON v.category_id = c.id
    WHERE v.status = 'published'
    ORDER BY v.views_count DESC LIMIT ?
  `).all(limit);
  res.json(rows.map(parseVideo));
});

// GET /api/videos/submit (must be before /:slug)
router.post("/submit", (req, res) => {
  const body = SubmitVideoBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const { title, embed_code, description = "", thumbnail_url = "" } = body.data;
  const userId = (req as any).userId ?? null;

  // Parse embed code to extract URL/source
  let embedUrl = embed_code;
  let source = "user";
  if (embed_code.includes("eporner.com")) source = "eporner";
  else if (embed_code.includes("pornhub.com")) source = "pornhub";
  else if (embed_code.includes("redtube.com")) source = "redtube";
  const srcMatch = embed_code.match(/src=["']([^"']+)["']/);
  if (srcMatch) embedUrl = srcMatch[1];

  const slug = title.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").substring(0, 60) + "-" + Date.now();
  const result = db.prepare(`
    INSERT INTO videos (slug, title, description, thumbnail_url, embed_url, source, status, submitter_id)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
  `).run(slug, title.trim().substring(0, 200), description, thumbnail_url, embedUrl, source, userId);

  const row = db.prepare("SELECT * FROM videos WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(parseVideo(row));
});

// GET /api/videos/:slug
router.get("/:slug", (req, res) => {
  const { slug } = req.params;
  const row = db.prepare(`
    SELECT v.*, c.name as category_name FROM videos v
    LEFT JOIN categories c ON v.category_id = c.id
    WHERE v.slug = ? AND v.status = 'published'
  `).get(slug);
  if (!row) { res.status(404).json({ error: "Video not found" }); return; }
  res.json(parseVideo(row));
});

// POST /api/videos/:id/view
router.post("/:id/view", (req, res) => {
  const id = parseInt(req.params.id, 10);
  db.prepare("UPDATE videos SET views_count = views_count + 1 WHERE id = ?").run(id);
  db.prepare("INSERT INTO video_views (video_id) VALUES (?)").run(id);
  res.json({ ok: true });
});

export default router;
