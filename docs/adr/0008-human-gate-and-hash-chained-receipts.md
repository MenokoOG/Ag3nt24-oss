# ADR-0008: Human gate before any control-affecting action, one hash-chained receipt per decision

- Status: Accepted
- Date: 2026-08-28
- Deciders: Lawrence Jefferson II
- Related: ADR-0005, ADR-0006, ADR-0011

## Context

Ag3nt24 works on live systems, including OT surfaces where a wrong write has physical consequences. Agents propose. Humans sign. That rule needs a mechanism, not a norm, and the mechanism needs an audit trail that survives an argument about what was approved six months ago.

## Decision

Every control-affecting agent action stops at a human gate before execution. Control-affecting means any tool call that writes, mutates, deploys, configures, or commands a target system. Read-only discovery does not gate.

The gate is a LangGraph interrupt. The graph state is checkpointed at the interrupt, a `GateRequest` is written, and the run is `active` and waiting. It resumes only on a human decision, or it is `ended`.

Every gate decision writes exactly one `Receipt`:

- signed
- append-only
- hash-chained: each receipt carries the hash of its predecessor, so a missing or altered receipt breaks the chain
- stored in the receipt store from ADR-0006, never with graph state

A receipt records the proposing agent's slot ID, the proposed action, the evidence hash, the decision, the deciding human's identity, and the timestamp. Approve and deny both write a receipt. A gate that times out writes a receipt too.

No execution path exists that skips the gate. Not for a "trusted" agent, not for a small change, not for the dashboard.

## Consequences

- Throughput is bounded by human review capacity. That is the intended trade.
- Chain verification is an operation the control plane exposes, and a broken chain is an incident, not a warning.
- The signing key is a production secret with its own rotation policy. It is never in code, config, or logs.
- Receipt volume grows monotonically. Retention is a compliance decision, and receipts are never deleted to save cost without an ADR.
- Gate latency has to be visible in telemetry, or a run sitting `active` and unreviewed looks identical to a run making progress.

## Alternatives considered

- Gate only high-risk actions, by classification. Rejected: the classifier becomes the actual security boundary, and it is a model output.
- Post-hoc approval with rollback. Rejected: an OT write is not rollback-able in any meaningful sense.
- Receipts in the graph state store. Rejected: see ADR-0006.
