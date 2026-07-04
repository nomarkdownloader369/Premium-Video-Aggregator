import { Link } from "wouter";
import { useEffect, useState } from "react";
import { HERO_SLIDES, VIDEOS, TRENDING, thumbUrl, type Video } from "@/lib/videos";

export default function Home() {
  return (
    <div className="bg-background">
      <HeroSlider />
      <VideoGrid />
      <TrendingSearches />
      <FaqSection />
    </div>
  );
}

function HeroSlider() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % HERO_SLIDES.length), 6500);
    return () => clearInterval(t);
  }, []);
  const slide = HERO_SLIDES[i];
  return (
    <section className="mx-auto max-w-[1400px] px-2 pt-6 sm:px-6">
      <div className="overflow-hidden rounded-sm border border-[color:var(--hairline)] bg-black">
        <div className="relative aspect-video w-full sm:aspect-[21/9]">
          {HERO_SLIDES.map((s, idx) => (
            <img
              key={s.slug}
              src={thumbUrl(s.thumbSeed, 1600, 700)}
              alt={s.title}
              className={
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 " +
                (idx === i ? "opacity-100" : "opacity-0")
              }
            />
          ))}
          <div className="absolute inset-0 hidden bg-gradient-to-r from-black via-black/70 to-transparent sm:block" />
          <div className="absolute inset-0 hidden bg-gradient-to-t from-black/90 via-transparent to-transparent sm:block" />
          <div className="absolute inset-0 hidden h-full w-full items-end p-6 sm:flex sm:p-10 lg:p-14">
            <div className="max-w-2xl">
              <HeroMeta slide={slide} />
              <h1
                className="text-3xl font-black leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {slide.title}
              </h1>
              <HeroStats slide={slide} />
              <p className="mt-4 max-w-xl text-sm text-foreground/75">{slide.description}</p>
              <HeroActions slide={slide} />
            </div>
          </div>
          <div className="absolute bottom-3 right-3 flex gap-1.5 sm:bottom-4 sm:right-4">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={
                  "h-1.5 rounded-full transition-all " +
                  (idx === i ? "w-8 bg-primary" : "w-4 bg-white/30 hover:bg-white/60")
                }
              />
            ))}
          </div>
        </div>

        <div className="block hero-mobile-card sm:hidden">
          <HeroMeta slide={slide} />
          <h1
            className="hero-mobile-title mt-1.5 text-base font-black tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {slide.title}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
            <span>{slide.year}</span><span>•</span>
            <span>{slide.duration}</span><span>•</span>
            <span>{slide.views} views</span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-[10px] leading-snug text-foreground/75">
            {slide.description}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Link
              href={`/video/${slide.slug}`}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-sm bg-primary px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              Watch Movie
            </Link>
            <button className="inline-flex items-center justify-center gap-1 rounded-sm border border-[color:var(--hairline)] bg-transparent px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-foreground hover:border-primary hover:text-primary">
              + Watchlist
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMeta({ slide }: { slide: Video }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
      <span className="rounded-sm bg-primary px-2 py-0.5 text-primary-foreground">Featured</span>
      <span className="text-foreground/85">{slide.studio}</span>
      <span className="text-muted-foreground">• {slide.quality}</span>
    </div>
  );
}

function HeroStats({ slide }: { slide: Video }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:mt-4 sm:text-sm">
      <span>{slide.year}</span><span>•</span>
      <span>{slide.duration}</span><span>•</span>
      <span>{slide.views} views</span>
    </div>
  );
}

function HeroActions({ slide }: { slide: Video }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <Link
        href={`/video/${slide.slug}`}
        className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        Watch Movie
      </Link>
      <button className="inline-flex items-center gap-2 rounded-sm border border-[color:var(--hairline)] bg-transparent px-5 py-3 text-sm font-bold uppercase tracking-wide text-foreground transition-colors hover:border-primary hover:text-primary">
        + Watchlist
      </button>
    </div>
  );
}

