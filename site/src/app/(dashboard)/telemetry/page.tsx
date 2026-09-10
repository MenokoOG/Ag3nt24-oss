import type { Metadata } from "next";
import { LOG, RUN_ID } from "@/data/demo";

export const metadata: Metadata = { title: "HADES — Telemetry log" };

// Read-only. Three source tags plus the log stream. The stream is static in
// this demo; README §6 item 5 leaves the real source and paging open.
export default function TelemetryPage() {
  return (
    <div className="telemetry">
      <div className="telemetry__tags">
        <span className="tag tag--run">ag3nt24:run-id = {RUN_ID}</span>
        <span className="tag tag--component">ag3nt24:component = control-plane</span>
        <span className="tag tag--env">ag3nt24:env = dev</span>
        <span className="telemetry__note">One pipeline, tagged at the source. Read-only.</span>
      </div>
      <div className="log" role="log" aria-label="Telemetry stream">
        {LOG.map((l, i) => (
          <div key={i} className="log__line">
            <span className="log__ts">{l.ts}</span>{"  "}
            <span style={{ color: l.color }}>{l.level}</span>{"  "}
            <span className="log__tag">{l.tag}</span>{"  "}
            {l.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
