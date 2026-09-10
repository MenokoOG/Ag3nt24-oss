"use client";

import { REGISTRY, slotLabel } from "@/data/registry";
import { patternBadge } from "@/lib/asset";
import { useDashboard } from "./DashboardState";

// Activation stages a charter for the run. It does not start an agent, and
// the banner that says so stays (README §1, Dashboard behavior).
export function RosterActivation() {
  const { team, toggleSlot, clearTeam } = useDashboard();
  return (
    <div>
      <div className="activation__banner" role="status">
        <span>The roster is a protocol definition. Activating a slot stages its charter for the run; it does not start an agent.</span>
        <span className="activation__count">{team.length} staged</span>
        <button type="button" className="activation__clear" onClick={clearTeam}>Clear</button>
      </div>
      <div className="activation__grid">
        {REGISTRY.map((r) => {
          const on = team.includes(r.slot);
          return (
            <button
              key={r.slot}
              type="button"
              className="slot-card"
              aria-pressed={on}
              aria-label={`${slotLabel(r.slot)} ${r.pattern}, ${r.domain}${on ? ", staged" : ""}`}
              onClick={() => toggleSlot(r.slot)}
            >
              <div role="presentation" className="slot-card__badge" style={{ backgroundImage: `url(${patternBadge(r.slot)})` }} />
              <span className="slot-card__slot">{slotLabel(r.slot)}</span>
              <span className="slot-card__text">
                <span className="slot-card__pattern">{r.pattern}</span>
                <span className="slot-card__domain">{r.domain}</span>
              </span>
              <span className="slot-card__dot" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
