# ADR-0030: ScoutFinding and ScoutReport are a fifth core contract

- Status: Accepted. Ruled 2026-09-10
- Date: 2026-09-10
- Deciders: Lawrence Jefferson II
- Amends: ADR-0011 (four core models — this makes it five)
- Related: ADR-0024 (scouts), ADR-0008 (hash-chained receipts), ADR-0010 (two services import one shared package)

## Context

ADR-0024 gives scouts a defined output — one scout report per contact, findings tagged `observed`, an evidence hash per finding via `ag3nt24_contracts.canonical`. ADR-0011 fixed the contract package at four models (`AgentSpec`, `GraphState`, `GateRequest`, `Receipt`) and did not anticipate a scout's output needing a shared shape. The protocol droid (`core`) reads scout reports next; `hades` needs the same shape for telemetry and for anything a scout finding surfaces to the human gate. Two consumers, one shape: exactly the condition ADR-0011 says the contracts package exists to solve, and exactly what "consume, don't fork" (`rules/engineering-standards.md`) rules against duplicating.

## Decision

`ScoutFinding` and `ScoutReport` join the contract package, `ag3nt24_contracts`, as the fifth and sixth core model. `ag3nt24_scouts` imports them from there — it does not define its own copy.

```python
class ScoutFinding(BaseModel):
    finding_id: str            # ULID
    kind: str                  # "http_endpoint" | "prompt_file" | "vector_store_config" | "model_config" | "orchestration_entry"
    target_uri: str
    tag: Literal["observed"]   # ADR-0024: never stronger than observed
    evidence: JsonValue        # canonicalizable, per ag3nt24_contracts.canonical
    evidence_hash: str         # evidence_hash(evidence)

class ScoutReport(BaseModel):
    report_id: str             # ULID
    scout_id: str
    target_id: str
    findings: list[ScoutFinding]
    read_only: Literal[True]
    started_at: datetime
    finished_at: datetime
    schema_version: int
```

Rules inherited from ADR-0011 apply unchanged: strict mode (unknown fields rejected), a `schema_version` field, a breaking version bump takes its own ADR. Both models are frozen after construction, the same rule `Receipt` carries — a scout report is evidence, and evidence does not get edited after the fact; a correction is a new report referencing the target again, never a mutation.

`ScoutFinding.tag` is fixed to `"observed"` at the type level (a `Literal`, not a free string) so a future contributor cannot widen a finding into something that reads as a verdict. Verdicts belong to the human gate, per ADR-0008 and ADR-0011's own note that the a-24 verdict vocabulary was deliberately not lifted.

## Consequences

- `ag3nt24_contracts` remains the single highest-blast-radius file set and now carries six models instead of four; review and test rigor stated in ADR-0011 applies unchanged to these two.
- `ag3nt24_scouts` gains no new dependency by this — it already needed `ag3nt24_contracts` for `evidence_hash`. It loses the local model definitions the module-4 design draft had proposed as a fallback.
- Any future scout (TN3270, Modbus, OPC-UA, MQTT — ADR-0024) reuses these two models unchanged; a scout that needs a shape these two cannot express is a signal to revisit this ADR, not to define a local variant beside it.
- `core` and `hades` can now depend on one definition of a scout's output instead of each guessing the other's shape.

## Alternatives considered

- **Keep `ScoutReport` local to `ag3nt24_scouts`, promote later if a consumer needs it.** Rejected: the consumer is not hypothetical — the protocol droid reads scout reports as the very next step after scouts exist, per ADR-0024's own flow ("After the report clears the kernel, the protocol droid reads it"). Defining it once now avoids a later migration and a window where two shapes could drift.
- **Embed scout findings inside `GraphState`.** Rejected: `GraphState` is a run's mutating state, reduced under LangGraph reducers (ADR-0011); a scout report is immutable evidence produced once, before any run's graph state exists. Different lifecycle, different model — the same reasoning that keeps `GateRequest` and `Receipt` separate from `GraphState` today.

---
LAHA — Love All Humans Always.
