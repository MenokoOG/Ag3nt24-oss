import { REGISTRY, slotLabel } from "@/data/registry";
import { asset, patternBadge } from "@/lib/asset";

// Geometry from design-references/Ag3nt24 Formation Dark.dc.html.
// Two arcs around the droid: slots 01–12 inner (r=196), 13–24 outer (r=292).
// Chord between neighbours must exceed the node box (5.2% of 760 ≈ 40 units).
const CX = 380, CY = 200, W = 760, H = 560;

type Node = { slot: number; x: number; y: number; left: string; top: string; title: string };

function layout(): Node[] {
  return REGISTRY.map((entry, i) => {
    const inner = i < 12;
    const k = inner ? i : i - 12;
    const r = inner ? 196 : 292;
    const a0 = inner ? 190 : 186, a1 = inner ? 350 : 354;
    const deg = a0 + (k * (a1 - a0)) / 11;
    const rad = (deg * Math.PI) / 180;
    const x = CX + r * Math.cos(rad);
    const y = CY - r * Math.sin(rad);
    return {
      slot: entry.slot,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      left: `${Math.round((x / W) * 1000) / 10}%`,
      top: `${Math.round((y / H) * 1000) / 10}%`,
      title: `${slotLabel(entry.slot)} ${entry.pattern} — ${entry.domain}`,
    };
  });
}

const NODES = layout();

export function Formation() {
  return (
    <div className="formation">
      <div className="formation__stage">
        <svg viewBox={`0 0 ${W} ${H}`} className="formation__svg" aria-hidden="true">
          <defs>
            <radialGradient id="fmFlare" cx="50%" cy="34%" r="62%">
              <stop offset="0%" stopColor="#FFD700" stopOpacity=".22" />
              <stop offset="55%" stopColor="#39FF14" stopOpacity=".12" />
              <stop offset="100%" stopColor="#0A0F0A" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="380" cy="200" rx="360" ry="300" fill="url(#fmFlare)" />
          {NODES.map((n) => (
            <line key={n.slot} x1="380" y1="212" x2={n.x} y2={n.y} stroke="#39FF14" strokeOpacity=".14" strokeWidth="1" />
          ))}
          <path d="M 96 271 A 292 292 0 0 0 664 271" fill="none" stroke="#00CED1" strokeOpacity=".18" strokeWidth="1" strokeDasharray="2 8" strokeLinecap="round" />
          <path d="M 204 286 A 196 196 0 0 0 556 286" fill="none" stroke="#00CED1" strokeOpacity=".18" strokeWidth="1" strokeDasharray="2 8" strokeLinecap="round" />
        </svg>

        <img
          src={asset("/assets/ag3nt24-emblem.png")}
          alt="Ag3nt24, the protocol droid, between a legacy estate and a modern stack"
          className="formation__emblem"
        />
        <div className="formation__label">PROTOCOL DROID</div>

        <ul className="formation__nodes" aria-label="The 24 slots">
          {NODES.map((n) => (
            <li key={n.slot} className="formation__node" style={{ left: n.left, top: n.top }} title={n.title}>
              <div className="formation__badge" style={{ backgroundImage: `url(${patternBadge(n.slot)})` }}>
                <span className="formation__num">{slotLabel(n.slot)}</span>
              </div>
              <span className="sr-only">{n.title}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="formation__caption">ONE PROTOCOL DROID · A 24-MEMBER ROSTER, ONE ROLE PER ITF PATTERN</p>
    </div>
  );
}
