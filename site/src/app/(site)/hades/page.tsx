import type { Metadata } from "next";
import Link from "next/link";
import { asset } from "@/lib/asset";

export const metadata: Metadata = { title: "HADES — Product overview" };

export default function HadesPage() {
  return (
    <main className="subpage">
      <div className="container">
        <div className="subpage__head">
          <div>
            <div className="kicker kicker--pink">Product overview</div>
            <h1 className="subpage__title">HADES</h1>
            <p className="subpage__lead">The control room of the framework and the human&apos;s only surface. Humans make the decisions here; the team returns findings and proposals, and HADES is where they become actions.</p>
            <Link href="/signin/" className="btn btn--lg btn--gold" style={{ marginTop: 24, boxShadow: "none" }}>Open the control room</Link>
          </div>
          <div className="card card--gold">
            <div className="kicker kicker--gold">Two gates, two words</div>
            <p>The kernel is the ACL: machine, logs only. The gate is the human gate, in HADES, the only thing that writes receipts.</p>
          </div>
        </div>

        <div className="block meaning">
          <div className="meaning__card meaning__card--good">
            <div className="kicker kicker--neon">Regular, good data</div>
            <h3>Human Authorized Data Evaluation System</h3>
            <p>On the way in. Ingested data is sorted, validated and transformed so the current structures and the source of truth can be identified. This is what HADES means for every bucket except one.</p>
          </div>
          <div className="meaning__card meaning__card--bad">
            <div className="kicker kicker--pink">Bad data</div>
            <h3>Human Authorized Data Eradication Sequence</h3>
            <p>On the way out, and only for the bad bucket. Sandbox, security audit, gate request, a human signature, one receipt, then execution. No auto-eradication path under any condition.</p>
          </div>
        </div>

        <div className="block">
          <div className="kicker kicker--neon">The sort taxonomy</div>
          <div className="taxonomy">
            <span className="bucket bucket--good">good</span>
            <span className="bucket bucket--bad">bad</span>
            <span className="bucket bucket--messy">messy</span>
            <span className="bucket bucket--work-data">work-data</span>
            <span className="bucket bucket--new">new</span>
            <span className="taxonomy__note">Only <strong>bad</strong> reaches the eradication sequence.</span>
          </div>
        </div>

        <div className="block features">
          <div className="card card--feature">
            <h3>The gate and the receipt writer</h3>
            <p>One signature, one receipt, then state changes. Approve, deny and timeout all write a receipt. No execution path skips the gate.</p>
          </div>
          <div className="card card--feature">
            <h3>The prompt store</h3>
            <p>System prompts and the 24 charters as deployed artifacts, versioned, with the source commit SHA. Authoring stays in the repository.</p>
          </div>
          <div className="card card--feature">
            <h3>Pipeline review</h3>
            <p>Human interaction with the ETL pipeline: the sort, the validation rules, the transforms, and the review of each bucket.</p>
          </div>
          <div className="card card--feature">
            <h3>Telemetry, tagged by slot</h3>
            <p>One pipeline for every scout, pattern and kernel call. Group view aggregates the tag, single-slot view filters it. Same rows, two queries.</p>
          </div>
          <div className="card card--feature">
            <h3>The legacy-AI channel</h3>
            <p>When the team needs to talk to the inherited AI system directly, it happens here, through the kernel, logged.</p>
          </div>
          <div className="card card--feature card--cyan">
            <h3>Accessibility-first design</h3>
            <p>A bad gate interface is a safety problem. Operator workflow and gate ergonomics have an owner in the roster: slot 15, Juche.</p>
          </div>
        </div>

        <figure className="figure">
          <img
            src={asset("/assets/hades-flow.png")}
            alt="HADES flow: scout, pattern and kernel proposals converge on the human gate; one signature writes one receipt into an append-only chain, and state changes only after it. The data sort holds good, bad, messy, work-data and new; only bad reaches eradication."
          />
          <figcaption>PROPOSE · HUMAN GATE · RECEIPT · STATE CHANGE</figcaption>
        </figure>

        <div className="block block--xl receipt-panel">
          <div className="receipt-panel__grid">
            <div>
              <h2 className="h2 h2--tight">One receipt per decision, chained.</h2>
              <p className="lead" style={{ marginTop: 14, maxWidth: "none" }}>A receipt records the proposing slot, the proposed action, the evidence hash, the decision, the deciding human and the timestamp. A missing or altered receipt breaks the chain, and a broken chain is an incident, not a warning.</p>
            </div>
            <div className="receipt-sample" aria-label="Sample receipt">
              <div><span className="receipt-sample__k">slot</span>a24-03-do-san</div>
              <div><span className="receipt-sample__k">action</span>eradicate :: bucket=bad</div>
              <div><span className="receipt-sample__k">evidence</span><span style={{ color: "var(--ag-gold)" }}>a41f9c2e8b07d5…</span></div>
              <div><span className="receipt-sample__k">decision</span><span style={{ color: "var(--ag-neon)" }}>APPROVE</span></div>
              <div><span className="receipt-sample__k">by</span>operator@classhuman.org</div>
              <div><span className="receipt-sample__k">prev</span><span style={{ color: "var(--ag-purple)" }}>7d10be44af931c…</span></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
