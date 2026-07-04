import type { Video, Pornstar } from "./videos";
import { VIDEOS, STUDIOS, PORNSTARS, CATEGORIES } from "./videos";

export const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? "/api/pf";

export type ListParams = {
  page?: number;
  limit?: number;
  sort?: "new" | "top" | "views";
  category?: string;
  studio?: string;
  pornstar?: string;
  q?: string;
};

function qs(params: Record<string, unknown>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params))
    if (v != null && v !== "") p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : "";
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

// ─── Fallback helpers (used when DB has no data yet) ────────────────────────

function filterMock(params: ListParams): Video[] {
  let list = [...VIDEOS];
  if (params.studio) list = list.filter((v) => v.studio.toLowerCase() === params.studio!.toLowerCase());
  if (params.pornstar) list = list.filter((v) => v.stars.some((s) => s.toLowerCase().includes(params.pornstar!.toLowerCase())));
  if (params.category) list = list.filter((v) => v.tags.includes(params.category!.toLowerCase()) || v.title.toLowerCase().includes(params.category!.toLowerCase()));
  if (params.q) list = list.filter((v) => v.title.toLowerCase().includes(params.q!.toLowerCase()));
  if (params.sort === "views") list.sort((a, b) => parseFloat(b.views) - parseFloat(a.views));
  const page = params.page ?? 1;
  const limit = params.limit ?? 24;
  return list.slice((page - 1) * limit, page * limit);
}

// ─── API calls → real endpoints, fallback to mock if DB is empty ─────────────

export const api = {
  listVideos: async (params: ListParams = {}): Promise<Video[]> => {
    try {
      const data = await apiFetch<Video[]>(`/videos${qs(params as Record<string, unknown>)}`);
      return data.length ? data : filterMock(params);
    } catch {
      return filterMock(params);
    }
  },

  getVideo: async (slug: string): Promise<Video | undefined> => {
    try {
      return await apiFetch<Video>(`/videos/${encodeURIComponent(slug)}`);
    } catch {
      return VIDEOS.find((v) => v.slug === slug);
    }
  },

  listStudios: async (): Promise<string[]> => {
    try {
      type StudioRow = { studio: string };
      const rows = await apiFetch<StudioRow[]>("/browse/studios");
      const names = rows.map((r) => r.studio).filter(Boolean);
      return names.length ? names : STUDIOS;
    } catch {
      return STUDIOS;
    }
  },

  listPornstars: async (): Promise<Pornstar[]> => {
    try {
      type PornstarRow = { pornstar: string; video_count: number; top_thumbnail: string };
      const rows = await apiFetch<PornstarRow[]>("/browse/pornstars");
      if (!rows.length) return PORNSTARS;
      return rows.slice(0, 20).map((r) => ({
        name: r.pornstar,
        slug: r.pornstar.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        avatarSeed: r.top_thumbnail || `ps-${r.pornstar.split(" ")[0]?.toLowerCase()}`,
      }));
    } catch {
      return PORNSTARS;
    }
  },

  listCategories: async (): Promise<string[]> => {
    try {
      const cats = await apiFetch<string[]>("/browse/categories");
      return cats.length ? cats : CATEGORIES;
    } catch {
      return CATEGORIES;
    }
  },

  search: async (q: string, params: ListParams = {}): Promise<Video[]> => {
    return api.listVideos({ ...params, q });
  },
};
