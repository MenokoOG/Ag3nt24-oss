"use client";

import { slotTag } from "@/data/registry";
import { asset } from "@/lib/asset";
import { useDashboard } from "./DashboardState";

// One card per open GateRequest. Deciding removes the card. A request whose
// kernel ACL verdict is denied still renders; its approve button is inert.
// Deny is always reachable: fail closed, and the deny path is never harder
// to reach than the approve path.
export function AuthorizationQueue() {
  const { openGates, decide } = useDashboard();

  return (
    <div className="queue">
      {openGates.map((g) => {
        const denied = g.aclVerdict === "denied";
        return (
          <article key={g.id} className="gate" aria-labelledby={`gate-${g.id}-action`}>
            <div className="gate__head">
              <span className="gate__slot">{slotTag(g.slot)}</span>
              <span id={`gate-${g.id}-action`} className="gate__action">{g.action}</span>
              <span className={`gate__bucket tint--${g.bucket}`}>bucket · {g.bucket}</span>
              <span className="gate__waiting">waiting {g.waiting}</span>
            </div>
            <p className="gate__summary">{g.summary}</p>
            <dl className="gate__evidence">
              <div className="gate__field"><dt className="gate__field-k">RUN ID</dt><dd className="gate__field-v" style={{ margin: 0 }}>{g.runId}</dd></div>
              <div className="gate__field"><dt className="gate__field-k">TARGET</dt><dd className="gate__field-v" style={{ margin: 0 }}>{g.target}</dd></div>
              <div className="gate__field"><dt className="gate__field-k">EVIDENCE HASH</dt><dd className="gate__field-v" style={{ margin: 0 }}>{g.evidenceHash}</dd></div>
              <div className="gate__field"><dt className="gate__field-k">PRIOR RECEIPT</dt><dd className="gate__field-v" style={{ margin: 0 }}>{g.priorReceiptHash}</dd></div>
            </dl>
            <div className="gate__foot">
              <span className={`gate__acl${denied ? " gate__acl--denied" : ""}`}>kernel ACL · {g.aclVerdict}</span>
              <span className="gate__note">Clearing the ACL is not authorization to act.</span>
              <span className="gate__actions">
                <button type="button" className="gate__deny" onClick={() => decide(g.id, "DENY")}>Deny</button>
                <button
                  type="button"
                  className="gate__approve"
                  disabled={denied}
                  aria-disabled={denied}
                  title={denied ? "Approval is not available while the ACL verdict stands." : undefined}
                  onClick={() => decide(g.id, "APPROVE")}
                >
                  Sign and approve
                </button>
              </span>
            </div>
          </article>
        );
      })}

      {openGates.length === 0 && (
        <div className="queue__empty" role="status">
          <img src={asset("/assets/gate-empty.png")} alt="An open gate with a closed gold receipt seal resting on a plinth" />
          <div className="queue__empty-title">Queue clear.</div>
          <p>Every decision this session wrote one receipt. The chain is intact.</p>
        </div>
      )}
    </div>
  );
}
