import { Switch, Route, Router as WouterRouter, Link } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MenuSidebar } from "@/components/MenuSidebar";
import { STUDIOS } from "@/lib/videos";
import Home from "@/pages/Home";
import VideoPage from "@/pages/VideoPage";

const queryClient = new QueryClient();

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--hairline)] bg-black/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-3 py-3 sm:gap-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-[13px] font-black tracking-tight text-primary-foreground">
            PF
          </span>
          <span
            className="text-lg font-black uppercase tracking-tight sm:text-xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Perv<span className="text-primary">Flix</span>
          </span>
        </Link>

        <form
          role="search"
          className="ml-auto flex min-w-0 flex-1 items-center gap-2 rounded-sm border border-[color:var(--hairline)] bg-[color:var(--surface-2)] px-3 py-2 focus-within:border-primary lg:max-w-xl"
          onSubmit={(e) => e.preventDefault()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-muted-foreground">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3-3" />
          </svg>
          <input
            type="search"
            placeholder="Search films, studios, performers…"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </form>

        <MenuSidebar
          trigger={
            <button
              aria-label="Open menu"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-sm border border-[color:var(--hairline)] bg-[color:var(--surface-2)] text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          }
        />
      </div>

      <div className="border-t border-[color:var(--hairline)]">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto py-3">
            <span className="mr-1 shrink-0 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Studios
            </span>
            {STUDIOS.map((s, i) => (
              <button
                key={s}
                className={
                  "shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors " +
                  (i === 0
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-[color:var(--hairline)] bg-[color:var(--surface)] text-foreground/85 hover:border-primary hover:text-primary")
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[color:var(--hairline)] bg-[color:var(--surface)]">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-sm bg-primary text-[13px] font-black text-primary-foreground">PF</span>
            <span className="text-lg font-black uppercase tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              Perv<span className="text-primary">Flix</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            A cinematic theater for full-length studio releases. Curated, high-fidelity, free forever.
          </p>
        </div>
        <FooterCol title="Browse" items={["Home", "Studios", "Pornstars", "4K", "New Releases"]} />
        <FooterCol title="Discover" items={["Trending", "Most Viewed", "Editor's Picks", "By Category", "By Year"]} />
        <FooterCol title="Legal" items={["Terms", "Privacy", "DMCA", "2257", "Report Content"]} />
      </div>
      <div className="border-t border-[color:var(--hairline)]">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-2 px-6 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} PervFlix. Adults only (18+).</span>
          <span>No accounts. No sign-up. 100% free catalog.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary">{title}</h4>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item}>
            <a href="#" className="text-sm text-foreground/75 transition-colors hover:text-primary">
              {item}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function AppRouter() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-8rem)]">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/video/:slug" component={VideoPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <SiteFooter />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRouter />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
