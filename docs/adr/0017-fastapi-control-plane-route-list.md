# ADR-0017: FastAPI control-plane route list

- Status: **Open. Needs a ruling from Lawrence**
- Date: 2026-08-28
- Related: ADR-0009, ADR-0010, ADR-0011
- Blocks: dashboard work, the gate approval path, Pilot 1 end-to-end demonstration

## Context

The control plane is the human's whole interface to the system: approving gates, watching runs, reading receipts, checking cost. It is a separate service from the agent runtime (ADR-0010) and it is read-only against agent state except for gate decisions and run lifecycle (ADR-0009).

The route list is a contract. Once the dashboard consumes it, changing it is a versioned break.

## Proposed routes, API version `v1`

Path prefix `/api/v1`. Versioning per the repository's three-tier policy: the prefix bumps only on a breaking contract change.

**Runs**
- `POST /runs` create a run
- `GET /runs` list, filtered by status, pilot, date
- `GET /runs/{run_id}` one run with its current status
- `GET /runs/{run_id}/state` current `GraphState` projection, read-only
- `GET /runs/{run_id}/timeline` ordered node executions and gate events
- `POST /runs/{run_id}/end` end a run (the only lifecycle write; there is no "pause")

**Gates** (the only write path into agent behavior)
- `GET /gates` pending gate requests
- `GET /gates/{gate_id}` one `GateRequest` with the full proposal and its evidence
- `POST /gates/{gate_id}/decision` approve or deny; writes exactly one `Receipt`

**Receipts**
- `GET /receipts` list, filtered by run, agent, date
- `GET /receipts/{receipt_id}` one receipt
- `GET /receipts/chain/verify` verify chain integrity over a range

**Agents**
- `GET /agents` the roster with slot, pattern, domain, and implementation status
- `GET /agents/{slot}` one `AgentSpec` including its live prompt version

**Telemetry and cost**
- `GET /telemetry/summary` aggregate over the agent-id tag
- `GET /telemetry/agents/{slot}` the same data filtered to one slot
- `GET /costs` cost by slot and by run

**Operational**
- `GET /healthz`, `GET /readyz`, `GET /version`

**Live updates**
- `GET /stream` server-sent events for run status, new gate requests, node completions

## Options

**Option A: the resource list above, polling only.** Drop `/stream`; the dashboard polls.
*For:* simplest to build and to test. *Against:* a pending gate is invisible until the next poll, and gate latency is the metric that matters most.

**Option B: Option A plus `/stream` (server-sent events).**
*For:* a new gate request reaches the human immediately, and SSE is one-directional, which fits a read-only dashboard exactly. *Against:* one more connection type to keep alive through a deploy.

**Option C: a thin backend-for-frontend.** Four aggregate endpoints shaped to the four dashboard views instead of resource routes.
*For:* fewest round trips. *Against:* the API becomes a function of the current UI, and the second consumer (a CLI, or the agent team reading its own receipts) has to fight it.

## Recommendation

**Option B.** Resource-oriented routes plus SSE. Gate latency is the number Pilot 1 lives or dies on, and polling makes it worse for no gain.

## What needs deciding

1. A, B, or C.
2. Is `POST /runs/{run_id}/end` the only lifecycle write, or does a resume-after-gate need its own route? (The gate decision can imply resumption; making it explicit is clearer but adds a state to get wrong.)
3. Authentication for Pilot 1: a single operator identity, or per-user from the start? A receipt records who decided, so a shared identity weakens the audit trail from day one.
4. Does the control plane read receipts directly from the receipt store, or only through the runtime? (Recommendation: read directly, with read-only credentials. It is the one path that must keep working when the runtime is down.)
