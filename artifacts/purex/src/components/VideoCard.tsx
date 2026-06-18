import { Link } from "wouter";
import { motion } from "framer-motion";
import { Play, Eye, Sparkles } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import type { Video } from "@/lib/api";
import { compactNumber, formatDuration, timeAgo } from "@/lib/format";

function useMobilePreview(ref: React.RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (!isMobile) return;
    const obs = new IntersectionObserver(
      ([e]) => setVisible(e.intersectionRatio >= 0.8),
      { threshold: [0.8] }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
  return visible;
}

interface Props { video: Video; large?: boolean; }

export function VideoCard({ video, large }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const preview = useMobilePreview(cardRef as React.RefObject<HTMLElement | null>);
  const [imgErr, setImgErr] = useState(false);

  const thumb = (!imgErr && video.thumbnail_url) ? video.thumbnail_url : `https://picsum.photos/seed/${video.id}/640/360`;

  return (
    <Link to={`/video/${video.slug}`}>
      <div ref={cardRef} className="group block cursor-pointer">
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className={`relative overflow-hidden rounded-2xl bg-card border border-white/[0.06] group-hover:border-white/20 transition shadow-card ${large ? "aspect-[16/9]" : "aspect-video"}`}
        >
          <img
            src={thumb}
            alt={video.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.08]"
            onError={() => setImgErr(true)}
          />

          {/* Permanent bottom shade */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

          {/* Hover wash */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />

          {/* Play button */}
          <div className={`absolute inset-0 grid place-items-center transition ${preview ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
            <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-glow scale-90 group-hover:scale-100 transition">
              <Play className="h-5 w-5 fill-current ml-0.5" />
            </div>
          </div>

          {/* Editor pick */}
          {video.is_editor_pick && (
            <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-black/70 text-gold border border-gold/30 backdrop-blur">
              <Sparkles className="h-3 w-3" /> Editor pick
            </span>
          )}

          {/* Duration */}
          {video.duration_seconds ? (
            <span className="absolute bottom-2.5 right-2.5 text-[11px] font-mono px-1.5 py-0.5 rounded bg-black/80 backdrop-blur tabular-nums">
              {formatDuration(video.duration_seconds)}
            </span>
          ) : null}

          {/* Views on hover */}
          <div className="absolute left-3 bottom-3 right-16 opacity-0 group-hover:opacity-100 transition translate-y-2 group-hover:translate-y-0 duration-300">
            <div className="text-[11px] inline-flex items-center gap-1.5 glass px-2 py-1 rounded-full">
              <Eye className="h-3 w-3" />
              {compactNumber(video.views_count)} views
            </div>
          </div>
        </motion.div>

        <div className="mt-3 px-0.5">
          <h3 className="text-sm font-semibold line-clamp-2 leading-snug group-hover:text-foreground transition">
            {video.title}
          </h3>
          <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {compactNumber(video.views_count)}
            </span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
            <span>{timeAgo(video.published_at ?? video.created_at)}</span>
            {video.category_name && (
              <>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <span className="text-primary/80">{video.category_name}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
