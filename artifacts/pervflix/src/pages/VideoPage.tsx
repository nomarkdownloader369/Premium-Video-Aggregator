import { Link, useParams } from "wouter";
import { getVideo, VIDEOS, thumbUrl, type Video } from "@/lib/videos";

export default function VideoPage() {
  const { slug } = useParams<{ slug: string }>();
  const video = getVideo(slug ?? "");

  if (!video) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-3xl font-black">Video not found</h1>
        <p className="mt-2 text-muted-foreground">This film may have been removed or the link is broken.</p>
        <Link href="/" className="mt-6 inline-block rounded-sm bg-primary px-4 py-2 text-sm font-bold uppercase text-primary-foreground">Back home</Link>
      </div>
    );
  }

  const related = VIDEOS.filter((v) => v.slug !== video.slug).slice(0, 8);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <div className="relative aspect-video w-full overflow-hidden rounded-sm border border-[color:var(--hairline)] bg-black">
            <img src={thumbUrl(video.thumbSeed, 1600, 900)} alt={video.title} className="h-full w-full object-cover opacity-60" />
            <div className="absolute inset-0 grid place-items-center">
              <button className="group flex items-center gap-3 rounded-sm bg-primary px-6 py-4 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.4)] transition-transform hover:scale-105">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                Play Full Film · {video.duration}
              </button>
            </div>
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-sm bg-black/85 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              {video.quality}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
                <span className="rounded-sm bg-primary px-2 py-0.5 text-primary-foreground">{video.studio}</span>
                <span className="text-muted-foreground">{video.year} • {video.duration} • {video.views} views</span>
              </div>
              <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
                {video.title}
              </h1>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <ActionButton icon="download" label="Download" />
            <ActionButton icon="share" label="Share" />
            <ActionButton icon="flag" label="Report Broken Link" />
            <ActionButton icon="heart" label="Favorite" />
          </div>

          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-foreground/80">{video.description}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {video.stars.map((s) => (
              <span key={s} className="rounded-sm border border-[color:var(--hairline)] bg-[color:var(--surface-2)] px-3 py-1.5 text-xs font-semibold text-foreground/85 hover:border-primary hover:text-primary">
                ★ {s}
              </span>
            ))}
            {video.tags.map((t) => (
              <span key={t} className="rounded-sm border border-[color:var(--hairline)] bg-[color:var(--surface)] px-3 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary">
                #{t}
              </span>
            ))}
          </div>
        </div>

        <aside className="min-w-0">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Related Films</h2>
          <div className="space-y-4">
            {related.map((r) => (
              <Link key={r.slug} href={`/video/${r.slug}`} className="group grid grid-cols-[160px_minmax(0,1fr)] gap-3">
                <div className="relative aspect-video overflow-hidden rounded-sm border border-[color:var(--hairline)]">
                  <img src={thumbUrl(r.thumbSeed, 320, 180)} alt={r.title} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute bottom-1 right-1 rounded-sm bg-black/85 px-1.5 py-0.5 text-[9px] font-bold text-white">{r.duration}</div>
                </div>
                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary">{r.title}</h3>
                  <div className="mt-1 truncate text-[11px] uppercase tracking-wide text-primary/80">{r.studio}</div>
                  <div className="text-[11px] text-muted-foreground">{r.views} views</div>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function ActionButton({ icon, label }: { icon: "download" | "share" | "flag" | "heart"; label: string }) {
  const paths: Record<string, string> = {
    download: "M12 3v12m0 0-4-4m4 4 4-4M4 21h16",
    share: "M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13",
    flag: "M4 21V4h13l-2 5 2 5H4",
    heart: "M12 21s-8-5.5-8-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-8 11-8 11z",
  };
  return (
    <button className="inline-flex items-center gap-2 rounded-sm border border-[color:var(--hairline)] bg-[color:var(--surface)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-foreground/85 transition-colors hover:border-primary hover:text-primary">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={paths[icon]} />
      </svg>
      {label}
    </button>
  );
}
