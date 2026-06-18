import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { VideoCard } from "@/components/VideoCard";
import { apiFetch, type Video } from "@/lib/api";

const FILTERS = [
  { label: "Trending", order: "trending" },
  { label: "Most Viewed", order: "views" },
  { label: "Recent", order: "recent" },
  { label: "Random", order: "random" },
];

export function TrendingPage() {
  const [order, setOrder] = useState("trending");

  const { data, isLoading } = useQuery<Video[]>({
    queryKey: ["videos", order, 48],
    queryFn: () => apiFetch<Video[]>(`/videos?order=${order}&limit=48`),
    staleTime: 2 * 60 * 1000,
  });

  return (
    <PageShell>
      <div className="container-px mx-auto max-w-[1600px]">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-bold mb-1 text-primary">
              <Flame className="h-3.5 w-3.5" /> Live
            </div>
            <h1 className="font-display text-3xl font-black">Trending</h1>
          </div>
          <div className="flex gap-1 glass rounded-full p-1 text-sm">
            {FILTERS.map((f) => (
              <button
                key={f.order}
                onClick={() => setOrder(f.order)}
                className={`px-3 py-1.5 rounded-full transition ${order === f.order ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
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

        <div className="h-24" />
      </div>
    </PageShell>
  );
}
