# ADR-0023: The COBOL kernel is the Anti-Corruption Layer at the boundary

- Status: Accepted
- Date: 2026-09-09
- Deciders: Lawrence Jefferson II
- Related: ADR-0008 (human gate), ADR-0020 (ACL as a machine gate), ADR-0021 (kernel port), ADR-0024 (scouts), ADR-0026 (slot translation), ADR-0027 (HADES)

## Context

ADR-0020 defined the ACL as a deterministic rules engine with no model call: go or no-go, structured reason, logged, never a substitute for the human gate. The four COBOL gates ported in ADR-0021 (`tenet_gate`, `provenance_validate`, `rune_authorize`, `rune_rotation`) are exactly that, and until this ADR nothing connected them to the architecture. The README called the kernel "the floor" with no decision behind the sentence.

## Decision

The kernel is the ACL. It sits at the boundary between the inherited AI estate and the framework, and every crossing passes through it in both directions.

Inbound: a scout report (ADR-0024) is not visible to the protocol droid until `provenance_validate` has accepted its provenance envelope and `tenet_gate` has returned `DECISION=A` on the action record built from it.

Outbound: every proposal the team sends toward HADES for a human decision passes `tenet_gate` first, and `rune_authorize` confirms that the pattern making the proposal holds the requested capability on the current rotation table. A pattern that does not hold the capability today is denied with `NOT_AUTHORIZED_FOR_TODAY`, and the denial is logged and escalated in HADES.

The action record fields map as follows. `ACTOR-ID`: the ITF slot tag from ADR-0018 for a pattern, or the scout id for a scout. `ACTION-ID`: the canonical hash prefix of the proposal or report. `SOURCE-DOMAIN` and `TARGET-DOMAIN`: `estate`, `team`, `hades`, or the client system id. `HAS-CONTRACT`: whether a charter or scout spec authorizes the crossing. `HAS-PROVENANCE` and `PROVENANCE-MATCH`: the verdict of `provenance_validate`. `RETRY-COUNT`, `MAX-RETRIES`, `WITHIN-QUOTA`: from the run budget. `ANOMALY-DETECTED`: set by the adversarial pattern (Ul-Ji, 20) or by HADES.

The rotation seed is the head hash of the receipt chain plus the epoch day. A new day or a new receipt produces a new table. Tables are generated on demand, never committed.

The kernel logs. It does not sign and it writes no receipts. That stays as ADR-0020 ruled.

## Consequences

- The COBOL source stays byte-identical to the carried v1.0.0 files. Conformance stays at `5/5 match`. Anything the framework needs that the gates do not provide is built in the bridge or above it.
- `provenance_validate` accepts three fixed signer ids. Phase 3 either maps HADES identities onto them in the bridge or takes a new ADR to modify the gate with a new conformance baseline. Neither is decided here.
- The 89-character record is the interface contract. Field widths are not negotiable; anything longer is truncated by the bridge and the truncation is recorded.
- A gate that cannot start is a runtime failure, never a verdict. The conformance preflight already distinguishes the two and the boundary service keeps that distinction.
- Rune numbers inside the kernel are v1 slots. ADR-0026 rules the translation to ITF slots.

## Alternatives considered

- Kernel inside HADES only, guarding data decisions. Rejected: the scout handoff is the first place corruption enters, and a gate that runs after the team has already reasoned over bad input is late.
- Kernel at both points as two separate services. Rejected for now: one boundary service called from two places is smaller and the verdict logic is identical.
- Retire the kernel and write the ACL in Python. Rejected: the deterministic, compiled, no-I/O verdict is the property that makes the ACL provable, and it already exists with a conformance suite.
