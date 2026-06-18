import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { VideoCard } from "@/components/VideoCard";
import { apiFetch, type Video, type Category } from "@/lib/api";

export function CategoryPage() {
  const [, params] = useRoute("/category/:slug");
  const slug = params?.slug ?? "";

  const cats = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => apiFetch<Category[]>("/categories"),
    staleTime: 10 * 60 * 1000,
  });

  const cat = cats.data?.find((c) => c.slug === slug);

  const { data, isLoading } = useQuery<Video[]>({
    queryKey: ["videos", "category", slug],
    queryFn: () => apiFetch<Video[]>(`/videos?category=${encodeURIComponent(slug)}&order=trending&limit=48`),
    enabled: !!slug,
    staleTime: 3 * 60 * 1000,
  });

  return (
    <PageShell>
      <div className="container-px mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="mb-8">
          {cat && (
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 text-white"
              style={{ background: cat.color ?? "#E50914" }}
            >
              {cat.name}
            </div>
          )}
          <h1 className="font-display text-3xl font-black capitalize">{cat?.name ?? slug.replace(/-/g, " ")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{data?.length ?? 0} videos in this category</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="rounded-2xl aspect-video bg-card shimmer" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {(data ?? []).map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3), duration: 0.4 }}
              >
                <VideoCard video={v} />
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && data && data.length === 0 && (
          <div className="min-h-[40vh] grid place-items-center text-center">
            <div>
              <div className="text-5xl mb-4">🎬</div>
              <h2 className="font-display text-xl font-bold mb-2">No videos yet</h2>
              <p className="text-muted-foreground">Check back soon — content is being aggregated.</p>
            </div>
          </div>
        )}

        <div className="h-24" />
      </div>
    </PageShell>
  );
}
