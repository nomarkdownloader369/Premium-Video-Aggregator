import { Router } from "express";
import { db } from "../db/index.js";
import { verifyToken } from "./auth.js";

const router = Router();

function requireAdmin(req: any, res: any): boolean {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) { res.status(401).json({ error: "Unauthorized" }); return false; }
  const payload = verifyToken(auth.slice(7));
  if (!payload || payload.role !== "admin") { res.status(403).json({ error: "Forbidden" }); return false; }
  req.userId = payload.userId;
  return true;
}

function parseVideo(row: any) {
  if (!row) return null;
  return {
    ...row,
    is_editor_pick: row.is_editor_pick === 1,
    tags: (() => { try { return JSON.parse(row.tags || "[]"); } catch { return []; } })(),
    performers: (() => { try { return JSON.parse(row.performers || "[]"); } catch { return []; } })(),
  };
}

// GET /api/admin/videos
router.get("/videos", (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { limit = "50", offset = "0", status, q } = req.query as Record<string, string>;
  const lim = Math.min(parseInt(limit, 10) || 50, 200);
  const off = parseInt(offset, 10) || 0;
  let sql = `SELECT v.*, c.name as category_name FROM videos v LEFT JOIN categories c ON v.category_id = c.id WHERE 1=1`;
  const params: any[] = [];
  if (status) { sql += ` AND v.status = ?`; params.push(status); }
  if (q) { sql += ` AND v.title LIKE ?`; params.push(`%${q}%`); }
  sql += ` ORDER BY v.created_at DESC LIMIT ? OFFSET ?`;
  params.push(lim, off);
  const rows = db.prepare(sql).all(...params);
  res.json(rows.map(parseVideo));
});

// PATCH /api/admin/videos/:id
router.patch("/videos/:id", (req, res) => {
  if (!requireAdmin(req, res)) return;
  const id = parseInt(req.params.id, 10);
  const { status, is_editor_pick, title, category_id } = req.body ?? {};
  const updates: string[] = [];
  const params: any[] = [];
  if (status !== undefined) { updates.push("status = ?"); params.push(status); }
  if (is_editor_pick !== undefined) { updates.push("is_editor_pick = ?"); params.push(is_editor_pick ? 1 : 0); }
  if (title !== undefined) { updates.push("title = ?"); params.push(title); }
  if (category_id !== undefined) { updates.push("category_id = ?"); params.push(category_id); }
  if (!updates.length) { res.status(400).json({ error: "Nothing to update" }); return; }
  params.push(id);
  db.prepare(`UPDATE videos SET ${updates.join(", ")} WHERE id = ?`).run(...params);
  const row = db.prepare("SELECT v.*, c.name as category_name FROM videos v LEFT JOIN categories c ON v.category_id = c.id WHERE v.id = ?").get(id);
  res.json(parseVideo(row));
});

// DELETE /api/admin/videos/:id
router.delete("/videos/:id", (req, res) => {
  if (!requireAdmin(req, res)) return;
  const id = parseInt(req.params.id, 10);
  db.prepare("DELETE FROM videos WHERE id = ?").run(id);
  res.json({ ok: true, id });
});

// GET /api/admin/stats
router.get("/stats", (req, res) => {
  if (!requireAdmin(req, res)) return;
  const total_videos = (db.prepare("SELECT COUNT(*) as n FROM videos").get() as any).n;
  const pending = (db.prepare("SELECT COUNT(*) as n FROM videos WHERE status = 'pending'").get() as any).n;
  const published = (db.prepare("SELECT COUNT(*) as n FROM videos WHERE status = 'published'").get() as any).n;
  const total_users = (db.prepare("SELECT COUNT(*) as n FROM users").get() as any).n;
  const total_views = (db.prepare("SELECT SUM(views_count) as n FROM videos").get() as any).n || 0;
  res.json({ total_videos, pending, published, total_users, total_views });
});

export default router;
