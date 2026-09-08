'use strict';

const { PATTERNS } = require('./pattern_id');

const CAPABILITIES = Object.freeze({
  RESOURCE_INTEGRITY: Object.freeze({
    name: 'RESOURCE_INTEGRITY',
    owning_pattern: 'EUI_AM',
    description: 'Preserves system value, budget envelope, capacity, and mission continuity for a proposed action.'
  }),
  BREACH_SUPPRESSION: Object.freeze({
    name: 'BREACH_SUPPRESSION',
    owning_pattern: 'YON_GAE',
    description: 'Hard-deny path for active compromise, hostile proposal, privilege escalation, and exploit replay.'
  }),
  ASYMMETRIC_DEFENSE: Object.freeze({
    name: 'ASYMMETRIC_DEFENSE',
    owning_pattern: 'UL_JI',
    description: 'Detects indirect attacks: lateral movement, rate abuse, adversarial prompt chains, weak-signal intrusion.'
  }),
  CANONICAL_SCHEMA: Object.freeze({
    name: 'CANONICAL_SCHEMA',
    owning_pattern: 'SE_JONG',
    description: 'Owns canonical data formats, IDL, field names, serialization, hash input, contract message structure.'
  }),
  OPERATOR_READABILITY: Object.freeze({
    name: 'OPERATOR_READABILITY',
    owning_pattern: 'DO_SAN',
    description: 'Decorator capability: converts machine decisions into reason codes, operator runbooks, and remediation paths. Enriches other pattern verdicts; does not hard-deny.'
  }),
  STATIC_VERIFICATION: Object.freeze({
    name: 'STATIC_VERIFICATION',
    owning_pattern: 'YUL_GOK',
    description: 'Static verifier: policy logic, proofs, table correctness, deterministic behavior, invariant drift.'
  }),
  CONTRACT_COMPLIANCE: Object.freeze({
    name: 'CONTRACT_COMPLIANCE',
    owning_pattern: 'PO_EUN',
    description: 'Checks whether the request honors declared contracts, SOT commitments, provenance, mission constraints.'
  }),
  SWARM_COORDINATION: Object.freeze({
    name: 'SWARM_COORDINATION',
    owning_pattern: 'HWA_RANG',
    description: 'Coordinates multi-agent sequencing. Prevents duplicated effort, avoids agent conflict, enforces team cadence.'
  }),
  SURGICAL_INTERDICTION: Object.freeze({
    name: 'SURGICAL_INTERDICTION',
    owning_pattern: 'JOONG_GUN',
    description: 'Identifies when a proposal must be terminated, not repaired. Handles hostile-chain severance.'
  }),
  QUARANTINE: Object.freeze({
    name: 'QUARANTINE',
    owning_pattern: 'CHOONG_JANG',
    description: 'Blocks incomplete, immature, under-proven, or trapped-state proposals. Routes to HADES rehab.'
  }),
  EXECUTION_DISCIPLINE: Object.freeze({
    name: 'EXECUTION_DISCIPLINE',
    owning_pattern: 'GE_BAEK',
    description: 'Enforces exact command structure, timing, sequencing, stance, no-extra-motion policy.'
  }),
  DOCTRINE_CUSTODY: Object.freeze({
    name: 'DOCTRINE_CUSTODY',
    owning_pattern: 'TOI_GYE',
    description: 'Knowledge-base custodian. Maintains doctrine, test cases, architecture memory, controlled policy evolution.'
  }),
  INCIDENT_RECOVERY: Object.freeze({
    name: 'INCIDENT_RECOVERY',
    owning_pattern: 'SO_SAN',
    description: 'Incident recovery commander: activates reserve controls, degraded-mode workflows, restoration procedures.'
  }),
  AUTONOMY_BOUNDARY: Object.freeze({
    name: 'AUTONOMY_BOUNDARY',
    owning_pattern: 'JUCHE',
    description: 'Determines whether an agent, human, or subsystem has authority to decide locally or must escalate.'
  }),
  PERIMETER_GUARD: Object.freeze({
    name: 'PERIMETER_GUARD',
    owning_pattern: 'MOON_MOO',
    description: 'Protects inbound and outbound boundaries, external system calls, foreign writes, cross-domain actions, bridge trust.'
  }),
  SOT_RECOVERY: Object.freeze({
    name: 'SOT_RECOVERY',
    owning_pattern: 'KWANG_GAE',
    description: 'Restores lost state, expands validated state, rolls back corruption, recovers clean territory after drift.'
  }),
  BETRAYAL_DETECTION: Object.freeze({
    name: 'BETRAYAL_DETECTION',
    owning_pattern: 'CHOI_YONG',
    description: 'Flags insider risk, conflict of interest, compromised authority, command-channel betrayal.'
  }),
  REHABILITATION_DOCTRINE: Object.freeze({
    name: 'REHABILITATION_DOCTRINE',
    owning_pattern: 'WON_HYO',
    description: 'Converts failed proposals into retraining, correction, and AI rehabilitation plans (handoff to HADES).'
  }),
  THIRD_PARTY_TRUST: Object.freeze({
    name: 'THIRD_PARTY_TRUST',
    owning_pattern: 'YOO_SIN',
    description: 'Checks external integrations, vendor APIs, foreign agents, "ally but unsafe" dependencies.'
  }),
  CONSENSUS_MERGE: Object.freeze({
    name: 'CONSENSUS_MERGE',
    owning_pattern: 'TONG_IL',
    description: 'Produces final merged state after all gates agree. Resolves split-brain decisions.'
  }),
  CAPABILITY_ESCROW: Object.freeze({
    name: 'CAPABILITY_ESCROW',
    owning_pattern: 'CHOONG_MOO',
    description: 'Holds dangerous capability until authority, timing, and mission fit are proven.'
  }),
  GENESIS_INITIALIZATION: Object.freeze({
    name: 'GENESIS_INITIALIZATION',
    owning_pattern: 'CHON_JI',
    description: 'Genesis initializer: boots new tables, initializes epochs, starts clean runs, creates baseline state.'
  }),
  RELEASE_MOBILIZATION: Object.freeze({
    name: 'RELEASE_MOBILIZATION',
    owning_pattern: 'SAM_IL',
    description: 'Controls coordinated launch events, public release, activation windows, synchronized action.'
  }),
  ROOT_IDENTITY: Object.freeze({
    name: 'ROOT_IDENTITY',
    owning_pattern: 'DAN_GUN',
    description: 'Root identity anchor: owns root trust, founding identity, system lineage, constitutional configuration.'
  })
});

