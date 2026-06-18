import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { LayoutDashboard, Film, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { PageShell } from "@/components/PageShell";
import { useAuth } from "@/lib/auth";
import { apiFetch, type Video } from "@/lib/api";
import { compactNumber, timeAgo } from "@/lib/format";

export function DashboardPage() {
  const { user, token } = useAuth();
  const [, navigate] = useLocation();

  const videos = useQuery<Video[]>({
    queryKey: ["user", "videos"],
    queryFn: () => apiFetch<Video[]>("/user/videos", {}, token),
    enabled: !!user && !!token,
    staleTime: 60 * 1000,
  });

  if (!user) return (
    <PageShell>
      <div className="min-h-[60vh] grid place-items-center text-center">
        <div>
          <LayoutDashboard className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Sign in required</h1>
          <button onClick={() => navigate("/auth")} className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-semibold mt-4">Sign in</button>
        </div>
      </div>
    </PageShell>
  );

  return (
    <PageShell>
      <div className="container-px mx-auto max-w-[1600px]">
        <div className="mb-8">
          <div className="text-[11px] uppercase tracking-[0.2em] font-bold mb-1 text-muted-foreground">Account</div>
          <h1 className="font-display text-3xl font-black">Dashboard</h1>
          <p className="text-muted-foreground mt-1">{user.email}</p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold">Your Submissions</h2>
          <Link to="/submit">
            <span className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-semibold cursor-pointer hover:opacity-90 transition">
              + Submit Video
            </span>
          </Link>
        </div>

        {videos.isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-card shimmer" />
            ))}
          </div>
        )}

        {videos.data && videos.data.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center">
            <Film className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="font-semibold mb-1">No submissions yet</p>
            <p className="text-sm text-muted-foreground mb-4">Submit your first video to get started.</p>
            <Link to="/submit"><span className="text-primary hover:underline text-sm cursor-pointer">Submit a video →</span></Link>
          </div>
        )}

        {videos.data && videos.data.length > 0 && (
          <div className="glass rounded-2xl overflow-hidden">
            {videos.data.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-4 border-b border-white/5 last:border-0"
              >
                <div className="w-20 shrink-0 rounded-xl overflow-hidden aspect-video bg-black/40">
                  <img src={v.thumbnail_url ?? ""} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium line-clamp-1">{v.title}</div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${
                      v.status === "published" ? "bg-green-500/15 text-green-400" :
                      v.status === "pending" ? "bg-accent/15 text-accent" :
                      "bg-white/10 text-muted-foreground"
                    }`}>{v.status}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgo(v.created_at)}</span>
                    {v.views_count != null && v.views_count > 0 && <span>{compactNumber(v.views_count)} views</span>}
                  </div>
                </div>
                <Link to={`/video/${v.slug}`}>
                  <span className="text-xs text-muted-foreground hover:text-foreground transition cursor-pointer">View →</span>
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
