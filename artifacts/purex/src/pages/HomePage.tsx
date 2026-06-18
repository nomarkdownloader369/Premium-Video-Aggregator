import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/PageShell";
import { HeroSection } from "@/components/HeroSection";
import { Top10Section } from "@/components/Top10Section";
import { VideoRow } from "@/components/VideoRow";
import { CategoryStrip } from "@/components/CategoryStrip";
import { apiFetch, type Video, type Category } from "@/lib/api";

function useVideos(params: string, key: string) {
  return useQuery<Video[]>({
    queryKey: ["videos", key],
    queryFn: () => apiFetch<Video[]>(`/videos?${params}`),
    staleTime: 2 * 60 * 1000,
  });
}

export function HomePage() {
  const trending = useVideos("order=trending&limit=24", "trending");
  const recent = useVideos("order=recent&limit=12", "recent");
  const mostViewed = useVideos("order=views&limit=12", "views");
  const cats = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => apiFetch<Category[]>("/categories"),
    staleTime: 10 * 60 * 1000,
  });

  const heroSlides = trending.data ?? [];
  const editorPicks = trending.data?.filter((v) => v.is_editor_pick) ?? [];

  return (
    <PageShell noPadding>
      {heroSlides.length > 0 ? (
        <HeroSection videos={heroSlides} />
      ) : (
        <div className="min-h-[80vh] grid place-items-center">
          <div className="text-center">
            <div className="inline-flex h-12 w-12 mb-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            <div className="text-muted-foreground text-sm">Loading cinematic experience…</div>
          </div>
        </div>
      )}

      {trending.data && trending.data.length > 0 && (
        <Top10Section videos={trending.data} />
      )}

      <VideoRow
        eyebrow="Live signal"
        title="Trending now"
        subtitle="What the world is watching right now"
        videos={trending.data?.slice(0, 12) ?? []}
        href="/trending"
        accent="red"
        loading={trending.isLoading}
      />

      <VideoRow
        eyebrow="Curated"
        title="Editor picks"
        subtitle="Hand-selected for quality"
        videos={editorPicks.length > 0 ? editorPicks : (trending.data?.slice(5, 15) ?? [])}
        accent="gold"
        loading={trending.isLoading}
      />

      <VideoRow
        eyebrow="Most viewed"
        title="All-time favorites"
        subtitle="The most-watched videos on PureX"
        videos={mostViewed.data ?? []}
        accent="ember"
        loading={mostViewed.isLoading}
      />

      <VideoRow
        eyebrow="Fresh"
        title="Latest uploads"
        subtitle="Straight from the pipeline"
        videos={recent.data ?? []}
        accent="ice"
        loading={recent.isLoading}
      />

      {cats.data && cats.data.length > 0 && (
        <CategoryStrip categories={cats.data} />
      )}

      <div className="h-24" />
    </PageShell>
  );
}