export function VideoCard({ video }: { video: Video }) {
  const frames = [
    thumbUrl(video.thumbSeed, 800, 450),
    thumbUrl(video.thumbSeed + "-f2", 800, 450),
    thumbUrl(video.thumbSeed + "-f3", 800, 450),
    thumbUrl(video.thumbSeed + "-f4", 800, 450),
  ];
  const [active, setActive] = useState(false);
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    if (!active) { setFrame(0); return; }
    const t = setInterval(() => setFrame((n) => (n + 1) % frames.length), 700);
    return () => clearInterval(t);
  }, [active, frames.length]);
  return (
    <Link
      href={`/video/${video.slug}`}
      className="group block"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-sm border border-[color:var(--hairline)] bg-black">
        {frames.map((src, idx) => (
          <img
            key={src}
            src={src}
            alt={video.title}
            loading="lazy"
            className={
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-300 " +
              (idx === frame ? "opacity-100" : "opacity-0")
            }
          />
        ))}
        <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-sm bg-black/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
          <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          {video.quality}
        </div>
        <div className="absolute bottom-1.5 right-1.5 rounded-sm bg-black/85 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur sm:bottom-2 sm:right-2 sm:px-2 sm:py-1 sm:text-[10px]">
          Full · {video.duration}
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </div>
      </div>
      <div className="mt-3">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-base">
          {video.title}
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <span className="font-semibold uppercase tracking-wide text-primary/90">{video.studio}</span>
          <span>•</span>
          <span>{video.views} views</span>
          <span>•</span>
          <span>{video.year}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {video.stars.slice(0, 2).map((s) => (
            <span
              key={s}
              className="rounded-sm border border-[color:var(--hairline)] bg-[color:var(--surface-2)] px-1.5 py-0.5 text-[10px] font-medium text-foreground/80 hover:border-primary hover:text-primary"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

function VideoGrid() {
  return (
    <section className="mx-auto max-w-[1400px] px-0 py-8 sm:px-6 sm:py-12">
      <div className="mb-4 sm:mb-6 sm:flex sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
            Latest Releases
          </h2>
        </div>
        <div className="-mx-2 mt-3 flex gap-2 overflow-x-auto px-2 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:mt-0 sm:overflow-visible sm:px-0 sm:pb-0">
          {["New", "Top Rated", "Most Viewed"].map((f, i) => (
            <button
              key={f}
              className={
                "shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide sm:rounded-sm sm:px-3 sm:py-1.5 sm:text-xs " +
                (i === 0
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-[color:var(--hairline)] text-foreground/80 hover:border-primary hover:text-primary")
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-1 gap-y-4 lg:grid-cols-4 lg:gap-x-3 lg:gap-y-6">
        {VIDEOS.map((v) => (
          <VideoCard key={v.slug} video={v} />
        ))}
      </div>
    </section>
  );
}

function TrendingSearches() {
  return (
    <section className="mx-auto max-w-[1400px] px-2 pb-10 sm:px-6">
      <div className="rounded-sm border border-[color:var(--hairline)] bg-[color:var(--surface)] p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-primary" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Trending Searches</h3>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {TRENDING.map((t) => (
            <button
              key={t}
              className="rounded-sm border border-[color:var(--hairline)] bg-[color:var(--surface-2)] px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:border-primary hover:text-primary"
            >
              #{t}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  { q: "Is PervFlix really free?", a: "Yes. Every full-length film in our catalog streams for free, in the highest available quality, with no account required and no paywall." },
  { q: "Do I need to sign up or create an account?", a: "Never. PervFlix is a 100% open catalog. There are no logins, memberships, or personal data required to watch." },
  { q: "Where do the films come from?", a: "We curate full-length releases from premier studios including Brazzers, MYLF, BLACKED, TUSHY, Adult Time and many more." },
  { q: "Can I download films?", a: "Yes — every watch page includes a direct download button so you can save your favorites for offline viewing." },
  { q: "What quality is available?", a: "Most releases are available in native 4K UHD or 1080p Full HD. Look for the pulsing red quality badge on each thumbnail." },
];

function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="mx-auto max-w-[1400px] px-2 pb-16 sm:px-6">
      <h2 className="text-2xl font-black tracking-tight sm:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
        Frequently Asked Questions
      </h2>
      <div className="mt-6 divide-y divide-[color:var(--hairline)] rounded-sm border border-[color:var(--hairline)] bg-[color:var(--surface)]">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[color:var(--surface-2)]"
              >
                <span className="text-sm font-semibold text-foreground sm:text-base">{f.q}</span>
                <span className={"grid h-6 w-6 shrink-0 place-items-center rounded-sm border border-[color:var(--hairline)] text-primary transition-transform " + (isOpen ? "rotate-45" : "")}>+</span>
              </button>
              {isOpen && <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
