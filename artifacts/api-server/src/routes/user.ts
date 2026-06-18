import { Router } from "express";
import { db } from "../db/index.js";
import { verifyToken } from "./auth.js";

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

// GET /api/user/videos
router.get("/videos", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) { res.status(401).json({ error: "Unauthorized" }); return; }
  const payload = verifyToken(auth.slice(7));
  if (!payload) { res.status(401).json({ error: "Invalid token" }); return; }

  const rows = db.prepare(`
    SELECT v.*, c.name as category_name FROM videos v
    LEFT JOIN categories c ON v.category_id = c.id
    WHERE v.submitter_id = ?
    ORDER BY v.created_at DESC
  `).all(payload.userId);
  res.json(rows.map(parseVideo));
});

export default router;
