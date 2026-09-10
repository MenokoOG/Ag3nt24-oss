import type { Metadata } from "next";
import { ERADICATION_STEPS, SORT, STAGES } from "@/data/demo";

export const metadata: Metadata = { title: "HADES — Pipeline status" };

export default function PipelinePage() {
  return (
    <div className="pipeline">
      <div className="kpis">
        <div className="tile kpi">
          <div className="kpi__k">RECORDS INGESTED</div>
          <div className="kpi__v">1,482,006</div>
        </div>
        <div className="tile kpi">
          <div className="kpi__k">AWAITING SORT</div>
          <div className="kpi__v kpi__v--cyan">38,910</div>
        </div>
        <div className="tile kpi">
          <div className="kpi__k">GATE REQUESTS OPEN</div>
          <div className="kpi__v kpi__v--pink">4</div>
        </div>
        <div className="tile kpi">
          <div className="kpi__k">KERNEL VERDICTS TODAY</div>
          <div className="kpi__v">612 <small>/ 0 anomalies</small></div>
        </div>
      </div>

      <section className="tile tile--pad" aria-labelledby="sort-title">
        <div className="sort__head">
          <h3 id="sort-title">Sort taxonomy</h3>
          <span>Only <strong>bad</strong> reaches the eradication sequence.</span>
        </div>
        <div className="sort__rows">
          {SORT.map((b) => (
            <div key={b.name} className="sort__row">
              <span className={`sort__name tint--${b.name}`}>{b.name}</span>
              <span className="sort__bar" role="img" aria-label={`${b.name}: ${b.pct}%`}>
                <span className={`sort__fill fill--${b.name}`} style={{ width: `${b.pct}%` }} />
              </span>
              <span className="sort__count">{b.count}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="pipeline__split">
        <section className="tile tile--pad stages" aria-labelledby="stages-title">
          <h3 id="stages-title">Stages</h3>
          {STAGES.map((s) => (
            <div key={s.name} className="stage">
              <span className="stage__dot" style={{ background: s.color }} aria-hidden="true" />
              <span>
                <span className="stage__name">{s.name}</span>
                <span className="stage__note">{s.note}</span>
              </span>
              <span className="stage__state">{s.state}</span>
            </div>
          ))}
        </section>
        <section className="erad" aria-labelledby="erad-title">
          <h3 id="erad-title">Eradication path</h3>
          <p>No auto-eradication path exists under any condition.</p>
          {ERADICATION_STEPS.map((label, i) => (
            <div key={label} className="erad__step">
              <span className="erad__n">{i + 1}</span>
              <span className="erad__label">{label}</span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
