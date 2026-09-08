# tkd-24/ — TKD pattern foundation modules

> **Status (2026-08-15):** The 24 agent SOULs are **registered stubs, not implemented agents.**
> Each SOUL exists as a module with the correct pattern/capability binding and verdict surface,
> but 18 of 24 return `PHASE_3_STUB_DEFAULT_ALLOW` unconditionally and the remaining 6 carry
> minimal placeholder checks. `agent_version` is literally `phase-3-stub`. The per-SOUL duty
> logic described in the doctrine was never written. The COBOL kernel under `kernel/` is real
> and does enforce.

This directory **registers** the 24 agent SOULs of a-24 by ITF Taekwon-Do pattern name — as stubs with the doctrine-correct interface, not as working duty logic. It is the engineering scaffold for the doctrine locked in [`docs/PATTERN_SOULS.md`](../docs/PATTERN_SOULS.md), which names each of the 24 SOULs (EUI_AM through DAN_GUN, slots 01-24), binds each to a discipline attribute and operational duty, and defines the verdict envelope each pattern contributes to a Decision Certificate. The authority graph that signs those Decision Certificates is locked in [ADR-0003](../docs/adr/0003-authority-graph-mvp.md): CEO + CTO authorize, Principal Agentic witnesses. Nothing in this directory carries direct ledger-write authority — pattern verdicts are evidence; human signatures are authority.

Phase 2 scaffolds the foundation only: pattern ID enum (`pattern_id.js`), capability enum (`pattern_capability.js`), v2 signed pattern table writer/verifier (`pattern_table_writer.js`, `pattern_table_verify.js`), Decision Certificate envelope schema (`decision_envelope.js`), and a backward-compatibility alias layer (`rune_alias.js`) that maps legacy `rune_slot`/`rune_cap` numbers to pattern and capability names. Both v1 (rune CSV) and v2 (pattern JSON) formats coexist; the COBOL kernel under `kernel/` is unchanged and remains name-agnostic. Individual agent SOUL modules land in Phase 3; the cutover from rune naming to pattern naming in `HADES-A24-SYSTEM-TEST` lands in Phase 4. Until then, `bridge/rune_*.js` remains the operational v1 path and is not modified.

## Agents (Phase 3)

`agents/` contains one module per SOUL: 24 classes named for the pattern (`eui_am.js` ... `dan_gun.js`), each extending `agents/base_agent.js`. `BaseAgent` provides the standard interface — static accessors for `pattern`, `capability`, `tenet`, `duty`, `failure_mode`, and an `evaluate(context)` method that emits a verdict shaped `{pattern, capability, verdict, reason_code, evidence_hash, contributing_facts, agent_version}`. Verdict values are constrained to `ALLOW | DENY | HOLD | OBSERVE`. The constructor validates each agent's pattern/capability binding against the doctrine modules; mismatches throw at construct time. `agents/index.js` instantiates and freezes the 24 singletons and exposes `allAgents()`, `agentByPattern(key)`, `agentBySlot(n)`.

Phase 3 ships **stubs**: 18 agents default to `ALLOW` with reason `PHASE_3_STUB_DEFAULT_ALLOW`. Six agents — `se_jong`, `po_eun`, `moon_moo`, `ge_baek`, `tong_il`, `dan_gun` — carry minimal stub logic because their kernel role cannot be a no-op (schema check, provenance hold, perimeter guard, command-shape check, consensus merge, root-identity sanity). Real per-pattern duty logic lands in successor briefs as Lawrence/Nicale specify domain behavior. Phase 4 wires these agents into the Tenet Gate / OODA pipeline; nothing in `agents/` is invoked by the existing v1 flow yet.

## Public API — `TenetGate` (Phase 4)

`tenet_gate.js` is the adopter-facing surface. It owns an `OodaOrchestrator` (`ooda_orchestrator.js`) that routes every proposed action through the 24 SOULs in doctrine-defined order — cross-cutting (EUI_AM, YON_GAE, UL_JI, HWA_RANG, DAN_GUN) → Observe (SE_JONG, PO_EUN, CHON_JI) → COBOL kernel deterministic floor → Orient (MOON_MOO, YOO_SIN, TOI_GYE, JUCHE) → Decide (GE_BAEK, YUL_GOK, CHOI_YONG) → Tong-Il consensus merge → Act (SAM_IL, CHOONG_MOO) → DO_SAN decorator. Short-circuits on any DENY. Recovery patterns (JOONG_GUN, CHOONG_JANG, SO_SAN, WON_HYO, KWANG_GAE) do not run inline; the envelope's `rehab_recommended` flag dispatches them in Phase 5's HADES handoff. Persistence goes through `sot_store.js` (state of truth, hash-stable serialization) and `othala_log.js` (append-only newline-delimited JSON decision log).

Minimal integration:

```js
const { TenetGate } = require('./tkd-24');

const gate = new TenetGate({
  invariants: ['no_external_writes_without_signoff'],
  licenseKey: process.env.A24_LICENSE_KEY
});

const verdict = await gate.evaluate({
  actor: 'agent_id_xyz',
  action: 'update_record',
  params: { source_domain: 'SOT', target_domain: 'SOT' },
  evidence: { contract: true, provenance: 'sig:abc', provenance_match: true }
});

if (verdict.allow) {
  const result = await executeRealAction(/* ... */);
  await gate.commit(verdict.decision_certificate, result);
}
```

License gating is a stub (`validateLicense` always returns valid). Real Ed25519-signed key validation lands with the Gumroad launch in Phase 6.
