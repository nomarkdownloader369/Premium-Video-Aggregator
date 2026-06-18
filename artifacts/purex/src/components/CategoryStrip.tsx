import { Link } from "wouter";
import { motion } from "framer-motion";
import type { Category } from "@/lib/api";
import { compactNumber } from "@/lib/format";

interface Props { categories: Category[]; }

export function CategoryStrip({ categories }: Props) {
  return (
    <section className="container-px mx-auto max-w-[1600px] mt-20">
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-[0.2em] font-bold mb-1 text-accent">Browse</div>
        <h2 className="font-display text-xl md:text-2xl font-bold">All Categories</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ delay: i * 0.03, duration: 0.3 }}
          >
            <Link to={`/category/${cat.slug}`}>
              <div
                className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-card border border-white/[0.06] hover:border-white/20 cursor-pointer transition shadow-card"
                style={{ background: `radial-gradient(circle at 30% 30%, ${cat.color ?? "#E50914"}22, transparent 70%)` }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
                  <div
                    className="h-10 w-10 rounded-xl mb-2 grid place-items-center text-lg font-black"
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
    </section>
  );
}
