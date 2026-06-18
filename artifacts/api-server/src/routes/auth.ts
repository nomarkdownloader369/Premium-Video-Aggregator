import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";

const router = Router();
const JWT_SECRET = process.env.SESSION_SECRET || "purex-dev-secret-2024";

export function verifyToken(token: string): { userId: number; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; email: string; role: string };
  } catch {
    return null;
  }
}

function makeToken(user: { id: number; email: string; role: string }) {
  return jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "30d" });
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) { res.status(400).json({ error: "Email and password required" }); return; }
  if (password.length < 6) { res.status(400).json({ error: "Password must be at least 6 characters" }); return; }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) { res.status(409).json({ error: "Email already registered" }); return; }

  const hash = await bcrypt.hash(password, 10);
  const result = db.prepare("INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'user')").run(email.toLowerCase().trim(), hash);
  const user = db.prepare("SELECT id, email, role, created_at FROM users WHERE id = ?").get(result.lastInsertRowid) as any;
  const token = makeToken(user);
  res.status(201).json({ token, user });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) { res.status(400).json({ error: "Email and password required" }); return; }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase().trim()) as any;
  if (!user) { res.status(401).json({ error: "Invalid credentials" }); return; }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) { res.status(401).json({ error: "Invalid credentials" }); return; }

  const token = makeToken(user);
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, created_at: user.created_at } });
});

// GET /api/auth/me
router.get("/me", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) { res.status(401).json({ error: "Unauthorized" }); return; }
  const payload = verifyToken(auth.slice(7));
  if (!payload) { res.status(401).json({ error: "Invalid token" }); return; }
  const user = db.prepare("SELECT id, email, role, created_at FROM users WHERE id = ?").get(payload.userId);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(user);
});

export default router;
