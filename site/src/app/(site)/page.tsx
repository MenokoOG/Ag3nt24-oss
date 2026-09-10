import Link from "next/link";
import { asset } from "@/lib/asset";

// The status band is prop-gated in the prototype and ships on by default.
const STATUS_BANNER = true;

export default function OverviewPage() {
  return (
    <main>
      <section className="hero">
        <div className="hero__fx" aria-hidden="true">
          <div className="hero__flare" />
          <span className="ag-firefly" style={{ top: "22%", left: "9%", width: 5, height: 5, background: "#FFD700", boxShadow: "0 0 10px #FFD700", animation: "ag-fly 10s ease-in-out infinite" }} />
          <span className="ag-firefly" style={{ top: "58%", left: "38%", width: 4, height: 4, background: "#39FF14", boxShadow: "0 0 10px #39FF14", animation: "ag-fly 13s ease-in-out 1.5s infinite" }} />
          <span className="ag-firefly" style={{ top: "34%", left: "72%", width: 5, height: 5, background: "#FF69B4", boxShadow: "0 0 12px rgba(255,105,180,.85)", animation: "ag-fly 11s ease-in-out .8s infinite" }} />
        </div>
        <div className="container hero__grid">
          <div className="ag-rise">
            <div className="hero__tag">
              <span className="hero__dot ag-breathe" aria-hidden="true" />
              Legacy AI systems modernization
            </div>
            <h1 className="hero__title">Agents propose.<br /><em>A human signs.</em></h1>
            <p className="hero__lead">Ag3nt24 is a protocol droid framework for the seam between an inherited AI estate and a modern stack. Adapter roles read the old system, a deterministic kernel gates every crossing, and nothing changes state until a person puts their name on it.</p>
            <p className="hero__lead">The bottleneck is authority, not capability.</p>
            <div className="hero__actions">
              <Link href="/ag3nt24/" className="btn btn--lg btn--gold">Read the protocol</Link>
              <Link href="/hades/" className="btn btn--lg btn--ghost">What HADES does</Link>
            </div>
          </div>
          <div className="ag-rise ag-rise-2">
            <div className="hero__art">
              <div className="hero__glow" aria-hidden="true" />
              <img
                src={asset("/assets/ag3nt24-emblem.png")}
                alt="Ag3nt24 protocol droid emblem: a droid between a legacy estate and a modern stack, with a human authorization seal"
                className="hero__emblem"
              />
            </div>
          </div>
        </div>
      </section>

      {STATUS_BANNER && (
        <section className="status" aria-labelledby="status-title">
          <div className="status__band">
            <div>
              <div className="kicker kicker--purple">Status, honest</div>
              <h2 id="status-title" className="status__title">Nothing in this repository is production capability.</h2>
              <p>Read the system first, then choose. There is no benchmark and no benchmark claim.</p>
            </div>
            <div className="status__stats">
              <div className="stat">
                <div className="stat__value stat__value--gold">0</div>
                <div className="stat__label">Implemented agents. The 24 are definitions, one per pattern.</div>
              </div>
              <div className="stat">
                <div className="stat__value stat__value--neon">81/81</div>
                <div className="stat__label">Conformance checks passing. Registry 24/24, join 24/24, exit 0.</div>
              </div>
              <div className="stat">
                <div className="stat__value stat__value--cyan">29</div>
                <div className="stat__label">Architecture decision records. Everything under docs is specification.</div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container grid-2 grid-2--280" style={{ alignItems: "start" }}>
          <div>
            <div className="kicker kicker--pink">What is Ag3nt24</div>
            <h2 className="h2">One protocol droid, a roster of 24, and a gate nobody walks around.</h2>
            <p className="lead">The protocol droid picks the team for the job. The team returns findings and proposals. HADES is where a person turns them into actions.</p>
            <Link href="/ag3nt24/" className="btn btn--md btn--ghost" style={{ marginTop: 22 }}>The full roster</Link>
          </div>
          <div className="stack">
            <div className="card card--hover">
              <h3>Scouts make first contact</h3>
              <p>A deterministic layer under the 24 reads the estate. Read-only discovery does not gate; anything that writes, mutates, deploys or commands does.</p>
            </div>
            <div className="card card--hover">
              <h3>The kernel is the anti-corruption layer</h3>
              <p>Four short gates of straight-line boolean logic on slot indices. No I/O, no clock, no randomness. Every verdict reproduces on any day, and clearing the ACL is never authorization to act.</p>
            </div>
            <div className="card card--hover">
              <h3>Twenty-four patterns, fixed</h3>
              <p>Each role is bound to one ITF Taekwon-Do pattern, Chon-Ji through Tong-Il, for the discipline that pattern teaches. The slot is the only numbering the framework uses: receipts, telemetry tags and charters all carry it.</p>
            </div>
            <div className="card card--hover">
              <h3>Fail closed</h3>
              <p>On uncertainty, missing artifacts, invalid signatures or anomalies: deny. Every human decision writes one receipt, hash-chained to the one before it.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="panel">
            <div className="panel__flare" aria-hidden="true" />
            <div className="panel__grid">
              <div>
                <div className="kicker kicker--gold">What is HADES</div>
                <h2 className="h2">The control room at the boundary.</h2>
                <p className="lead" style={{ marginTop: 16, maxWidth: "none" }}>HADES is the human&apos;s only surface: a data lake and engineering platform for anti-corruption where scouts contact the legacy system and hand off to the team. It holds the gate, the receipt writer, the prompt store, the ETL review and all telemetry.</p>
                <Link href="/hades/" className="btn btn--md btn--neon" style={{ marginTop: 24, padding: "12px 22px" }}>Inside HADES</Link>
              </div>
              <div className="stack">
                <div className="card card--dark">
                  <div className="meaning__label" style={{ color: "var(--ag-neon)" }}>ON THE WAY IN</div>
                  <div className="meaning__name">Human Authorized Data Evaluation System</div>
                  <p>Ingested data is sorted, validated and transformed so the current structures and the source of truth can be identified.</p>
                </div>
                <div className="card card--dark">
                  <div className="meaning__label" style={{ color: "var(--ag-gold)" }}>ON THE WAY OUT</div>
                  <div className="meaning__name">Human Authorized Data Eradication Sequence</div>
                  <p>Sandbox, security audit, gate request, a human signature, one receipt, then execution. No auto-eradication path under any condition.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid-2" style={{ alignItems: "center" }}>
          <div>
            <div className="kicker kicker--pink">Built in the open</div>
            <h2 className="h2">Apache-2.0, every ruling on the record.</h2>
            <p className="lead" style={{ marginTop: 16, maxWidth: "58ch" }}>The design is public before the capability is. Twenty-nine architecture decision records, the ended v1.0.0 carried as read-only prior art, and a conformance gate that is never adjusted to make a run pass. Every commit carries a DCO sign-off.</p>
            <div className="cmd-row">
              <span className="cmd">npm run build:kernel</span>
              <span className="cmd">npm run conform</span>
              <span className="cmd">uv run pytest</span>
            </div>
          </div>
          <div className="terminal" aria-label="Conformance run output">
            <div className="faint">$ npm run conform</div>
            <div><span className="terminal__key">checks:</span> 81/81</div>
            <div><span className="terminal__key">registry:</span> 24/24 match</div>
            <div><span className="terminal__key">join:</span> 24/24 match</div>
            <div><span className="terminal__key terminal__key--gold">scenarios:</span> 5/5 match</div>
            <div className="faint">exit 0</div>
          </div>
        </div>
      </section>

      <section className="section section--last">
        <div className="container contact grid-2">
          <div>
            <h2 className="h2 h2--tight">Read the system first.</h2>
            <p className="lead" style={{ marginTop: 14 }}>Ag3nt24 is built by classHuman AI LLC, a legacy AI systems modernization research and open-source organization. WDVA Certified Veteran Owned Business, cert #WDVACHAI26.</p>
            <p className="contact__laha">LAHA: Love All Humans Always.</p>
          </div>
          <div className="contact__links">
            <a href="https://github.com/MenokoOG/Ag3nt24-oss" className="contact__link"><span>GitHub · MenokoOG/Ag3nt24-oss</span><span aria-hidden="true">&#8594;</span></a>
            <a href="https://classhuman.org" className="contact__link"><span>classhuman.org</span><span aria-hidden="true">&#8594;</span></a>
            <a href="mailto:security@classhuman.org" className="contact__link"><span>security@classhuman.org</span><span aria-hidden="true">&#8594;</span></a>
          </div>
        </div>
      </section>
    </main>
  );
}
