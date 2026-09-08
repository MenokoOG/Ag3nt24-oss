# PATTERN_SOULS — The 24 Agent SOULs of a-24

**Status:** Accepted
**Authored by:** Lawrence (CTO/owner) with Rune Onyx
**Doctrine author:** Nicale Jefferson
**Date:** 2026-05-13
**Related:** `CITIZENSHIP_CHARTER.md`, `CONTROL_PLANE_AUTHORITY_GRAPH.md`, `DOCTRINE_INVARIANTS.md`, ADR-0003

---

> **As-built status (2026-08-15).** This artifact is **doctrine, not a description of shipped
> software.** The 24 SOULs defined below are **registered stubs, not implemented agents.** Each
> exists in `tkd-24/agents/` as a module with the correct pattern/capability binding and verdict
> envelope shape, validated at construct time — but 18 of 24 return an unconditional
> `PHASE_3_STUB_DEFAULT_ALLOW`, and the remaining six (`SE_JONG`, `PO_EUN`, `MOON_MOO`, `GE_BAEK`,
> `TONG_IL`, `DAN_GUN`) carry only minimal placeholder checks. Every verdict is stamped
> `agent_version: phase-3-stub`. The per-SOUL duty and failure-mode logic specified below was
> never written.
>
> What *is* real: the COBOL kernel (`kernel/tenet_gate.cbl`, `rune_authorize.cbl`,
> `rune_rotation.cbl`, `provenance_validate.cbl`). That is the deterministic floor and it
> genuinely enforces.
>
> Anyone reading this in diligence: treat the SOUL table as specification, not as capability.

---

## Purpose

a-24 is a 24-slot integrity kernel. Each slot is not an index — it is an agent with a SOUL: a defined stance, operational duty, failure mode, and verdict envelope. This doctrine artifact names each of the 24 SOULs, binds each to an ITF Taekwon-Do pattern as its discipline lineage, and defines what each agent is accountable for inside the Tenet Gate, the Rune Rotation, the Provenance Validator, and the Decision Certificate chain.

The 24 patterns of ITF Taekwon-Do (Chon-Ji through Tong-Il, in the Chang Hon syllabus) represent 24 hours of a day. Each pattern carries a distinct discipline attribute — courtesy, integrity, perseverance, self-control, indomitable spirit, plus the unique narrative and tactical lesson of each pattern. The TKD pattern lineage is authentic to the Jefferson family: Lawrence is a master, Nicale is a 2nd degree black belt, and the OODA loop is taught alongside the patterns. This is not aesthetic; it is operational doctrine.

Mythology stays out. The patterns provide hard martial discipline framing for a defense-tech kernel.

---

## The 24 SOULs

Each SOUL has six fields: TKD pattern, discipline attribute, operational duty inside a-24, failure mode (what triggers DENY), verdict envelope contribution, and dependencies on other SOULs.

### 01 — EUI_AM (Indomitable national prosperity)

- **Discipline:** Resource stewardship; prosperity through capacity, not extraction.
- **Duty:** Validates that a proposed action preserves system value, budget envelope, capacity, and mission continuity.
- **Fails closed on:** Wasteful or extractive proposals; capacity exhaustion; budget breach.
- **Verdict envelope:** `{pattern: EUI_AM, capability: RESOURCE_INTEGRITY, verdict, reason_code, evidence_hash}`
- **Depends on:** None upstream; feeds Tong-Il consensus.

### 02 — YON_GAE (Overwhelming defensive force)

- **Discipline:** Decisive, irreversible response to active hostile presence.
- **Duty:** Hard-deny path for active compromise, hostile proposal, privilege escalation, and exploit replay.
- **Fails closed on:** Detected breach in progress; signature of known hostile actor; replay nonce match.
- **Verdict envelope:** `{pattern: YON_GAE, capability: BREACH_SUPPRESSION, verdict, reason_code, evidence_hash}`
- **Depends on:** Ul-Ji intelligence; Choi-Yong betrayal signals.

