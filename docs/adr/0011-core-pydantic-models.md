# ADR-0011: Four core Pydantic models are the system contract

- Status: Accepted (field lists outstanding, see below)
- Date: 2026-08-28
- Deciders: Lawrence Jefferson II
- Related: ADR-0008, ADR-0010, ADR-0014, ADR-0016

## Context

Two services (ADR-0010), 24 nodes, a gate, and an audit chain all pass the same handful of objects around. If each component defines its own shape, the contract lives nowhere and every boundary becomes a guess.

## Decision

Four Pydantic models are the contract for the whole system. They live in one shared package, `ag3nt24_contracts`, imported by the control plane and the agent runtime alike. Neither service defines its own variant.

| Model | Owns |
|---|---|
| `AgentSpec` | The static identity of a role: slot number, pattern name, domain, prompt ARN, tool allowlist, model and budget policy |
| `GraphState` | The LangGraph state object carried through a run: findings, proposals, routing signals, run and checkpoint identity |
| `GateRequest` | One proposed control-affecting action awaiting a human decision (ADR-0008) |
| `Receipt` | One signed, hash-chained record of a gate decision (ADR-0008) |

Rules that hold for all four:

- Strict mode. Unknown fields are rejected, not ignored.
- `Receipt` is frozen after construction. Nothing mutates a receipt.
- Every model carries a schema version field. A version bump that breaks compatibility is an ADR.
- `GraphState` field mutation goes through LangGraph reducers, so concurrent node writes merge under a declared rule instead of last-write-wins.

## Outstanding

The field-level definitions were scoped in an earlier session and are not restated in this repository yet. Until they are written into `ag3nt24_contracts` and reviewed, this ADR is accepted on the four names and their responsibilities only. Restating and pinning them is task 2 in the Pilot 1 breakdown, and it blocks ADR-0016.

## Concepts lifted from the ended a-24 line (ADR-0014, 2026-09-05)

ADR-0014 ended the a-24 policy-gate line and archived its JavaScript to `docs/prior-art/a-24/`. Two shapes from it are deliberately design inputs here. No code was ported.

**Into `Receipt`.** The a-24 verdict envelope was `{ pattern, capability, verdict, reason_code, evidence_hash, contributing_facts, agent_version }`, with `evidence_hash` computed as SHA-256 over a **sorted-key stable JSON** serialization. The serialization discipline is the part that matters and it is binding here: a receipt's hash input is canonicalized before hashing, so the same evidence hashes identically on every run and on every machine. A hash that depends on dict ordering produces a chain that fails verification for reasons unrelated to tampering, which is worse than no chain at all.

The verdict vocabulary itself (`ALLOW | DENY | HOLD | OBSERVE`) is **not** lifted. In Ag3nt24 a node produces findings and proposals; approve and deny belong to the human gate (ADR-0008).

**Into `AgentSpec`.** a-24's `BaseAgent` constructor refused to build an agent whose declared capability was owned by a different pattern. `AgentSpec` validates that class of mismatch at **construction**, not at call time. A misconfigured role fails when the spec is built, before a run starts and before any budget is spent.

## Consequences

- The contracts package is the highest-blast-radius file set in the repository. It gets the strictest review and the most tests.
- A schema version bump touches both services at once, so contract changes get batched deliberately rather than dribbled out.
- `Receipt` being frozen means a correction is a new receipt referencing the old one, never an edit.

## Alternatives considered

- Per-service models with a translation layer. Rejected: the translation layer becomes the real contract, and it is the least reviewed code in the system.
- Dataclasses plus hand-written validation. Rejected: validation at trust boundaries is a Definition of Done gate, and Pydantic gives it declaratively.
- JSON Schema as the source with generated Python. Rejected: adds a build step before there is a second language that needs it. Revisit if a non-Python consumer appears.
