import { Router } from "express";
import { db } from "../db/index.js";

const router = Router();

router.get("/", (_req, res) => {
  const rows = db.prepare(`
    SELECT c.*, COUNT(v.id) as video_count
    FROM categories c
    LEFT JOIN videos v ON v.category_id = c.id AND v.status = 'published'
    GROUP BY c.id
    ORDER BY c.sort_order ASC
  `).all();
  res.json(rows);
});

export default router;
