import { Link } from "wouter";

const COLS = [
  {
    title: "Discover",
    links: [
      { label: "Home", to: "/" },
      { label: "Trending", to: "/trending" },
      { label: "Categories", to: "/categories" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Submit a video", to: "/submit" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "Sign in", to: "/auth" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", to: "/terms" },
      { label: "Privacy Policy", to: "/privacy" },
      { label: "DMCA", to: "/dmca" },
      { label: "2257", to: "/2257" },
    ],
  },
];

const TAGS = [
  "Amateur", "MILF", "Teen", "Lesbian", "Anal", "Big Tits", "Blowjob",
  "POV", "Threesome", "BBW", "Interracial", "Asian", "Latina", "Ebony",
  "Blonde", "Brunette", "Mature", "Squirting", "Cumshots", "Hardcore",
  "Outdoor", "Japanese", "Indian", "BDSM", "Massage",
];

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-white/5">
      <div className="container-px mx-auto max-w-[1600px] py-16 grid gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent shadow-glow" />
            <span className="font-display text-xl font-extrabold">
              Pure<span className="text-gradient-red">X</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            A premium adult video aggregator. All content aggregated from third-party sources.
            We do not host any files.
          </p>
          <div className="mt-6">
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">Popular Tags</div>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((t) => (
                <Link key={t} to={`/search?q=${encodeURIComponent(t)}`}>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10 cursor-pointer transition">{t}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
        {COLS.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold mb-3">{col.title}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to}>
                    <span className="hover:text-foreground transition cursor-pointer">{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5">
        <div className="container-px mx-auto max-w-[1600px] py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} PureX. All rights reserved.</span>
          <span className="text-center">This site contains adult content. By using this site you agree to our Terms of Service.</span>
        </div>
      </div>
    </footer>
  );
}
