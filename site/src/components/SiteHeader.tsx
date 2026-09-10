"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { asset } from "@/lib/asset";

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/ag3nt24/", label: "Ag3nt24" },
  { href: "/hades/", label: "HADES" },
] as const;

const normalize = (p: string) => (p.endsWith("/") ? p : `${p}/`);

export function SiteHeader() {
  const pathname = normalize(usePathname() || "/");
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="site-header__lockup" aria-label="Ag3nt24 overview">
          <span className="site-header__disc" aria-hidden="true"><span /></span>
          <img src={asset("/assets/ag3nt24-wordmark.png")} alt="Ag3nt24" className="site-header__wordmark" />
          <span className="site-header__license">Apache-2.0</span>
        </Link>
        <nav className="site-nav" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="site-nav__link"
              aria-current={pathname === normalize(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/signin/" className="btn btn--nav btn--gold">Open HADES</Link>
          <a href="https://github.com/MenokoOG/Ag3nt24-oss" className="btn btn--nav btn--github">GitHub</a>
        </nav>
      </div>
    </header>
  );
}
