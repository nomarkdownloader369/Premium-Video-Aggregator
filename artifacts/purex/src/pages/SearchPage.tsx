import { useSearch, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { VideoCard } from "@/components/VideoCard";
import { apiFetch, type Video } from "@/lib/api";

export function SearchPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialQ = params.get("q") ?? "";
  const [q, setQ] = useState(initialQ);
  const [, navigate] = useLocation();

  useEffect(() => {
    const p = new URLSearchParams(search);
    setQ(p.get("q") ?? "");
  }, [search]);

  const { data, isLoading } = useQuery<Video[]>({
    queryKey: ["search", q],
    queryFn: () => apiFetch<Video[]>(`/videos?q=${encodeURIComponent(q)}&limit=48`),
    enabled: q.length > 0,
    staleTime: 2 * 60 * 1000,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <PageShell>
      <div className="container-px mx-auto max-w-[1600px]">
        <div className="max-w-2xl mb-10">
          <h1 className="font-display text-3xl font-black mb-4">Search</h1>
          <form onSubmit={submit} className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search titles, performers, tags…"
              className="w-full h-12 pl-11 pr-4 rounded-2xl bg-card border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
              autoFocus
            />
          </form>
        </div>

        {q && (
          <div className="mb-6 text-sm text-muted-foreground">
            {isLoading ? "Searching…" : `${data?.length ?? 0} results for "${q}"`}
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="rounded-2xl aspect-video bg-card shimmer" />
            ))}
          </div>
        )}

        {!isLoading && data && data.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {data.map((v) => <VideoCard key={v.id} video={v} />)}
          </div>
        )}

        {!isLoading && data && data.length === 0 && q && (
          <div className="min-h-[40vh] grid place-items-center text-center">
            <div>
              <div className="text-5xl mb-4">🔍</div>
              <h2 className="font-display text-xl font-bold mb-2">No results found</h2>
              <p className="text-muted-foreground">Try different keywords or browse categories.</p>
            </div>
          </div>
        )}

        {!q && (
          <div className="min-h-[40vh] grid place-items-center text-center">
            <div>
              <Search className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">Start typing to search for videos</p>
            </div>
          </div>
        )}

        <div className="h-24" />
      </div>
    </PageShell>
  );
}
