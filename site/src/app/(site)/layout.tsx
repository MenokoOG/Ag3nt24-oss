import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="site">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