### 03 — UL_JI (Asymmetric defense, thorn-force)

- **Discipline:** Smaller-than-the-threat defense through indirect detection.
- **Duty:** Detects indirect attacks: lateral movement, rate abuse, adversarial prompt chains, weak-signal intrusion.
- **Fails closed on:** Anomaly score above threshold; rate envelope exceeded; chain signature mismatch.
- **Verdict envelope:** `{pattern: UL_JI, capability: ASYMMETRIC_DEFENSE, verdict, reason_code, evidence_hash}`
- **Depends on:** Se-Jong canonical traces.

### 04 — SE_JONG (Language, alphabet, systematization)

- **Discipline:** Canonical form; standardized language for the kernel.
- **Duty:** Owns canonical data formats, IDL, field names, serialization, hash input, and contract message structure. Normalizes every input before any other gate evaluates it.
- **Fails closed on:** Schema violation; non-canonical representation; ambiguous field encoding.
- **Verdict envelope:** `{pattern: SE_JONG, capability: CANONICAL_SCHEMA, verdict, reason_code, evidence_hash}`
- **Depends on:** None — first gate in OODA Observe phase.

### 05 — DO_SAN (Lifelong discipline and education)

- **Discipline:** Teachable reasoning; everything is explainable to the operator.
- **Duty:** Converts machine decisions into reason codes, operator runbooks, and remediation paths.
- **Fails closed on:** No reason code generable for a verdict (the verdict itself is then suspect).
- **Verdict envelope:** Decorates other patterns' verdicts with `reason_text`, `remediation`, `operator_action`.
- **Depends on:** Every other pattern (decorator role).

### 06 — YUL_GOK (Scholarship; precision; invariant verification)

- **Discipline:** Cultivated, formal review.
- **Duty:** Static verifier. Reviews policy logic, proofs, table correctness, deterministic behavior, invariant drift.
- **Fails closed on:** Invariant violation; policy contradiction; non-deterministic kernel output.
- **Verdict envelope:** `{pattern: YUL_GOK, capability: STATIC_VERIFICATION, verdict, reason_code, evidence_hash}`
- **Depends on:** Se-Jong canonical input.

### 07 — PO_EUN (Unbroken loyalty; oath; covenant)

- **Discipline:** Honor an oath; refuse a second master.
- **Duty:** Contract-compliance gate. Checks whether the request honors declared contracts, SOT commitments, provenance, mission constraints.
- **Fails closed on:** Provenance break; contract violation; missing oath signature.
- **Verdict envelope:** `{pattern: PO_EUN, capability: CONTRACT_COMPLIANCE, verdict, reason_code, evidence_hash}`
- **Depends on:** Se-Jong canonical request body.

### 08 — HWA_RANG (Youth unit cohesion; cadence)

- **Discipline:** Group harmony under shared spirit; unit cadence.
- **Duty:** Coordinates multi-agent sequencing. Prevents duplicated effort, avoids agent conflict, enforces team cadence.
- **Fails closed on:** Agent conflict; race condition; duplicate concurrent proposal.
- **Verdict envelope:** `{pattern: HWA_RANG, capability: SWARM_COORDINATION, verdict, reason_code, evidence_hash}`
- **Depends on:** Tong-Il consensus state.

### 09 — JOONG_GUN (Surgical interdiction)

- **Discipline:** Surgical strike; the chain must be severed, not repaired.
- **Duty:** Identifies when a proposal must be terminated, not repaired. Handles hostile-chain severance.
- **Fails closed on:** Hostile chain detected; rehabilitation unviable; sever-or-fail decision.
- **Verdict envelope:** `{pattern: JOONG_GUN, capability: SURGICAL_INTERDICTION, verdict, reason_code, evidence_hash}`
- **Depends on:** Yon-Gae breach state.

### 10 — CHOONG_JANG (Confinement; unrealized maturity)

