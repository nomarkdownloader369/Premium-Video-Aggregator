import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

interface Props {
  children: ReactNode;
  noPadding?: boolean;
}

export function PageShell({ children, noPadding }: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className={`flex-1 ${noPadding ? "" : "pt-20"}`}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
