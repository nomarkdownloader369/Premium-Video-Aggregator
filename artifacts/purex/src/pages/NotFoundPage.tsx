import { Link } from "wouter";
import { PageShell } from "@/components/PageShell";

export function NotFoundPage() {
  return (
    <PageShell>
      <div className="min-h-[60vh] grid place-items-center text-center">
        <div>
          <div className="font-display text-8xl font-black text-gradient-red mb-4">404</div>
          <h1 className="font-display text-2xl font-bold mb-2">Page not found</h1>
          <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist.</p>
          <Link to="/">
            <span className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition cursor-pointer">
              Back to Home
            </span>
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
