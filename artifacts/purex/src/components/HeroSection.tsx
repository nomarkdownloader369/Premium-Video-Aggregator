import { Link } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { Play, Plus, Flame, Volume2, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { Video } from "@/lib/api";
import { compactNumber } from "@/lib/format";

const AUTOPLAY_MS = 7000;

interface Props { videos: Video[]; }

export function HeroSection({ videos }: Props) {
  const slides = videos.slice(0, 5);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const video = slides[idx];

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  if (!video) return null;
  const go = (d: number) => setIdx((i) => (i + d + slides.length) % slides.length);

  const thumb = video.thumbnail_url ?? `https://picsum.photos/seed/${video.id}/1280/720`;

  return (
    <section
      className="relative w-full overflow-hidden min-h-[88svh] md:min-h-[92vh] flex items-end"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Backdrop */}
      <AnimatePresence mode="sync">
        <motion.div
          key={video.id}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1.02 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <img src={thumb} alt="" className="h-full w-full object-cover" />
        </motion.div>
      </AnimatePresence>

      {/* Gradient layers */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 md:via-background/70 to-transparent" />
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay pointer-events-none film-grain" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 40%, oklch(0 0 0 / 0.6) 100%)" }} />

      {/* Content */}
      <div className="relative container-px mx-auto max-w-[1600px] w-full pt-32 pb-14 md:pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-[11px] uppercase tracking-[0.25em] font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-primary pulse-live" />
                <span className="relative h-2 w-2 rounded-full bg-primary" />
              </span>
              <Flame className="h-3 w-3 text-accent" />
              <span>#{idx + 1} Trending worldwide</span>
            </div>

            <h1 className="mt-6 font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.92] tracking-tighter">
              <span className="block">{video.title}</span>
            </h1>

            {video.description && (
              <p className="mt-5 max-w-xl text-sm md:text-base text-muted-foreground line-clamp-3">{video.description}</p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="text-gold font-bold tracking-widest uppercase">★★★★★</span>
              <span><span className="text-foreground font-semibold">{compactNumber(video.views_count)}</span> views</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
              <span><span className="text-accent font-semibold">{compactNumber(Math.round(video.trending_score ?? 0))}</span> viral score</span>
              {video.is_editor_pick && (
                <>
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
                  <span className="text-gold font-semibold uppercase tracking-wider">Editor's Pick</span>
                </>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to={`/video/${video.slug}`}>
                <span className="group inline-flex items-center gap-2 h-12 px-8 py-3 rounded-full bg-foreground text-background font-bold tracking-tight hover:bg-foreground/90 transition shadow-elev cursor-pointer">
                  <Play className="h-5 w-5 fill-current" /> Play
                </span>
              </Link>
              <Link to={`/video/${video.slug}`}>
                <span className="inline-flex items-center gap-2 h-12 px-7 py-3 rounded-full glass hover:bg-white/10 font-semibold text-sm transition cursor-pointer">
                  <Plus className="h-4 w-4" /> More info
                </span>
              </Link>
              <button type="button" aria-label="Mute" className="ml-1 h-11 w-11 grid place-items-center rounded-full border border-white/15 text-muted-foreground hover:text-foreground hover:border-white/30 transition">
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide pager + controls */}
        <div className="mt-10 flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setIdx(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="group relative h-1 w-10 md:w-14 rounded-full bg-white/15 overflow-hidden"
              >
                {i === idx && (
                  <motion.span
                    key={`${s.id}-${paused ? "p" : "r"}`}
                    initial={{ width: 0 }}
                    animate={{ width: paused ? "30%" : "100%" }}
                    transition={{ duration: paused ? 0 : AUTOPLAY_MS / 1000, ease: "linear" }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent"
                  />
                )}
                {i < idx && <span className="absolute inset-0 bg-white/40" />}
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => go(-1)} className="h-10 w-10 grid place-items-center rounded-full glass hover:bg-white/10 transition" aria-label="Previous">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => go(1)} className="h-10 w-10 grid place-items-center rounded-full glass hover:bg-white/10 transition" aria-label="Next">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
