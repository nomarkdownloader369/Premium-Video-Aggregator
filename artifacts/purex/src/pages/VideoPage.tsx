import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { Eye, Clock, Tag, User, Building2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { PageShell } from "@/components/PageShell";
import { VideoRow } from "@/components/VideoRow";
import { apiFetch, type Video } from "@/lib/api";
import { compactNumber, formatDuration, timeAgo } from "@/lib/format";

export function VideoPage() {
  const [, params] = useRoute("/video/:slug");
  const slug = params?.slug ?? "";

  const { data: video, isLoading, error } = useQuery<Video>({
    queryKey: ["video", slug],
    queryFn: () => apiFetch<Video>(`/videos/${slug}`),
    enabled: !!slug,
  });

  const related = useQuery<Video[]>({
    queryKey: ["videos", "trending", 12],
    queryFn: () => apiFetch<Video[]>("/videos?order=trending&limit=12"),
    staleTime: 5 * 60 * 1000,
  });

  const viewMut = useMutation({
    mutationFn: (id: number) => apiFetch(`/videos/${id}/view`, { method: "POST" }),
  });

  useEffect(() => {
    if (video?.id) viewMut.mutate(video.id);
  }, [video?.id]); // eslint-disable-line

  useEffect(() => {
    if (video?.title) document.title = `${video.title} — PureX`;
    return () => { document.title = "PureX"; };
  }, [video?.title]);

  if (isLoading) return (
    <PageShell>
      <div className="min-h-[60vh] grid place-items-center">
        <div className="h-12 w-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    </PageShell>
  );

  if (error || !video) return (
    <PageShell>
      <div className="min-h-[60vh] grid place-items-center text-center">
        <div>
          <div className="text-6xl mb-4">🎬</div>
          <h1 className="font-display text-2xl font-bold mb-2">Video not found</h1>
          <p className="text-muted-foreground mb-6">This video may have been removed.</p>
          <Link to="/"><span className="inline-flex items-center gap-2 text-primary hover:underline cursor-pointer"><ArrowLeft className="h-4 w-4" /> Back to Home</span></Link>
        </div>
      </div>
    </PageShell>
  );

  return (
    <PageShell>
      <div className="container-px mx-auto max-w-[1600px]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Player */}
          <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black shadow-card">
            {video.embed_url ? (
              <iframe
                src={video.embed_url}
                className="absolute inset-0 h-full w-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                title={video.title}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <img src={video.thumbnail_url ?? ""} alt={video.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/60 grid place-items-center">
                  <p className="text-muted-foreground">No embed available</p>
                </div>
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="mt-6 grid lg:grid-cols-[1fr_320px] gap-8">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-black leading-tight">{video.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" /> {compactNumber(video.views_count)} views</span>
                {video.duration_seconds ? <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {formatDuration(video.duration_seconds)}</span> : null}
                <span>{timeAgo(video.published_at)}</span>
                {video.category_name && <span className="text-primary font-medium">{video.category_name}</span>}
                {video.source && video.source !== "user" && <span className="capitalize text-accent font-medium">{video.source}</span>}
              </div>

              {video.description && (
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{video.description}</p>
              )}

              {/* Tags */}
              {video.tags && video.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  {video.tags.slice(0, 15).map((t) => (
                    <Link key={t} to={`/search?q=${encodeURIComponent(t)}`}>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition">{t}</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Performers */}
              {video.performers && video.performers.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  {video.performers.map((p) => (
                    <Link key={p} to={`/performers?name=${encodeURIComponent(p)}`}>
                      <span className="text-xs px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 cursor-pointer transition font-medium">{p}</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Studio */}
              {video.studio && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <Link to={`/studios?name=${encodeURIComponent(video.studio)}`}>
                    <span className="text-accent hover:underline cursor-pointer">{video.studio}</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Sidebar stats */}
            <div className="space-y-4">
              <div className="glass rounded-2xl p-4 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Stats</div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Views</span><span className="font-semibold">{compactNumber(video.views_count)}</span></div>
                {video.duration_seconds ? <div className="flex justify-between text-sm"><span className="text-muted-foreground">Duration</span><span className="font-semibold">{formatDuration(video.duration_seconds)}</span></div> : null}
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Source</span><span className="font-semibold capitalize">{video.source ?? "user"}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Published</span><span className="font-semibold">{timeAgo(video.published_at)}</span></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Related videos */}
        <div className="mt-12">
          <VideoRow
            eyebrow="More"
            title="You might also like"
            videos={related.data?.filter((v) => v.slug !== slug) ?? []}
            accent="red"
            loading={related.isLoading}
          />
        </div>

        <div className="h-24" />
      </div>
    </PageShell>
  );
}