// Index 0 = capability whose owning pattern sits at slot 1.
// COBOL kernel emits CAPABILITY=N where N is the 1-based capability slot
// (confirmed against bridge/rune_table_writer.js, which applies no translation).
const CAPABILITIES_BY_SLOT = Object.freeze([
  'RESOURCE_INTEGRITY',
  'BREACH_SUPPRESSION',
  'ASYMMETRIC_DEFENSE',
  'CANONICAL_SCHEMA',
  'OPERATOR_READABILITY',
  'STATIC_VERIFICATION',
  'CONTRACT_COMPLIANCE',
  'SWARM_COORDINATION',
  'SURGICAL_INTERDICTION',
  'QUARANTINE',
  'EXECUTION_DISCIPLINE',
  'DOCTRINE_CUSTODY',
  'INCIDENT_RECOVERY',
  'AUTONOMY_BOUNDARY',
  'PERIMETER_GUARD',
  'SOT_RECOVERY',
  'BETRAYAL_DETECTION',
  'REHABILITATION_DOCTRINE',
  'THIRD_PARTY_TRUST',
  'CONSENSUS_MERGE',
  'CAPABILITY_ESCROW',
  'GENESIS_INITIALIZATION',
  'RELEASE_MOBILIZATION',
  'ROOT_IDENTITY'
]);

(function validateAtLoad() {
  const keys = Object.keys(CAPABILITIES);
  if (keys.length !== 24) {
    throw new Error(`CAPABILITIES must contain exactly 24 entries, got ${keys.length}`);
  }
  for (const k of keys) {
    if (CAPABILITIES[k].name !== k) {
      throw new Error(`CAPABILITIES[${k}].name must equal "${k}"`);
    }
    const owner = CAPABILITIES[k].owning_pattern;
    if (!PATTERNS[owner]) {
      throw new Error(`CAPABILITIES[${k}].owning_pattern "${owner}" is not a valid pattern`);
    }
  }
  const owners = keys.map(k => CAPABILITIES[k].owning_pattern);
  if (new Set(owners).size !== 24) {
    throw new Error('Each pattern must own exactly one capability');
  }
  if (CAPABILITIES_BY_SLOT.length !== 24) {
    throw new Error('CAPABILITIES_BY_SLOT must contain 24 entries');
  }
  for (let i = 0; i < 24; i++) {
    const capKey = CAPABILITIES_BY_SLOT[i];
    if (!CAPABILITIES[capKey]) {
      throw new Error(`CAPABILITIES_BY_SLOT[${i}] = "${capKey}" is not a valid capability`);
    }
    if (PATTERNS[CAPABILITIES[capKey].owning_pattern].slot !== i + 1) {
      throw new Error(`CAPABILITIES_BY_SLOT[${i}] owning pattern slot mismatch`);
    }
  }
})();

function capabilityByName(name) {
  return CAPABILITIES[name] || null;
}

function capabilitiesByPattern(patternName) {
  return Object.keys(CAPABILITIES)
    .filter(k => CAPABILITIES[k].owning_pattern === patternName)
    .map(k => CAPABILITIES[k]);
}

function allCapabilities() {
  return Object.keys(CAPABILITIES).map(k => CAPABILITIES[k]);
}

function capabilityBySlot(slotNumber) {
  if (!Number.isInteger(slotNumber) || slotNumber < 1 || slotNumber > 24) return null;
  return CAPABILITIES[CAPABILITIES_BY_SLOT[slotNumber - 1]];
}

module.exports = {
  CAPABILITIES,
  CAPABILITIES_BY_SLOT,
  capabilityByName,
  capabilitiesByPattern,
  allCapabilities,
  capabilityBySlot
};
