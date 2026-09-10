# Ag3nt24 + HADES — Amazônia Futurista design package

Handoff for Claude Code. Two surfaces: the public site (Ag3nt24) and the operator
dashboard (HADES), for classHuman AI LLC — repo `MenokoOG/Ag3nt24-oss`, Apache-2.0.

---

## 0. The contract

**This representation of the application is exactly how the application is expected to
work. Build for this design.** The prototypes in `design-references/` are the
specification, not inspiration and not a mood board:

- Every screen, state, transition and piece of copy in them is intended behavior.
- If an implementation detail conflicts with the design, the design wins — raise the
  conflict rather than silently diverging.
- Do not substitute a component library's default look for what is drawn here. Match the
  values in `design-tokens.css` exactly (hex, radius, type, timing).
- Do not add screens, sections, fields, marketing copy or empty-state text that is not in
  the references. Do not remove any either. Ask first.
- Copy is governed by `COPY-RULES.md`. Treat a violation as a build failure.
- The dark theme is the only theme. There is no light mode to design or ship.

Open the three files in `design-references/` in a browser to see the real thing —
they run standalone, no build step. `screenshots/` is the same thing frozen, one file
per screen, for diffing your build against.

---

## 1. What to build

| Surface | Reference | Routes / screens |
| --- | --- | --- |
| Public site | `Ag3nt24 Site Amazonia.dc.html` | `/` overview · `/ag3nt24` · `/hades` |
| Formation graphic | `Ag3nt24 Formation Dark.dc.html` | embedded in `/ag3nt24` above the roster |
| Operator dashboard | `HADES Dashboard Amazonia.dc.html` | `/signin` · pipeline · roster activation · authorization queue · telemetry · receipt ledger |

Suggested stack (unchanged from the previous package): Next.js App Router + Firebase.
Nothing in the design depends on that choice; keep components vendor-neutral.

### Site behavior

- Header is sticky, `z-index: 100`, dark glass (`rgba(10,15,10,.86)` + `blur(12px)`).
- The three views are separate routes in the build (the prototype switches them in state).
- Roster table: 24 rows in ITF syllabus order, frozen. Columns: badge · slot · pattern ·
  domain · rune. The rune column is empty until the "show kernel rune numbers" toggle is
  pressed; the toggle label flips to "hide kernel rune numbers".
- **Entry into HADES**: the nav carries an "Open HADES" button and the `/hades` view an
  "Open the control room" CTA; both go to the dashboard sign-in.
- **What HADES means, on the `/hades` page, verbatim**: for regular, good data it is the
  **Human Authorized Data Evaluation System**; for bad data it is the **Human Authorized
  Data Eradication Sequence**. Both cards ship, side by side, above the sort taxonomy.
- The status band ("Nothing in this repository is production capability", `0`, `81/81`, `29`)
  is a prop-gated block in the prototype. It ships **on** by default.

### Dashboard behavior

- Sign-in is the entry state. Operator identity is recorded on every receipt.
- Sidebar: five destinations, active item filled neon with dark ink; chain status block
  pinned to the bottom; sign out below it.
- Authorization queue: one card per open GateRequest, with slot tag, action, bucket,
  waiting time, summary, and four evidence fields (run id, target, evidence hash, prior
  receipt). Two actions: **Deny** (ghost, pink border) and **Sign and approve** (filled).
  Deciding removes the card. When the queue empties, the gate/seal empty state shows with
  "Queue clear." and "Every decision this session wrote one receipt. The chain is intact."
- A GateRequest whose kernel ACL verdict is `denied` still renders, and its copy states that
  approval is not available while the verdict stands. Do not hide it, and do not make the
  approve button work.
- Roster activation stages charters for a run. It does **not** start agents; the banner
  says so and must stay.
- Telemetry is read-only: three source tags plus the log stream.
- Receipt ledger is append-only, newest first, with the chain-verified banner.

---

## 2. Visual system

All values live in `design-tokens.css`. Summary:

**Ground.** One page gradient, `#0A0F0A → #0b1a0d → #0A3D0A` top to bottom, with
`assets/canopy-tile.png` repeating beneath it at 620px and held back by the near-opaque
gradient. Cards are `rgba(10,61,10,.38)` with a `1px #1c5220` border. Opaque surfaces
(sidebar, log blocks, login panel) are `#0d1c0f`.

**Type.** Orbitron 700 for headings and 500 for UI labels and buttons; Rajdhani 400/500
for all body copy and table cells; JetBrains Mono for slot tags, hashes, chips, commands
and log lines. Orbitron is never used for paragraphs — it is unreadable at 16px.

**Shape.** Base radius is **8px** for everything: cards, buttons, inputs, chips, images.
`50%` appears only where width equals height — status dots, logo discs, the 24 pattern
badges.

**Motion.** 200ms ease-out on hover (color shift, small shadow change, at most
`translateY(-1px)`); 420ms fade + `translateY(16px → 0)` on entry; ambient loops for the
firefly particles (9–14s), the status dot breathe (2.6s) and the progress shimmer (3s).
Only `transform` and `opacity` animate. No scale-up hovers, no glow pulses on buttons.

