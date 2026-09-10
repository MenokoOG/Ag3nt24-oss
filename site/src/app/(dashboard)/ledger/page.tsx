import type { Metadata } from "next";
import { CHAIN_HEAD, RECEIPTS } from "@/data/demo";

export const metadata: Metadata = { title: "HADES — Receipt ledger" };

// Append-only, newest first.
export default function LedgerPage() {
  return (
    <div>
      <div className="ledger__banner" role="status">
        <strong>Chain verified to receipt {CHAIN_HEAD.toLocaleString("en-US")}.</strong>
        <span>A missing or altered receipt breaks the chain, and a broken chain is an incident.</span>
        <span className="ledger__append">append-only</span>
      </div>
      <div className="ledger__table">
        <div className="ledger__scroll">
          <div role="table" aria-label="Receipt ledger">
            <div className="ledger__row ledger__row--head" role="row">
              <span role="columnheader">#</span>
              <span role="columnheader">SLOT</span>
              <span role="columnheader">ACTION</span>
              <span role="columnheader">DECISION</span>
              <span role="columnheader">EVIDENCE</span>
            </div>
            {RECEIPTS.map((r) => (
              <div key={r.n} className="ledger__row ledger__row--body" role="row">
                <span className="ledger__n" role="cell">#{r.n}</span>
                <span className="ledger__slot" role="cell">{r.slot}</span>
                <span className="ledger__action" role="cell">{r.action}</span>
                <span className={`ledger__decision tint--${r.decision}`} role="cell">{r.decision}</span>
                <span className="ledger__evidence" role="cell">{r.evidenceHash}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