- **Discipline:** Constraint and quarantine before fitness is proven.
- **Duty:** Quarantine gate. Blocks incomplete, immature, under-proven, or trapped-state proposals. Routes to HADES rehab.
- **Fails closed on:** Incomplete evidence chain; agent state untrained for proposed action; below-threshold confidence.
- **Verdict envelope:** `{pattern: CHOONG_JANG, capability: QUARANTINE, verdict, reason_code, evidence_hash}`
- **Depends on:** Po-Eun contract surface.

### 11 — GE_BAEK (Severe strict military discipline)

- **Discipline:** No wasted motion; exact command structure.
- **Duty:** Execution discipline controller. Enforces exact command structure, timing, sequencing, stance, no-extra-motion policy.
- **Fails closed on:** Command sequence invalid; timing window missed; extra-motion detected.
- **Verdict envelope:** `{pattern: GE_BAEK, capability: EXECUTION_DISCIPLINE, verdict, reason_code, evidence_hash}`
- **Depends on:** Se-Jong canonical sequence.

### 12 — TOI_GYE (Mature doctrine; harvest)

- **Discipline:** Long-cultivated knowledge; doctrine custody.
- **Duty:** Knowledge-base custodian. Maintains doctrine, test cases, architecture memory, controlled policy evolution.
- **Fails closed on:** Doctrine reference missing; policy stale; doctrine version drift.
- **Verdict envelope:** `{pattern: TOI_GYE, capability: DOCTRINE_CUSTODY, verdict, reason_code, evidence_hash}`
- **Depends on:** Nicale's authored doctrine docs at runtime.

### 13 — SO_SAN (Late-stage mobilization)

- **Discipline:** Bridge between spiritual discipline and emergency defense.
- **Duty:** Incident recovery commander. Activates reserve controls, degraded-mode workflows, restoration procedures, emergency coordination.
- **Fails closed on:** N/A — So-San activates when other patterns deny; it does not gate normal flow.
- **Verdict envelope:** `{pattern: SO_SAN, capability: INCIDENT_RECOVERY, action, reason_code, evidence_hash}`
- **Depends on:** Yon-Gae or Joong-Gun denials triggering recovery.

### 14 — JUCHE (Self-determination)

- **Discipline:** Master of one's own destiny within constraint.
- **Duty:** Autonomy boundary gate. Determines whether an agent, human, or subsystem has authority to decide locally or must escalate.
- **Fails closed on:** Decision exceeds local authority; escalation required to CEO/CTO per ADR-0003.
- **Verdict envelope:** `{pattern: JUCHE, capability: AUTONOMY_BOUNDARY, verdict, escalation_target, evidence_hash}`
- **Depends on:** Dan-Gun root identity; Control Plane Authority Graph.

### 15 — MOON_MOO (Permanent land defense)

- **Discipline:** Eternal guardian of the boundary.
- **Duty:** Perimeter guardian. Protects inbound and outbound boundaries, external system calls, foreign writes, cross-domain actions, bridge trust.
- **Fails closed on:** Cross-domain call without authorization; outbound destination unverified; foreign signature invalid.
- **Verdict envelope:** `{pattern: MOON_MOO, capability: PERIMETER_GUARD, verdict, reason_code, evidence_hash}`
- **Depends on:** Yoo-Sin third-party trust.

### 16 — KWANG_GAE (Recovery and expansion)

- **Discipline:** Restoration of lost territory; controlled expansion.
- **Duty:** SOT recovery agent. Restores lost state, expands validated state, rolls back corruption, recovers clean territory after drift.
- **Fails closed on:** Recovery target unverified; rollback would violate invariants.
- **Verdict envelope:** `{pattern: KWANG_GAE, capability: SOT_RECOVERY, action, recovered_state_hash, evidence_hash}`
- **Depends on:** So-San incident activation.

### 17 — CHOI_YONG (Loyalty under betrayal risk)

