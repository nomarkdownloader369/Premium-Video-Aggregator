import { Router } from "express";
import { db } from "../db/index.js";

const router = Router();

function parseVideo(row: any) {
  if (!row) return null;
  return {
    ...row,
    is_editor_pick: row.is_editor_pick === 1,
    tags: (() => { try { return JSON.parse(row.tags || "[]"); } catch { return []; } })(),
    performers: (() => { try { return JSON.parse(row.performers || "[]"); } catch { return []; } })(),
  };
}

// GET /api/performers?name=...
router.get("/", (req, res) => {
  const name = ((req.query.name as string) || "").trim();
  const limit = Math.min(parseInt((req.query.limit as string) || "24", 10), 100);
  const offset = parseInt((req.query.offset as string) || "0", 10);

  if (!name) { res.status(400).json({ error: "name is required" }); return; }

  const rows = db.prepare(`
    SELECT v.*, c.name as category_name FROM videos v
    LEFT JOIN categories c ON v.category_id = c.id
    WHERE v.performers LIKE ? AND v.status = 'published'
    ORDER BY v.trending_score DESC LIMIT ? OFFSET ?
  `).all(`%${name}%`, limit, offset) as any[];

  // Filter to exact performer match
  const videos = rows
    .map(parseVideo)
    .filter((v) => v && (v.performers as string[]).some((p: string) => p.toLowerCase() === name.toLowerCase()));

  res.json({
    name,
    videos,
    total: videos.length,
  });
});

// GET /api/studios?name=...
router.get("/studios", (req, res) => {
  const name = ((req.query.name as string) || "").trim();
  const limit = Math.min(parseInt((req.query.limit as string) || "24", 10), 100);
  const offset = parseInt((req.query.offset as string) || "0", 10);

  if (!name) { res.status(400).json({ error: "name is required" }); return; }

  const rows = db.prepare(`
    SELECT v.*, c.name as category_name FROM videos v
    LEFT JOIN categories c ON v.category_id = c.id
    WHERE v.studio LIKE ? AND v.status = 'published'
    ORDER BY v.trending_score DESC LIMIT ? OFFSET ?
  `).all(`%${name}%`, limit, offset) as any[];

  res.json({
    name,
    videos: rows.map(parseVideo),
    total: rows.length,
  });
});

export default router;
