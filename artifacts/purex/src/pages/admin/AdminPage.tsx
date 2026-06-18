import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { Shield, Check, X, Trash2, Eye, BarChart3, Users, Film } from "lucide-react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { useAuth } from "@/lib/auth";
import { apiFetch, type Video } from "@/lib/api";
import { compactNumber, timeAgo } from "@/lib/format";

interface Stats { total_videos: number; pending: number; published: number; total_users: number; total_views: number; }

export function AdminPage() {
  const { user, token, isAdmin } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const [q, setQ] = useState("");
  const qc = useQueryClient();

  if (!user || !isAdmin) return (
    <PageShell>
      <div className="min-h-[60vh] grid place-items-center text-center">
        <div>
          <Shield className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">Admin access required.</p>
          <button onClick={() => navigate("/auth")} className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-semibold">Sign in</button>
        </div>
      </div>
    </PageShell>
  );

  const stats = useQuery<Stats>({
    queryKey: ["admin", "stats"],
    queryFn: () => apiFetch<Stats>("/admin/stats", {}, token),
    staleTime: 30 * 1000,
  });

  const videos = useQuery<Video[]>({
    queryKey: ["admin", "videos", tab, q],
    queryFn: () => apiFetch<Video[]>(`/admin/videos?status=${tab === "pending" ? "pending" : ""}&q=${encodeURIComponent(q)}&limit=50`, {}, token),
    staleTime: 30 * 1000,
  });

  const approveVideo = useMutation({
    mutationFn: (id: number) => apiFetch(`/admin/videos/${id}`, { method: "PATCH", body: JSON.stringify({ status: "published" }) }, token),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin"] }); },
  });

  const rejectVideo = useMutation({
    mutationFn: (id: number) => apiFetch(`/admin/videos/${id}`, { method: "PATCH", body: JSON.stringify({ status: "rejected" }) }, token),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin"] }); },
  });

  const deleteVideo = useMutation({
    mutationFn: (id: number) => apiFetch(`/admin/videos/${id}`, { method: "DELETE" }, token),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin"] }); },
  });

  const togglePick = useMutation({
    mutationFn: ({ id, val }: { id: number; val: boolean }) => apiFetch(`/admin/videos/${id}`, { method: "PATCH", body: JSON.stringify({ is_editor_pick: val }) }, token),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin"] }); },
  });

  const statCards = stats.data ? [
    { label: "Total Videos", value: compactNumber(stats.data.total_videos), icon: Film, color: "text-primary" },
    { label: "Pending Review", value: compactNumber(stats.data.pending), icon: Eye, color: "text-accent" },
    { label: "Published", value: compactNumber(stats.data.published), icon: Check, color: "text-green-400" },
    { label: "Users", value: compactNumber(stats.data.total_users), icon: Users, color: "text-blue-400" },
    { label: "Total Views", value: compactNumber(stats.data.total_views), icon: BarChart3, color: "text-gold" },
  ] : [];

  return (
    <PageShell>
      <div className="container-px mx-auto max-w-[1600px]">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] font-bold text-accent">Admin</div>
            <h1 className="font-display text-2xl font-black">Control Panel</h1>
          </div>
        </div>

        {/* Stats */}
        {statCards.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
            {statCards.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-4"
              >
                <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
                <div className="text-2xl font-black">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tabs + search */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex gap-1 glass rounded-full p-1 text-sm">
            <button onClick={() => setTab("pending")} className={`px-4 py-1.5 rounded-full transition ${tab === "pending" ? "bg-accent text-white font-semibold" : "text-muted-foreground hover:text-foreground"}`}>
              Pending {stats.data?.pending ? `(${stats.data.pending})` : ""}
            </button>
            <button onClick={() => setTab("all")} className={`px-4 py-1.5 rounded-full transition ${tab === "all" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}>
              All Videos
            </button>
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search videos…"
            className="flex-1 max-w-xs h-9 px-4 rounded-full bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Video table */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium">Video</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Source</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Status</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Views</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Added</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.isLoading && Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={6} className="px-4 py-3"><div className="h-4 rounded shimmer" /></td>
                  </tr>
                ))}
                {(videos.data ?? []).map((v) => (
                  <tr key={v.id} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-16 shrink-0 rounded-lg overflow-hidden aspect-video bg-black/40">
                          <img src={v.thumbnail_url ?? ""} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium line-clamp-1">{v.title}</div>
                          {v.is_editor_pick && <span className="text-[10px] text-gold font-bold">★ Editor Pick</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground capitalize">{v.source}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        v.status === "published" ? "bg-green-500/15 text-green-400" :
                        v.status === "pending" ? "bg-accent/15 text-accent" :
                        "bg-white/10 text-muted-foreground"
                      }`}>{v.status}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{compactNumber(v.views_count)}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{timeAgo(v.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 justify-end">
                        {v.status === "pending" && (
                          <button
                            onClick={() => approveVideo.mutate(v.id)}
                            title="Approve"
                            className="h-7 w-7 grid place-items-center rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {v.status === "pending" && (
                          <button
                            onClick={() => rejectVideo.mutate(v.id)}
                            title="Reject"
                            className="h-7 w-7 grid place-items-center rounded-lg bg-white/5 text-muted-foreground hover:bg-white/10 transition"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => togglePick.mutate({ id: v.id, val: !v.is_editor_pick })}
                          title="Toggle Editor Pick"
                          className={`h-7 w-7 grid place-items-center rounded-lg transition ${v.is_editor_pick ? "bg-gold/20 text-gold" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}
                        >
                          ★
                        </button>
                        <button
                          onClick={() => { if (confirm("Delete this video?")) deleteVideo.mutate(v.id); }}
                          title="Delete"
                          className="h-7 w-7 grid place-items-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="h-24" />
      </div>
    </PageShell>
  );
}
