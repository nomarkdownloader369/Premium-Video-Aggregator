const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export async function apiFetch<T = unknown>(path: string, opts?: RequestInit, token?: string | null): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts?.headers as Record<string, string> ?? {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const r = await fetch(`${BASE}/api${path}`, { ...opts, headers });
  if (!r.ok) {
    let msg = `HTTP ${r.status}`;
    try { const e = await r.json() as { error?: string }; msg = e.error ?? msg; } catch {}
    throw new Error(msg);
  }
  return r.json() as Promise<T>;
}

export interface Video {
  id: number;
  slug: string;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  embed_url?: string | null;
  external_id?: string | null;
  source?: string;
  duration_seconds?: number | null;
  category_id?: number | null;
  category_name?: string | null;
  status?: string;
  views_count?: number;
  likes_count?: number;
  trending_score?: number;
  is_editor_pick?: boolean;
  tags?: string[];
  performers?: string[];
  studio?: string | null;
  published_at?: string;
  created_at?: string;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  color?: string;
  video_count?: number;
}

export interface SearchSuggestion {
  type: "category" | "performer" | "tag";
  value: string;
}
