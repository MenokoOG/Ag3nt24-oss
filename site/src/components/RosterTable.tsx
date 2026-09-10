"use client";

import { useState } from "react";
import { REGISTRY, slotLabel } from "@/data/registry";
import { patternBadge } from "@/lib/asset";

// 24 rows in ITF syllabus order, frozen. The rune column is empty until the
// operator asks for it; rune numbers are kernel-internal and appear nowhere
// else on the site (COPY-RULES.md, "Rune numbers").
export function RosterTable() {
  const [rune, setRune] = useState(false);
  return (
    <div className="roster">
      <div>
        <h2 className="h2 h2--tight">The protocol roster</h2>
        <p className="lead" style={{ marginTop: 14, maxWidth: "46ch" }}>
          Twenty-four roles in ITF syllabus order, frozen. The slot number is what receipts, telemetry tags and charters carry.
        </p>
        <button
          type="button"
          className="btn btn--ghost btn--mono"
          style={{ marginTop: 18 }}
          aria-pressed={rune}
          aria-controls="roster-table"
          onClick={() => setRune((v) => !v)}
        >
          {rune ? "hide kernel rune numbers" : "show kernel rune numbers"}
        </button>
      </div>
      <div className="roster__table" id="roster-table" role="table" aria-label="Protocol roster, 24 slots">
        {REGISTRY.map((r) => (
          <div key={r.slot} className="roster__row" role="row">
            <div role="presentation" className="badge" style={{ backgroundImage: `url(${patternBadge(r.slot)})` }} />
            <span className="roster__slot" role="cell">{slotLabel(r.slot)}</span>
            <span className="roster__pattern" role="cell">{r.pattern}</span>
            <span className="roster__domain" role="cell">{r.domain}</span>
            <span className="roster__rune" role="cell" aria-label={rune ? `kernel rune ${r.rune}` : undefined}>
              {rune ? `rune ${r.rune}` : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
