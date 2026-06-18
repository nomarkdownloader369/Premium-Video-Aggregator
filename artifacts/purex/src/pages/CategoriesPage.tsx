import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { PageShell } from "@/components/PageShell";
import { apiFetch, type Category } from "@/lib/api";
import { compactNumber } from "@/lib/format";

export function CategoriesPage() {
  const { data, isLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => apiFetch<Category[]>("/categories"),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <PageShell>
      <div className="container-px mx-auto max-w-[1600px]">
        <div className="mb-8">
          <div className="text-[11px] uppercase tracking-[0.2em] font-bold mb-1 text-accent">Browse</div>
          <h1 className="font-display text-3xl font-black">All Categories</h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="rounded-2xl aspect-[4/3] bg-card shimmer" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {(data ?? []).map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(i * 0.02, 0.4), duration: 0.3 }}
              >
                <Link to={`/category/${cat.slug}`}>
                  <div
                    className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-card border border-white/[0.06] hover:border-white/20 cursor-pointer transition shadow-card"
                    style={{ background: `radial-gradient(circle at 30% 30%, ${cat.color ?? "#E50914"}22, transparent 70%)` }}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
                      <div
                        className="h-10 w-10 rounded-xl mb-2 grid place-items-center text-lg font-black text-white"
                        style={{ background: cat.color ?? "#E50914", boxShadow: `0 8px 24px -4px ${cat.color ?? "#E50914"}66` }}
                      >
                        {cat.name[0]}
                      </div>
                      <div className="text-xs font-semibold line-clamp-1">{cat.name}</div>
                      {cat.video_count != null && (
                        <div className="text-[10px] text-muted-foreground mt-0.5">{compactNumber(cat.video_count)} videos</div>
                      )}
                    </div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition" style={{ background: `linear-gradient(135deg, ${cat.color ?? "#E50914"}15, transparent)` }} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <div className="h-24" />
      </div>
    </PageShell>
  );
}
