import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH ?? path.resolve(__dirname, "../../../../purex.db");

export const db = new Database(DB_PATH);

// WAL mode for high-speed concurrent reads
db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");
db.pragma("cache_size = -64000"); // 64MB cache
db.pragma("temp_store = MEMORY");
db.pragma("foreign_keys = ON");

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      color TEXT DEFAULT '#E50914',
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      thumbnail_url TEXT,
      embed_url TEXT,
      external_id TEXT,
      source TEXT DEFAULT 'user',
      duration_seconds INTEGER,
      category_id INTEGER REFERENCES categories(id),
      status TEXT DEFAULT 'published',
      views_count INTEGER DEFAULT 0,
      likes_count INTEGER DEFAULT 0,
      trending_score REAL DEFAULT 0,
      is_editor_pick INTEGER DEFAULT 0,
      tags TEXT DEFAULT '[]',
      performers TEXT DEFAULT '[]',
      studio TEXT,
      published_at TEXT DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now')),
      submitter_id INTEGER REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS video_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
      session_id TEXT,
      referrer TEXT,
      viewed_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
    CREATE INDEX IF NOT EXISTS idx_videos_source ON videos(source);
    CREATE INDEX IF NOT EXISTS idx_videos_views ON videos(views_count DESC);
    CREATE INDEX IF NOT EXISTS idx_videos_trending ON videos(trending_score DESC);
    CREATE INDEX IF NOT EXISTS idx_videos_added_at ON videos(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category_id);
    CREATE INDEX IF NOT EXISTS idx_video_views_video ON video_views(video_id);
  `);
}