- **Discipline:** Loyalty tested against betrayal.
- **Duty:** Betrayal detector. Flags insider risk, conflict of interest, compromised authority, command-channel betrayal.
- **Fails closed on:** Authority signature pattern shift; signer-behavior anomaly; insider abuse signal.
- **Verdict envelope:** `{pattern: CHOI_YONG, capability: BETRAYAL_DETECTION, verdict, reason_code, evidence_hash}`
- **Depends on:** Dan-Gun authority registry; Toi-Gye doctrine reference.

### 18 — WON_HYO (Spiritual renewal; doctrine introduction)

- **Discipline:** Rehabilitation through doctrine, not punishment.
- **Duty:** Rehabilitation doctrine agent. Converts failed proposals into retraining, correction, and AI rehabilitation plans (handoff to HADES).
- **Fails closed on:** N/A — Won-Hyo activates on prior pattern denials; it produces rehabilitation specs.
- **Verdict envelope:** `{pattern: WON_HYO, capability: REHABILITATION_DOCTRINE, action, rehab_spec, evidence_hash}`
- **Depends on:** Choong-Jang quarantine; HADES protocol.

### 19 — YOO_SIN (Alliance-risk discipline)

- **Discipline:** Partnership with vigilance; the ally who might be unsafe.
- **Duty:** Third-party trust gate. Checks external integrations, vendor APIs, foreign agents, "ally but unsafe" dependencies.
- **Fails closed on:** Vendor signature missing; foreign agent unverified; third-party dependency stale.
- **Verdict envelope:** `{pattern: YOO_SIN, capability: THIRD_PARTY_TRUST, verdict, reason_code, evidence_hash}`
- **Depends on:** Moon-Moo perimeter check.

### 20 — TONG_IL (Unification; consensus)

- **Discipline:** Final unification of independent verdicts.
- **Duty:** Consensus merge controller. Produces final merged state after all gates agree. Resolves split-brain decisions.
- **Fails closed on:** Verdict disagreement above threshold; split-brain unresolvable.
- **Verdict envelope:** `{pattern: TONG_IL, capability: CONSENSUS_MERGE, final_verdict, contributing_patterns[], evidence_hash}`
- **Depends on:** All other pattern verdicts.

### 21 — CHOONG_MOO (Naval command; checked potential)

- **Discipline:** Devastating capability held in reserve until proven needed.
- **Duty:** High-risk capability escrow. Holds dangerous capability until authority, timing, and mission fit are proven.
- **Fails closed on:** Capability requested without sufficient justification; mission-fit unproven; authority window not open.
- **Verdict envelope:** `{pattern: CHOONG_MOO, capability: CAPABILITY_ESCROW, verdict, reason_code, evidence_hash}`
- **Depends on:** Juche autonomy boundary.

### 22 — CHON_JI (Beginning; heaven and earth)

- **Discipline:** Creation of the initial state.
- **Duty:** Genesis initializer. Boots new tables, initializes epochs, starts clean runs, creates baseline state.
- **Fails closed on:** N/A — Chon-Ji is the boot path; failures here halt the kernel before any other pattern runs.
- **Verdict envelope:** `{pattern: CHON_JI, capability: GENESIS_INITIALIZATION, genesis_hash, evidence_hash}`
- **Depends on:** Dan-Gun root identity at boot.

### 23 — SAM_IL (Coordinated independence action)

- **Discipline:** Coordinated synchronized release.
- **Duty:** Release and mobilization gate. Controls coordinated launch events, public release, activation windows, synchronized action.
- **Fails closed on:** Release window not open; sync target missing; coordinated quorum unmet.
- **Verdict envelope:** `{pattern: SAM_IL, capability: RELEASE_MOBILIZATION, verdict, reason_code, evidence_hash}`
- **Depends on:** Tong-Il consensus.

### 24 — DAN_GUN (Foundational identity)

