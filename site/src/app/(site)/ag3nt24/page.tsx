import type { Metadata } from "next";
import { Formation } from "@/components/Formation";
import { RosterTable } from "@/components/RosterTable";
import { asset } from "@/lib/asset";

export const metadata: Metadata = { title: "Ag3nt24 — Product overview" };

export default function Ag3nt24Page() {
  return (
    <main className="subpage">
      <div className="container">
        <div className="subpage__head">
          <div>
            <div className="kicker kicker--pink">Product overview</div>
            <h1 className="subpage__banner">
              <img src={asset("/assets/ag3nt24-banner.png")} alt="Ag3nt24" />
            </h1>
            <p className="subpage__lead">A protocol droid framework with an anti-corruption layer. Adapter roles read the inherited AI estate on one side and speak to a modern stack on the other, behind a boundary a human controls.</p>
          </div>
          <div className="card card--purple">
            <div className="kicker kicker--purple">Read this first</div>
            <p>The 24 are a designed protocol roster, one role per ITF pattern. They are definitions and charters, not running agents. Implemented agents: 0.</p>
          </div>
        </div>

        <div className="block steps">
          <div className="card card--sm step">
            <div className="step__n" style={{ color: "var(--ag-neon)" }}>01 OBSERVE</div>
            <p>Scouts make first contact with the estate. Deterministic, under the 24, read-only.</p>
          </div>
          <div className="card card--sm step">
            <div className="step__n" style={{ color: "var(--ag-cyan)" }}>02 ORIENT</div>
            <p>The protocol droid picks the team from the 24 for the job in front of it.</p>
          </div>
          <div className="card card--sm step">
            <div className="step__n" style={{ color: "var(--ag-purple)" }}>03 DECIDE</div>
            <p>The team returns findings and proposals. Tong-Il reconciles them into one proposal for the gate.</p>
          </div>
          <div className="card card--sm step">
            <div className="step__n" style={{ color: "var(--ag-gold)" }}>04 ACT</div>
            <p>A human signs in HADES. One receipt, hash-chained. Then state changes, and not before.</p>
          </div>
        </div>

        <div className="block block--xl">
          <div className="kicker kicker--gold">The formation</div>
          <h2 className="h2">One droid, twenty-four slots.</h2>
          <p className="lead" style={{ margin: "14px 0 22px", maxWidth: "62ch" }}>The protocol droid picks the team for the job in front of it. Hover a slot for its pattern and domain.</p>
          <div className="formation-frame">
            <Formation />
          </div>
        </div>

        <div className="block block--xl">
          <RosterTable />
        </div>
      </div>
    </main>
  );
}
