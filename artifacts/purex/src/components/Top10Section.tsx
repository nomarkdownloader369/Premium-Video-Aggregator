import { Link } from "wouter";
import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Eye } from "lucide-react";
import type { Video } from "@/lib/api";
import { compactNumber, timeAgo } from "@/lib/format";

type Period = "today" | "week" | "month";

interface Props { videos: Video[]; }

export function Top10Section({ videos }: Props) {
  const [period, setPeriod] = useState<Period>("today");
  const sorted = [...videos].sort((a, b) => (b.views_count ?? 0) - (a.views_count ?? 0)).slice(0, 10);
  const featured = sorted[0];

  return (
    <section className="container-px mx-auto max-w-[1600px] mt-20">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] font-bold mb-1 text-accent">Charts</div>
          <h2 className="font-display text-xl md:text-2xl font-bold">Top 10</h2>
        </div>
        <div className="flex gap-1 glass rounded-full p-1 text-sm">
          {(["today", "week", "month"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-full transition capitalize ${period === p ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.6fr] gap-6">
        {/* List */}
        <div className="space-y-3">
          {sorted.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/video/${v.slug}`}>
                <div className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition cursor-pointer">
                  <span className="font-display text-4xl font-black tabular-nums w-12 text-right shrink-0" style={{
                    color: i < 3 ? "var(--color-primary)" : "var(--color-muted-foreground)",
                    opacity: i < 3 ? 1 : 0.4 + (10 - i) * 0.06,
                  }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="relative w-24 shrink-0 aspect-video rounded-xl overflow-hidden bg-card">
                    <img
                      src={v.thumbnail_url ?? `https://picsum.photos/seed/${v.id}/320/180`}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground grid place-items-center">
                        <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold line-clamp-2 leading-snug">{v.title}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      {compactNumber(v.views_count)}
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                      <span>{timeAgo(v.published_at)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Featured */}
        {featured && (
          <Link to={`/video/${featured.slug}`}>
            <div className="relative hidden lg:block rounded-3xl overflow-hidden aspect-[16/10] group cursor-pointer shadow-card">
              <img
                src={featured.thumbnail_url ?? `https://picsum.photos/seed/${featured.id}/1280/720`}
                alt={featured.title}
                className="absolute inset-0 h-full w-full object-cover group-hover:scale-[1.04] transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8">
                <div className="text-xs text-accent font-semibold uppercase tracking-widest mb-2">#1 this {period}</div>
                <h3 className="font-display text-2xl font-black line-clamp-2 mb-3">{featured.title}</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {compactNumber(featured.views_count)}</span>
                  <span>·</span>
                  <span>{timeAgo(featured.published_at)}</span>
                </div>
              </div>
              <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition">
                <div className="h-20 w-20 rounded-full bg-primary/90 backdrop-blur text-primary-foreground grid place-items-center shadow-glow">
                  <Play className="h-8 w-8 fill-current ml-1" />
                </div>
              </div>
            </div>
          </Link>
        )}
      </div>
    </section>
  );
}
