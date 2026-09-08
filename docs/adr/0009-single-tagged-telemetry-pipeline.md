# ADR-0009: One telemetry pipeline tagged by agent-id, read-only dashboard

- Status: Accepted
- Date: 2026-08-28
- Deciders: Lawrence Jefferson II
- Related: ADR-0004, ADR-0018 (tagging scheme specifics)

## Context

The dashboard needs two views: the whole team, and one agent at a time. The naive build is two pipelines, one aggregating and one per-agent, which then disagree with each other and both disagree with the bill.

## Decision

One pipeline. Telemetry is tagged with the agent ID at the source, in the node adapter, before anything is emitted. AgentCore Observability feeds CloudWatch and X-Ray.

- Group view aggregates over the tag.
- Individual agent view filters on the tag.
- Cost comes from Cost Explorer on the same tag.

Same data, two queries. There is no second collection path.

The dashboard is read-only against agent state. It reads; it never writes graph state, receipts, or prompts.

Any action surfaced in the dashboard (approve a gate, end a run) is a call into the control-plane API, which routes through AgentCore Policy exactly like an agent's own tool call. The dashboard gets no privileged path.

## Consequences

- If tagging is wrong at the source, every view is wrong. The tag is set in one place, and a node cannot set its own (ADR-0018).
- Group and per-agent numbers reconcile by construction, because they are the same rows.
- AWS cost allocation tags apply to AWS resources. Per-agent model spend inside one runtime is not visible to Cost Explorer on its own, so token accounting per invocation is captured in telemetry and summed by agent ID. ADR-0018 has to resolve exactly where that number is emitted.
- Cost allocation tags need activating in the billing console before they report anything, and they are not retroactive. That happens before Pilot 1 starts, not after.

## Alternatives considered

- Separate per-agent and aggregate pipelines. Rejected: two sources of truth that drift.
- Derive per-agent cost by post-processing logs. Rejected: fragile, and it decouples cost from the same tag everything else uses.
- A dashboard with direct database write access for gate approvals. Rejected: it creates a second authorization path that Policy does not see.
