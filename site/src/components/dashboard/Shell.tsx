"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { CHAIN_HEAD, RUN_ID } from "@/data/demo";
import { asset } from "@/lib/asset";
import { useDashboard, useScrollTop } from "./DashboardState";

const SCREENS = [
  { href: "/pipeline/", label: "Pipeline", crumb: "Data control", title: "Pipeline status" },
  { href: "/roster/", label: "Roster activation", crumb: "Protocol", title: "Roster activation" },
  { href: "/queue/", label: "Authorization queue", crumb: "Human gate", title: "Authorization queue" },
  { href: "/telemetry/", label: "Telemetry", crumb: "Observability", title: "Telemetry log" },
  { href: "/ledger/", label: "Receipt ledger", crumb: "Evidence", title: "Receipt ledger" },
] as const;

const normalize = (p: string) => (p.endsWith("/") ? p : `${p}/`);

export function Shell({ children }: { children: ReactNode }) {
  const pathname = normalize(usePathname() || "/pipeline/");
  const router = useRouter();
  const { operator, signOut } = useDashboard();
  const current = SCREENS.find((s) => s.href === pathname) ?? SCREENS[0];
  useScrollTop(pathname);

  const onSignOut = () => {
    signOut();
    router.push("/signin/");
  };

  return (
    <div className="dash">
      <div className="shell">
        <aside className="sidebar">
          <div className="sidebar__brand">
            <img src={asset("/assets/hades-mark.png")} alt="" />
            <strong>HADES</strong>
          </div>
          <nav className="sidebar__nav" aria-label="Dashboard">
            {SCREENS.map((s) => (
              <Link key={s.href} href={s.href} className="sidebar__link" aria-current={s.href === pathname ? "page" : undefined}>
                {s.label}
              </Link>
            ))}
          </nav>
          <div className="sidebar__chain">
            <div className="sidebar__chain-k">CHAIN</div>
            <div className="sidebar__chain-v">Verified to receipt {CHAIN_HEAD.toLocaleString("en-US")}. No breaks.</div>
          </div>
          <button type="button" className="sidebar__signout" onClick={onSignOut}>Sign out</button>
        </aside>

        <div className="shell__main">
          <header className="topbar">
            <div className="topbar__titles">
              <div className="topbar__crumb">{current.crumb}</div>
              <h1 className="topbar__title">{current.title}</h1>
            </div>
            <span className="topbar__run">
              <span className="topbar__run-dot ag-pulse" aria-hidden="true" />
              run {RUN_ID} · active
            </span>
            <span className="topbar__operator">{operator}</span>
          </header>
          <main className="screen">
            <div className="screen__body" key={pathname}>{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
