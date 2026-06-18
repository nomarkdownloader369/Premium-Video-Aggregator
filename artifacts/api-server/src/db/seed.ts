import { db } from "./index.js";

const CATEGORIES = [
  { slug: "amateur", name: "Amateur", color: "#E50914" },
  { slug: "milf", name: "MILF", color: "#FF6B00" },
  { slug: "pov", name: "POV", color: "#FFD166" },
  { slug: "teen", name: "Teen", color: "#E50914" },
  { slug: "mature", name: "Mature", color: "#FF3B30" },
  { slug: "anal", name: "Anal", color: "#FF6B00" },
  { slug: "lesbians", name: "Lesbians", color: "#E50914" },
  { slug: "big-tits", name: "Big Tits", color: "#FF3B30" },
  { slug: "blowjob", name: "Blowjob", color: "#FFD166" },
  { slug: "threesome", name: "Threesome", color: "#FF6B00" },
  { slug: "solo", name: "Solo", color: "#E50914" },
  { slug: "bbw", name: "BBW", color: "#FF3B30" },
  { slug: "interracial", name: "Interracial", color: "#FF6B00" },
  { slug: "asian", name: "Asian", color: "#FFD166" },
  { slug: "latina", name: "Latina", color: "#E50914" },
  { slug: "ebony", name: "Ebony", color: "#FF3B30" },
  { slug: "blonde", name: "Blonde", color: "#FFD166" },
  { slug: "brunette", name: "Brunette", color: "#FF6B00" },
  { slug: "redhead", name: "Redhead", color: "#E50914" },
  { slug: "cosplay", name: "Cosplay", color: "#FF3B30" },
  { slug: "anime", name: "Anime", color: "#FFD166" },
  { slug: "vintage", name: "Vintage", color: "#FF6B00" },
  { slug: "compilations", name: "Compilations", color: "#E50914" },
  { slug: "feet", name: "Feet", color: "#FF3B30" },
  { slug: "massage", name: "Massage", color: "#FFD166" },
  { slug: "bdsm", name: "BDSM", color: "#E50914" },
  { slug: "squirting", name: "Squirting", color: "#FF6B00" },
  { slug: "cumshots", name: "Cumshots", color: "#FF3B30" },
  { slug: "facial", name: "Facial", color: "#FFD166" },
  { slug: "gangbang", name: "Gangbang", color: "#E50914" },
  { slug: "hardcore", name: "Hardcore", color: "#FF3B30" },
  { slug: "double-penetration", name: "Double Penetration", color: "#FF6B00" },
  { slug: "big-dick", name: "Big Dick", color: "#FFD166" },
  { slug: "small-tits", name: "Small Tits", color: "#E50914" },
  { slug: "handjob", name: "Handjob", color: "#FF3B30" },
  { slug: "hentai", name: "Hentai", color: "#FF6B00" },
  { slug: "high-heels", name: "High Heels", color: "#FFD166" },
  { slug: "indian", name: "Indian", color: "#E50914" },
  { slug: "japanese", name: "Japanese", color: "#FF3B30" },
  { slug: "kissing", name: "Kissing", color: "#FFD166" },
  { slug: "latex", name: "Latex", color: "#FF6B00" },
  { slug: "oral-sex", name: "Oral Sex", color: "#E50914" },
  { slug: "outdoor", name: "Outdoor", color: "#FF3B30" },
  { slug: "orgasm", name: "Orgasm", color: "#FFD166" },
  { slug: "pov-anal", name: "POV Anal", color: "#FF6B00" },
  { slug: "sucking", name: "Sucking", color: "#E50914" },
  { slug: "step-sister", name: "Step Sister", color: "#FF3B30" },
  { slug: "step-mom", name: "Step Mom", color: "#FFD166" },
  { slug: "wife", name: "Wife", color: "#FF6B00" },
  { slug: "girlfriend", name: "Girlfriend", color: "#E50914" },
];

export function seedCategories() {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO categories (slug, name, color, sort_order)
    VALUES (?, ?, ?, ?)
  `);
  CATEGORIES.forEach((c, i) => insert.run(c.slug, c.name, c.color, i));
}

export function seedAdminUser() {
  // Only insert if no admin exists
  const existing = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
  if (!existing) {
    // Default admin: admin@purex.com / admin123 (bcrypt hash)
    // Hash of "admin123"
    const hash = "$2b$10$8K1p/a0dR2EJQ0sHcMIFXuNsPhzxnhZk5QDnmBN.N4nRPj.KbJuXy";
    db.prepare("INSERT OR IGNORE INTO users (email, password_hash, role) VALUES (?, ?, 'admin')").run("admin@purex.com", hash);
  }
}