**Chips.** Every mono chip, tag and pill label carries `white-space: nowrap`. Rows of
chips wrap between pills, never inside one. This was the single most frequent defect
while building; enforce it in the component, not per usage.

**Contrast.** Every tint/ink pair in the tokens file is contrast-checked against the dark
ground. Do not pair a dark ramp step with a dark tint (e.g. never `#0f5410` text on
`rgba(57,255,20,.24)`), and do not lower body copy to alpha ink over a glow.

**Layout.** CSS grid, 1280px max width, 1.5rem side gutters, section gaps
`clamp(4rem,8vw,8rem)`. Multi-column blocks are `repeat(auto-fit, minmax(Npx, 1fr))` and
collapse under 768px with no horizontal overflow. Do not use `h-screen`; use `100dvh`.

---

## 3. Assets

`design-references/assets/` — final art, already cut to transparent PNG where needed.

| File | Where it is used |
| --- | --- |
| `ag3nt24-emblem.png` | site hero; center of the formation graphic |
| `ag3nt24-wordmark.png` | site nav lockup |
| `ag3nt24-banner.png` | the `h1` of `/ag3nt24` (image inside the heading, `alt="Ag3nt24"`) |
| `pattern-01.png` … `pattern-24.png` | the 24 pattern badges: formation nodes, site roster rows, HADES roster cards. Index == slot number. |
| `hades-mark.png` | HADES sidebar mark and login header mark |
| `hades-emblem.png` | login panel artwork |
| `hades-wordmark.png` | cut and available; currently unplaced |
| `hades-flow.png` | full-width flow figure on `/hades` |
| `gate-empty.png` | authorization queue empty state |
| `canopy-tile.png` | repeating page texture under the gradient |
| `og-card.png` | `og:image` |

Rules: badges keep a 1:1 box and `border-radius: 50%`; the emblem and gate art sit on the
dark ground with no plate behind them; the canopy tile is always behind a gradient at
≥88% coverage so type stays legible.

Every decorative image gets `alt=""`; every informative one gets a real description — the
flow figure's alt text in the reference is the intended text, keep it.

---

## 4. Data the UI expects

- **Registry**: 24 rows, `{slot, pattern, domain, rune}`, frozen, from
  `conformance/registry.json`. Slots zero-padded `01`…`24`.
- **Slot tag** format: `a24-<slot>-<pattern-slug>`, e.g. `a24-03-do-san`.
- **GateRequest**: `{slot, action, bucket, runId, target, evidenceHash, priorReceiptHash,
  waiting, aclVerdict, summary}`.
- **Receipt**: `{n, slot, action, decision, evidenceHash, priorHash, by, ts}`; decision is
  `APPROVE | DENY | TIMEOUT`.
- **Buckets**: `good · bad · messy · work-data · new`. Only `bad` reaches the eradication
  sequence.
- **Telemetry tags**: `ag3nt24:run-id`, `ag3nt24:component`, `ag3nt24:env`.

The sample values in the prototypes are realistic placeholders, not fixtures to ship.

---

## 5. Accessibility

Slot 15 (Juche) owns operator experience; a bad gate interface is a safety problem.

- Focus is never the browser default: `2px solid #00CED1`, `outline-offset: 2px`.
- Body copy at 4.5:1 minimum against what is actually behind it, including glows and
  textures. Headline-scale type may sit at 3:1.
- Hit targets 44px minimum on touch.
- The gate decision must be reachable and operable by keyboard alone, and the deny path
  must never be harder to reach than the approve path.
- Honor `prefers-reduced-motion`: drop the firefly particles, the shimmer and the entry
  translate; keep opacity changes.

---

## 6. Open items

1. **Breakpoint strategy** — the references are fluid with `auto-fit` grids; if the build
   needs named breakpoints, pick mobile-first and say so in the repo.
2. **Gate detail fields** — the four evidence fields are derived from the ADRs; confirm
   against the Claude Cowork ADR before freezing the schema.
3. **`hades-wordmark.png`** — cut but unplaced. Decide whether the sidebar uses the
   wordmark or the Orbitron text.
4. **Contact links** — `classhuman.org`, `github.com/MenokoOG/Ag3nt24-oss`,
   `security@classhuman.org` are the current set. Add real socials when they exist.
5. **Telemetry stream** — the log block is static in the prototype; define the real source
   and paging before wiring it.

---

## 7. Package contents

```
README.md                     this file — read section 0 first
COPY-RULES.md                 hard constraints on every user-facing string
design-tokens.css             drop-in variables, keyframes and base reset
design-references/            the specification: three runnable prototypes
  Ag3nt24 Site Amazonia.dc.html
  HADES Dashboard Amazonia.dc.html
  Ag3nt24 Formation Dark.dc.html
  support.js                  runtime the prototypes load; not part of the build
  assets/                     final art, 34 files
screenshots/                  one per screen, for diffing your build
```
