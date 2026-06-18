import { useRef } from "react";
import { Link } from "wouter";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { VideoCard } from "./VideoCard";
import type { Video } from "@/lib/api";

const ACCENT_MAP: Record<string, string> = {
  red: "text-primary",
  gold: "text-gold",
  ember: "text-accent",
  ice: "text-blue-400",
};

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  videos: Video[];
  href?: string;
  accent?: "red" | "gold" | "ember" | "ice";
  loading?: boolean;
}

export function VideoRow({ eyebrow, title, subtitle, videos, href, accent = "red", loading }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 320, behavior: "smooth" });
    }
  };

  if (!loading && videos.length === 0) return null;

  return (
    <section className="container-px mx-auto max-w-[1600px] mt-16">
      <div className="flex items-end justify-between mb-6 gap-4">
        <div>
          {eyebrow && (
            <div className={`text-[11px] uppercase tracking-[0.2em] font-bold mb-1 ${ACCENT_MAP[accent] ?? "text-primary"}`}>
              {eyebrow}
            </div>
          )}
          <h2 className="font-display text-xl md:text-2xl font-bold">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => scroll(-1)}
            className="h-8 w-8 grid place-items-center rounded-full glass hover:bg-white/10 transition"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll(1)}
            className="h-8 w-8 grid place-items-center rounded-full glass hover:bg-white/10 transition"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          {href && (
            <Link to={href}>
              <span className="hidden sm:inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition cursor-pointer ml-1">
                See all <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-1 px-1"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-72 md:w-80 shrink-0 rounded-2xl aspect-video bg-card shimmer" style={{ scrollSnapAlign: "start" }} />
            ))
          : videos.map((v) => (
              <motion.div
                key={v.id}
                className="w-72 md:w-80 shrink-0"
                style={{ scrollSnapAlign: "start" }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4 }}
              >
                <VideoCard video={v} />
              </motion.div>
            ))}
      </div>
    </section>
  );
}
