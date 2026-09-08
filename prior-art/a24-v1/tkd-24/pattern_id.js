'use strict';

const PATTERNS = Object.freeze({
  EUI_AM: Object.freeze({
    slot: 1,
    name: 'EUI_AM',
    korean: 'Eui-Am',
    tenet: 'Indomitable national prosperity',
    duty: 'Validates that a proposed action preserves system value, budget envelope, capacity, and mission continuity.',
    failure_mode: 'Wasteful or extractive proposals; capacity exhaustion; budget breach.'
  }),
  YON_GAE: Object.freeze({
    slot: 2,
    name: 'YON_GAE',
    korean: 'Yon-Gae',
    tenet: 'Overwhelming defensive force',
    duty: 'Hard-deny path for active compromise, hostile proposal, privilege escalation, and exploit replay.',
    failure_mode: 'Detected breach in progress; signature of known hostile actor; replay nonce match.'
  }),
  UL_JI: Object.freeze({
    slot: 3,
    name: 'UL_JI',
    korean: 'Ul-Ji',
    tenet: 'Asymmetric defense, thorn-force',
    duty: 'Detects indirect attacks: lateral movement, rate abuse, adversarial prompt chains, weak-signal intrusion.',
    failure_mode: 'Anomaly score above threshold; rate envelope exceeded; chain signature mismatch.'
  }),
  SE_JONG: Object.freeze({
    slot: 4,
    name: 'SE_JONG',
    korean: 'Se-Jong',
    tenet: 'Language, alphabet, systematization',
    duty: 'Owns canonical data formats, IDL, field names, serialization, hash input, and contract message structure. Normalizes every input before any other gate evaluates it.',
    failure_mode: 'Schema violation; non-canonical representation; ambiguous field encoding.'
  }),
  DO_SAN: Object.freeze({
    slot: 5,
    name: 'DO_SAN',
    korean: 'Do-San',
    tenet: 'Lifelong discipline and education',
    duty: 'Converts machine decisions into reason codes, operator runbooks, and remediation paths. Decorator role across every other pattern verdict.',
    failure_mode: 'No reason code generable for a verdict (the verdict itself is then suspect).'
  }),
  YUL_GOK: Object.freeze({
    slot: 6,
    name: 'YUL_GOK',
    korean: 'Yul-Gok',
    tenet: 'Scholarship; precision; invariant verification',
    duty: 'Static verifier. Reviews policy logic, proofs, table correctness, deterministic behavior, invariant drift.',
    failure_mode: 'Invariant violation; policy contradiction; non-deterministic kernel output.'
  }),
  PO_EUN: Object.freeze({
    slot: 7,
    name: 'PO_EUN',
    korean: 'Po-Eun',
    tenet: 'Unbroken loyalty; oath; covenant',
    duty: 'Contract-compliance gate. Checks whether the request honors declared contracts, SOT commitments, provenance, mission constraints.',
    failure_mode: 'Provenance break; contract violation; missing oath signature.'
  }),
  HWA_RANG: Object.freeze({
    slot: 8,
    name: 'HWA_RANG',
    korean: 'Hwa-Rang',
    tenet: 'Youth unit cohesion; cadence',
    duty: 'Coordinates multi-agent sequencing. Prevents duplicated effort, avoids agent conflict, enforces team cadence.',
    failure_mode: 'Agent conflict; race condition; duplicate concurrent proposal.'
  }),
  JOONG_GUN: Object.freeze({
    slot: 9,
    name: 'JOONG_GUN',
    korean: 'Joong-Gun',
    tenet: 'Surgical interdiction',
    duty: 'Identifies when a proposal must be terminated, not repaired. Handles hostile-chain severance.',
    failure_mode: 'Hostile chain detected; rehabilitation unviable; sever-or-fail decision.'
  }),
  CHOONG_JANG: Object.freeze({
    slot: 10,
    name: 'CHOONG_JANG',
    korean: 'Choong-Jang',
    tenet: 'Confinement; unrealized maturity',
    duty: 'Quarantine gate. Blocks incomplete, immature, under-proven, or trapped-state proposals. Routes to HADES rehab.',
    failure_mode: 'Incomplete evidence chain; agent state untrained for proposed action; below-threshold confidence.'
  }),
  GE_BAEK: Object.freeze({
    slot: 11,
    name: 'GE_BAEK',
    korean: 'Ge-Baek',
    tenet: 'Severe strict military discipline',
    duty: 'Execution discipline controller. Enforces exact command structure, timing, sequencing, stance, no-extra-motion policy.',
    failure_mode: 'Command sequence invalid; timing window missed; extra-motion detected.'
  }),
  TOI_GYE: Object.freeze({
    slot: 12,
    name: 'TOI_GYE',
    korean: 'Toi-Gye',
    tenet: 'Mature doctrine; harvest',
    duty: 'Knowledge-base custodian. Maintains doctrine, test cases, architecture memory, controlled policy evolution.',
    failure_mode: 'Doctrine reference missing; policy stale; doctrine version drift.'
  }),
  SO_SAN: Object.freeze({
    slot: 13,
    name: 'SO_SAN',
    korean: 'So-San',
    tenet: 'Late-stage mobilization',
    duty: 'Incident recovery commander. Activates reserve controls, degraded-mode workflows, restoration procedures, emergency coordination.',
    failure_mode: 'N/A — So-San activates when other patterns deny; it does not gate normal flow.'
  }),
  JUCHE: Object.freeze({
    slot: 14,
    name: 'JUCHE',
    korean: 'Juche',
    tenet: 'Self-determination',
    duty: 'Autonomy boundary gate. Determines whether an agent, human, or subsystem has authority to decide locally or must escalate.',
    failure_mode: 'Decision exceeds local authority; escalation required to CEO/CTO per ADR-0003.'
  }),
  MOON_MOO: Object.freeze({
    slot: 15,
    name: 'MOON_MOO',
    korean: 'Moon-Moo',
    tenet: 'Permanent land defense',
    duty: 'Perimeter guardian. Protects inbound and outbound boundaries, external system calls, foreign writes, cross-domain actions, bridge trust.',
    failure_mode: 'Cross-domain call without authorization; outbound destination unverified; foreign signature invalid.'
  }),
  KWANG_GAE: Object.freeze({
    slot: 16,
    name: 'KWANG_GAE',
    korean: 'Kwang-Gae',
    tenet: 'Recovery and expansion',
    duty: 'SOT recovery agent. Restores lost state, expands validated state, rolls back corruption, recovers clean territory after drift.',
    failure_mode: 'Recovery target unverified; rollback would violate invariants.'
  }),
  CHOI_YONG: Object.freeze({
    slot: 17,
    name: 'CHOI_YONG',
    korean: 'Choi-Yong',
    tenet: 'Loyalty under betrayal risk',
    duty: 'Betrayal detector. Flags insider risk, conflict of interest, compromised authority, command-channel betrayal.',
    failure_mode: 'Authority signature pattern shift; signer-behavior anomaly; insider abuse signal.'
  }),
  WON_HYO: Object.freeze({
    slot: 18,
    name: 'WON_HYO',
    korean: 'Won-Hyo',
    tenet: 'Spiritual renewal; doctrine introduction',
    duty: 'Rehabilitation doctrine agent. Converts failed proposals into retraining, correction, and AI rehabilitation plans (handoff to HADES).',
    failure_mode: 'N/A — Won-Hyo activates on prior pattern denials; it produces rehabilitation specs.'
  }),
  YOO_SIN: Object.freeze({
    slot: 19,
    name: 'YOO_SIN',
    korean: 'Yoo-Sin',
    tenet: 'Alliance-risk discipline',
    duty: 'Third-party trust gate. Checks external integrations, vendor APIs, foreign agents, "ally but unsafe" dependencies.',
    failure_mode: 'Vendor signature missing; foreign agent unverified; third-party dependency stale.'
  }),
  TONG_IL: Object.freeze({
    slot: 20,
    name: 'TONG_IL',
    korean: 'Tong-Il',
    tenet: 'Unification; consensus',
    duty: 'Consensus merge controller. Produces final merged state after all gates agree. Resolves split-brain decisions.',
    failure_mode: 'Verdict disagreement above threshold; split-brain unresolvable.'
  }),
  CHOONG_MOO: Object.freeze({
    slot: 21,
    name: 'CHOONG_MOO',
    korean: 'Choong-Moo',
    tenet: 'Naval command; checked potential',
    duty: 'High-risk capability escrow. Holds dangerous capability until authority, timing, and mission fit are proven.',
    failure_mode: 'Capability requested without sufficient justification; mission-fit unproven; authority window not open.'
  }),
  CHON_JI: Object.freeze({
    slot: 22,
    name: 'CHON_JI',
    korean: 'Chon-Ji',
    tenet: 'Beginning; heaven and earth',
    duty: 'Genesis initializer. Boots new tables, initializes epochs, starts clean runs, creates baseline state.',
    failure_mode: 'N/A — Chon-Ji is the boot path; failures here halt the kernel before any other pattern runs.'
  }),
  SAM_IL: Object.freeze({
    slot: 23,
    name: 'SAM_IL',
    korean: 'Sam-Il',
    tenet: 'Coordinated independence action',
    duty: 'Release and mobilization gate. Controls coordinated launch events, public release, activation windows, synchronized action.',
    failure_mode: 'Release window not open; sync target missing; coordinated quorum unmet.'
  }),
  DAN_GUN: Object.freeze({
    slot: 24,
    name: 'DAN_GUN',
    korean: 'Dan-Gun',
    tenet: 'Foundational identity',
    duty: 'Root identity anchor. Owns root trust, founding identity, system lineage, constitutional configuration.',
    failure_mode: 'Root identity tamper; lineage break; constitutional drift.'
  })
});

(function validateAtLoad() {
  const keys = Object.keys(PATTERNS);
  if (keys.length !== 24) {
    throw new Error(`PATTERNS must contain exactly 24 entries, got ${keys.length}`);
  }
  const slots = keys.map(k => PATTERNS[k].slot).sort((a, b) => a - b);
  for (let i = 0; i < 24; i++) {
    if (slots[i] !== i + 1) {
      throw new Error(`PATTERNS slots must be contiguous 1..24; missing slot ${i + 1}`);
    }
  }
  for (const k of keys) {
    if (PATTERNS[k].name !== k) {
      throw new Error(`PATTERNS[${k}].name must equal "${k}", got "${PATTERNS[k].name}"`);
    }
  }
})();

function patternBySlot(slotNumber) {
  for (const k of Object.keys(PATTERNS)) {
    if (PATTERNS[k].slot === slotNumber) return PATTERNS[k];
  }
  return null;
}

function patternByName(name) {
  return PATTERNS[name] || null;
}

function allPatterns() {
  return Object.keys(PATTERNS)
    .map(k => PATTERNS[k])
    .sort((a, b) => a.slot - b.slot);
}

module.exports = {
  PATTERNS,
  patternBySlot,
  patternByName,
  allPatterns
};
