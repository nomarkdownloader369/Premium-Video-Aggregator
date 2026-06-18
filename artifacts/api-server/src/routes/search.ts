import { Router } from "express";
import { db } from "../db/index.js";

const router = Router();

router.get("/suggest", (req, res) => {
  const q = ((req.query.q as string) || "").trim();
  if (!q || q.length < 2) { res.json([]); return; }

  const pattern = `%${q}%`;
  const categories = db.prepare(
    "SELECT name, slug FROM categories WHERE name LIKE ? LIMIT 5"
  ).all(pattern) as { name: string; slug: string }[];

  // Extract performer names from videos
  const rows = db.prepare(
    "SELECT performers FROM videos WHERE performers != '[]' AND status='published' LIMIT 200"
  ).all() as { performers: string }[];

  const perfSet = new Set<string>();
  for (const r of rows) {
    try {
      const arr = JSON.parse(r.performers) as string[];
      for (const p of arr) {
        if (p.toLowerCase().includes(q.toLowerCase())) perfSet.add(p);
      }
    } catch {}
  }

  // Tag suggestions from videos
  const tagRows = db.prepare(
    "SELECT tags FROM videos WHERE tags LIKE ? AND status='published' LIMIT 100"
  ).all(pattern) as { tags: string }[];

  const tagSet = new Set<string>();
  for (const r of tagRows) {
    try {
      const arr = JSON.parse(r.tags) as string[];
      for (const t of arr) {
        if (t.toLowerCase().includes(q.toLowerCase())) tagSet.add(t);
      }
    } catch {}
  }

  const results = [
    ...categories.map((c) => ({ type: "category", value: c.name })),
    ...[...perfSet].slice(0, 4).map((p) => ({ type: "performer", value: p })),
    ...[...tagSet].slice(0, 4).map((t) => ({ type: "tag", value: t })),
  ].slice(0, 10);

  res.json(results);
});

export default router;