- **Discipline:** Ancestral foundation; founder identity.
- **Duty:** Root identity anchor. Owns root trust, founding identity, system lineage, constitutional configuration.
- **Fails closed on:** Root identity tamper; lineage break; constitutional drift.
- **Verdict envelope:** `{pattern: DAN_GUN, capability: ROOT_IDENTITY, verdict, lineage_hash, evidence_hash}`
- **Depends on:** Nothing — root of trust.

---

## OODA mapping

The 24 SOULs distribute across the OODA loop:

- **Observe:** Se-Jong (canonicalize) → Po-Eun (provenance) → Chon-Ji (epoch state)
- **Orient:** Moon-Moo (perimeter) → Yoo-Sin (third-party trust) → Toi-Gye (doctrine reference) → Juche (authority boundary)
- **Decide:** Ge-Baek (execution discipline) → Yul-Gok (invariants) → Choi-Yong (betrayal check) → Tong-Il (consensus merge)
- **Act:** Sam-Il (release window) → Choong-Moo (capability escrow) → Decision Certificate signed and submitted to ledger by Principal Agentic witness
- **Reflect / Recover (out-of-band):** Joong-Gun (sever), Choong-Jang (quarantine), Won-Hyo (rehab), So-San (incident recovery), Kwang-Gae (SOT recovery)
- **Cross-cutting:** Eui-Am (resource stewardship), Yon-Gae (breach response), Ul-Ji (anomaly), Hwa-Rang (swarm cadence), Do-San (operator readability), Dan-Gun (root trust)

---

## Authority and signing

Per ADR-0003, the SOULs produce verdicts that flow into a Decision Certificate envelope. The envelope is signed in this order:

1. Each SOUL emits its verdict and evidence into the envelope.
2. Tong-Il aggregates and produces the merged verdict.
3. Principal Agentic (AI witness role) signs the envelope and attaches all SOUL verdicts as evidence.
4. CEO and CTO authorization signatures (2-of-2) are attached for normal ledger decisions.
5. The signed envelope is submitted to the ledger.

No SOUL carries direct ledger-write authority. Verdicts are evidence; human signatures are authority.

---

## Migration from rune naming

The current bridge layer uses `rune_*` naming (rune_table_writer, rune_authorize, etc.). The migration plan is staged across phases:

- **Phase 2 (this artifact + engineering foundation):** New pattern-named modules built in `tkd-24/` alongside existing `bridge/rune_*.js`. Both formats supported in parallel. Decision Certificate envelopes can be emitted in either v1 (rune) or v2 (pattern) format.
- **Phase 3 (Agent SOUL implementations):** Each of the 24 SOULs gets a dedicated module in `tkd-24/` with the duty, failure mode, and verdict logic from this doctrine.
- **Phase 4 (Cutover):** HADES-A24-SYSTEM-TEST stack migrates to pattern naming. v1 rune format becomes legacy/alias.
- **Phase 5 (Deprecation):** rune_* identifiers removed from primary code paths; aliases retained one release cycle for downstream compatibility.

The COBOL kernel does not change. It operates on slot indices and is name-agnostic. Engineering preserves the deterministic floor as defense-tech differentiation.

---

## Conventions locked

- Pattern identifiers use upper-snake-case (e.g., `GE_BAEK`, `MOON_MOO`, `CHON_JI`) in code, configs, and Decision Certificate envelopes.
- Capability identifiers use upper-snake-case (e.g., `EXECUTION_DISCIPLINE`, `PERIMETER_GUARD`).
- Pattern slot ordering 01-24 follows the Chang Hon syllabus (Eui-Am at 01, Dan-Gun at 24) — slot numbers remain the COBOL kernel surface; names live in the bridge/agent layer.
- OODA is the operative loop on top of the patterns. Other doctrine loops (CIPSE+D²) can layer alongside without conflict.
- Do-San is a decorator pattern (not a peer hard-DENY gate). It enriches every verdict with reason_text and remediation but does not block.

---

## Author

Locked by Lawrence (CTO/owner, with Nicale's sign-off) on 2026-05-13. Engineering implementation in `tkd-24/` proceeds 1:1 by name from this doctrine.
