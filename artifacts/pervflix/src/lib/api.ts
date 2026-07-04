import { VIDEOS, STUDIOS, PORNSTARS, CATEGORIES, type Video, type Pornstar } from "./videos";

export type ListParams = {
  page?: number;
  limit?: number;
  sort?: "new" | "top" | "views";
  category?: string;
  studio?: string;
  pornstar?: string;
  q?: string;
};

function filterVideos(params: ListParams): Video[] {
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

export const api = {
  listVideos: async (params: ListParams = {}): Promise<Video[]> => filterVideos(params),
  getVideo: async (slug: string): Promise<Video | undefined> => VIDEOS.find((v) => v.slug === slug),
  listStudios: async (): Promise<string[]> => STUDIOS,
  listPornstars: async (): Promise<Pornstar[]> => PORNSTARS,
  listCategories: async (): Promise<string[]> => CATEGORIES,
  search: async (q: string, params: ListParams = {}): Promise<Video[]> => filterVideos({ ...params, q }),
};
