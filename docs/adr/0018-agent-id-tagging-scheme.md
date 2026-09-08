# ADR-0018: agent-id tagging scheme

- Status: **Open. Needs a ruling from Lawrence**
- Date: 2026-08-28
- Related: ADR-0002, ADR-0009, ADR-0016
- Blocks: telemetry instrumentation, cost attribution, the dashboard's per-agent view

## Context

ADR-0009 fixed the shape: one pipeline, tagged at the source, group view aggregates the tag and individual view filters it. The format, and the exact place the tag is set, are still open. Both matter more than they look. Cost allocation tags are not retroactive, so a format changed in month 3 leaves months 1 and 2 unattributable.

## Proposed format

Tag key: `ag3nt24:agent-id`
Tag value: `a24-NN-pattern-slug`, for example `a24-01-chon-ji`, `a24-24-tong-il`.

Why this shape: the zero-padded slot sorts correctly in every console and query, the slug is readable in a trace without a lookup table, and the slot survives a role rename because ADR-0002 pins slots and lets labels move.

Companion tags, all on the same records:

| Key | Value | Purpose |
|---|---|---|
| `ag3nt24:run-id` | ULID | Correlate every span, receipt, and cost record in one run |
| `ag3nt24:component` | `control-plane`, `agent-runtime`, `gateway` | Split infrastructure cost from agent cost |
| `ag3nt24:pilot` | `gunkustom`, `mock-mainframe` | Cost and telemetry per pilot |
| `ag3nt24:env` | `dev`, `prod` | Standard environment split |

## Where the tag is set

One writer: the node adapter from ADR-0016. It stamps the tag at node entry, on the OTel span attributes and on the AgentCore session attributes, from `AgentSpec.slot`. A node never sets its own tag, and a node cannot override it.

AWS resource tags on the AgentCore runtime, the Gateway, and the control-plane service carry `ag3nt24:component`, `ag3nt24:env`, and `ag3nt24:pilot` for Cost Explorer.

## The cost problem this has to solve

Cost Explorer allocates by AWS resource tag. If all 24 roles run inside one AgentCore runtime, that runtime is one tagged resource and Cost Explorer cannot split model spend across the 24. Three ways out:

**Option A: telemetry-derived cost.** Every model invocation emits tokens in and out with the agent-id tag. Per-agent cost is computed from token counts and published prices, and reconciled against the Cost Explorer total for the runtime.
*For:* works at any granularity, no infrastructure change. *Against:* a derived number, so it needs the reconciliation check or it silently drifts from the bill.

**Option B: one AgentCore runtime per agent.** Each role is its own tagged AWS resource, so Cost Explorer splits it natively.
*For:* the bill is the source of truth. *Against:* 24 runtimes to deploy and keep in step, and per-runtime fixed cost times 24 for a team of 1.

**Option C: A now, B later if the numbers stop reconciling.** Ship telemetry-derived cost with a reconciliation job that compares the sum of per-agent derived cost against the runtime's actual Cost Explorer line, and alerts past a threshold.

## Recommendation

**Format as proposed, plus Option C.** Activate the cost allocation tags in the billing console before Pilot 1 runs, because activation is not retroactive.

## What needs deciding

1. The tag key prefix: `ag3nt24:` as proposed, or something shorter. This becomes hard to change once cost data accumulates under it.
2. Value format: `a24-01-chon-ji` as proposed, or bare slot `a24-01`, or bare slug `chon-ji`.
3. A, B, or C for per-agent cost.
4. The reconciliation drift threshold that triggers an alert. (Suggested: 10% over a 7-day window.)
