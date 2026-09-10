# site

The public Ag3nt24 site and the HADES dashboard demo, built to the specification in
`docs/design_handoff_amazonia/`. Next.js App Router, static export, no backend.

## Routes

| Surface | Route | Reference |
| --- | --- | --- |
| Public site | `/` · `/ag3nt24` · `/hades` | `Ag3nt24 Site Amazonia.dc.html` |
| Formation graphic | embedded in `/ag3nt24` | `Ag3nt24 Formation Dark.dc.html` |
| Dashboard | `/signin` · `/pipeline` · `/roster` · `/queue` · `/telemetry` · `/ledger` | `HADES Dashboard Amazonia.dc.html` |

## Run

```
cd site
npm ci
npm run dev        # http://localhost:3000
npm run build      # static export to site/out
```

`npm run build` runs `scripts/sync-registry.mjs` first, which regenerates
`src/data/registry.ts` from `conformance/registry.json`. The registry is frozen; the
site reads it and never edits it.

## Deploy

`.github/workflows/pages.yml` builds and publishes to GitHub Pages on every push to
`main` that touches `site/`. It is a project site, so the build sets
`NEXT_PUBLIC_BASE_PATH=/<repo-name>`; every asset reference goes through
`src/lib/asset.ts` so the prefix is applied once.

Repository settings: **Pages → Build and deployment → Source: GitHub Actions**.

## Decisions

- **No component library, no Tailwind.** `src/styles/tokens.css` is the handoff's
  `design-tokens.css`; `site.css` and `dashboard.css` are class translations of the
  prototypes' inline styles, value for value.
- **Fonts** are self-hosted through `next/font` (Orbitron, Rajdhani, JetBrains Mono)
  and exposed as `--font-*` variables that the tokens map onto `--ag-font-*`.
- **Breakpoints** (README §6 item 1): the layouts stay fluid with `auto-fit` grids.
  Named breakpoints exist only where a fixed-column grid has to collapse: the
  dashboard shell at 900px, the sign-in split and roster table at 768px, dense rows
  at 560px. Mobile-first in intent; the desktop layout is the default and the media
  queries narrow it.
- **Dashboard state** (staged team, gate decisions) is a client context under the
  `(dashboard)` route group. It is a demo session: not persisted, cleared on sign out.
- **Sign-in** performs no credential check and sends nothing anywhere. The form
  exists because operator identity is recorded on every receipt.
- **A denied kernel ACL verdict** still renders its GateRequest; the approve button is
  disabled and Deny stays available. Fail closed.
- **Rune numbers** appear only behind the roster toggle on `/ag3nt24`, labelled as
  kernel-internal. They are in no receipt, tag or log line.
- **Sidebar** uses the Orbitron text, not `hades-wordmark.png` (README §6 item 3).

## Data

Demo fixtures live in `src/data/demo.ts` and follow README §4 shapes (`GateRequest`,
`Receipt`, buckets, telemetry tags). Replace that module to wire a real source.
