import { Link } from "wouter";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CATEGORIES, PORNSTARS, STUDIOS, thumbUrl } from "@/lib/videos";
import type { ReactNode } from "react";

export function MenuSidebar({ trigger }: { trigger: ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto border-l border-[color:var(--hairline)] bg-black p-0 text-foreground sm:max-w-md">
        <SheetHeader className="border-b border-[color:var(--hairline)] px-6 py-6">
          <SheetTitle className="flex items-center gap-4 text-xl font-black tracking-wide" style={{ fontFamily: "var(--font-display)" }}>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-[13px] font-black text-primary-foreground">PF</span>
            <span className="text-foreground">Menu</span>
          </SheetTitle>
        </SheetHeader>

        <div className="p-5">
          <SectionLabel>Categories</SectionLabel>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className="rounded-sm border border-[color:var(--hairline)] bg-[color:var(--surface-2)] px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-foreground/85 transition-colors hover:border-primary hover:text-primary"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-[color:var(--hairline)] p-5">
          <SectionLabel>Pornstars Directory</SectionLabel>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {PORNSTARS.map((p) => (
              <button key={p.slug} className="group flex flex-col items-center gap-2">
                <span className="relative block h-14 w-14 overflow-hidden rounded-full border border-[color:var(--hairline)] transition-colors group-hover:border-primary">
                  <img src={thumbUrl(p.avatarSeed, 120, 120)} alt={p.name} className="h-full w-full object-cover" />
                </span>
                <span className="line-clamp-2 text-center text-[10px] font-semibold leading-tight text-foreground/85 group-hover:text-primary">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-[color:var(--hairline)] p-5">
          <SectionLabel>Studios</SectionLabel>
          <div className="mt-3 flex flex-wrap gap-2">
            {STUDIOS.map((s) => (
              <button key={s} className="rounded-full border border-[color:var(--hairline)] bg-[color:var(--surface-2)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-foreground/85 hover:border-primary hover:text-primary">
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-[color:var(--hairline)] p-5">
          <Link href="/" className="block rounded-sm bg-primary px-4 py-3 text-center text-sm font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90">
            Back to Home
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary">{children}</h4>;
}
