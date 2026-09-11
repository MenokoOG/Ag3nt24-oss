# Ag3nt24 architecture overview

**Version:** 0.1.0
**Date:** 2026-08-28
**Owner:** Lawrence Jefferson II
**Status:** Design. Nothing in this document is implemented yet.

---

## Rulings of 2026-09-09

This overview is the 2026-08-28 design and is kept as the record of it. ADR-0025 superseded its stack (LangGraph, AgentCore, Bedrock, CloudWatch) with Docker and a model-agnostic adapter; ADR-0023 placed the COBOL kernel as the ACL; ADR-0024 added scouts; ADR-0027 made HADES the control room. The current design is `docs/plan/2026-09-09-ag3nt24-hades-plan.md`. Read the sections below for the run flow, the gate, the receipt chain and the node contract, which stand; read the plan for everything about where it runs.

## As-built status (2026-09-05, second update)

Read this before anything else in the document.

- **Implemented agents: 0.** Twenty-four roles are specified in ADR-0002 and proposed in ADR-0015. None are built.
- **Implemented Python:** `ag3nt24_contracts.canonical` only — the canonical serializer and evidence hash (P1-10). No models, no graph, no control plane.
- **What is in this repository today:** design documents only. The prior-phase a-24 JavaScript moved to `docs/prior-art/a-24/` on 2026-09-05 and is ended, not built and not imported (ADR-0014). Its slot order does not apply here.
- **Open decisions:** ADR-0017, ADR-0018, ADR-0019. ADR-0014, ADR-0015 and ADR-0016 are ruled.

Everything below is the design. Treat it as specification, not capability.

---

## What Ag3nt24 is

A multi-agent framework for legacy system modernization. Twenty-four domain specialists work a modernization job under one supervisor. They propose; a human signs before anything touches a live system; every signature leaves a receipt that cannot be quietly altered.

The problem it addresses: modernization work spans more expert domains than one model call handles well, and the domains where it matters most (mainframe, OT, control systems) are the ones where a wrong write has consequences that no rollback fixes.

## Scope

**In scope now:** the orchestrator, the gate, the receipt chain, the contracts, and the control plane. Pilot 1 has no target; see ADR-0032.

**Deferred:** nothing is queued as Pilot 2; ADR-0032 dropped the mock mainframe stack. Military and defense systems integration is out of scope and has no design accommodation.

## System context

```
              ┌──────────────────────────┐
   Human  ───▶│  Dashboard (read-only)   │
   operator   └────────────┬─────────────┘
                           │ HTTPS
              ┌────────────▼─────────────┐
              │  Control-plane API       │   FastAPI + Pydantic, Python 3.13
              │  (ADR-0010, ADR-0017)    │   gate decisions, receipts, runs, cost
              └──┬──────────────────┬────┘
                 │                  │
        gate     │                  │  read-only
        decision │                  │
              ┌──▼──────────────────▼────┐
              │  Agent runtime           │   AgentCore Runtime
              │  LangGraph StateGraph    │   24 nodes, 1 supervisor
              │  (ADR-0003)              │   Chon-Ji node on Strands SDK
              └──┬──────────────────┬────┘
                 │                  │
       MCP       │                  │  state / memory / telemetry
              ┌──▼───────────┐   ┌──▼──────────────────────────┐
              │  AgentCore   │   │  Aurora │ S3 │ KB │ receipts │
              │  Gateway     │   │  (ADR-0006)                  │
              └──┬───────────┘   └──────────────────────────────┘
                 │
       ┌─────────▼──────────────────────────────┐
       │ Target systems                          │
       │ Pilot 1 target: unruled                 │
       │ Modbus / OPC-UA / MQTT / TN3270 (later) │
       └─────────────────────────────────────────┘
```

## Components

### Agent runtime

LangGraph `StateGraph` as root supervisor. All 24 roles are nodes. The supervisor owns routing, checkpointing, and interrupts.

Chon-Ji (slot 01, Systems Architecture and OT) is built on the Strands Agents SDK behind the same node interface as everything else, because discovery on an unmapped system is model-first work and a fixed edge cannot express it (ADR-0003).

Every node implements one contract (ADR-0016). A node reads only the state channels its `AgentSpec` declares, returns findings and proposals, and never executes a control-affecting tool call itself. One generic adapter enforces the projection for all 24, so a node writing an undeclared channel fails the run at that node rather than corrupting state quietly.

Findings carry provenance — `observed`, `inferred`, or `reported` — and no confidence score. A human at the gate can check how a node came to know something; they cannot check `0.87`. Routing belongs to the supervisor alone: a node never requests a peer.

### Control plane

FastAPI and Pydantic, Python 3.13, deployed separately from the runtime. Serves the dashboard, gate decisions, receipt queries, run lifecycle, cost. A control-plane outage does not stop the graph, and a graph failure does not stop the dashboard showing what happened (ADR-0010). Routes are ADR-0017, open.

### Contracts package

`ag3nt24_contracts`, imported by both services. Four Pydantic models: `AgentSpec`, `GraphState`, `GateRequest`, `Receipt` (ADR-0011). Field-level definitions are outstanding and have to be restated before implementation.

### The ACL, HADES, and the Data Lake (ADR-0020, no code yet)

Three named subsystems with a fixed home and no implementation. Pilot 1 does not build them.

The **ACL** is a deterministic rules engine on data crossing out of the core pipeline: go or no-go, structured reason, logged. It is not the human gate. It runs first and upstream, it makes no model call, and clearing it is never authorization to act. ACL decisions do not write receipts; the chain records human decisions only.

**HADES** is data-only: Data Lake sizing and governance, and the Human Authorized Data Eradication Sequence. Eradication is the most control-affecting action in the system and takes the ordinary path for one — `GateRequest`, a human signature, one `Receipt`, then execution. The append-only ledger it needs is the receipt chain; no second store is built. There is no auto-eradication path.

The **Data Lake sort taxonomy** is `good | bad | messy | work-data | new`. Only `bad` reaches the eradication sequence. A client Data Lake is a target system, not a fifth Ag3nt24 store; ADR-0006 still says four.

### Tools

All tool access is MCP through AgentCore Gateway. No node opens a socket to a target directly. Existing open-source MCP servers for Modbus, OPC-UA, and MQTT; writing one from scratch needs its own ADR (ADR-0005).

Tool output is untrusted input. A device response, a mainframe screen, or a fetched page is data, never an instruction to the agent reading it.

## The run flow

1. A run starts with a task, a pilot target, and a budget.
2. The supervisor routes to the roles the task needs.
3. Each node returns findings and proposals against its declared slice of state.
4. Tong-Il (24) reconciles cross-domain findings into a proposal.
5. A control-affecting proposal hits a LangGraph interrupt. State is checkpointed, a `GateRequest` is written, the run stays `active` and waiting.
6. A human approves or denies through the control plane. Exactly one `Receipt` is written, hash-chained to its predecessor.
7. On approval, the run resumes and the tool call executes through Gateway. On denial, the run ends with the reason recorded.

Read-only discovery does not gate. Everything that writes, mutates, deploys, configures, or commands does (ADR-0008).

## Storage

Four concerns, four stores, never collapsed (ADR-0006).

| Concern | Store |
|---|---|
| MD-spec charters, human-authored source of truth | S3 versioned, mirrored in Git |
| Graph and session state (checkpointer) | Aurora PostgreSQL |
| Vector / RAG per domain | Bedrock Knowledge Bases over S3 Vectors |
| Audit receipts, append-only and hash-chained | DynamoDB or S3 Object Lock |

The receipt store shares no database, schema, or write credential with graph state. Vector indexes are derived data: losing one costs a rebuild.

## Prompt lifecycle

The Markdown charter in this repository is authored and reviewed as a diff. Bedrock Prompt Management holds the deployed artifact, and each node loads its prompt by ARN pinned to a version.

Publishing Markdown into Prompt Management is a manual gate. No auto-deploy from a merged file to a live prompt. A missing prompt ARN is a hard failure with no inline fallback (ADR-0007).

## Telemetry and cost

One pipeline. Tagged with the agent ID at the node adapter before anything is emitted. AgentCore Observability into CloudWatch and X-Ray. Group view aggregates the tag, individual view filters it, cost comes from Cost Explorer on the same tag (ADR-0009). Format and the per-agent cost mechanism are ADR-0018, open.

The dashboard is read-only against agent state. Every action it offers is a control-plane call that goes through AgentCore Policy exactly like an agent's own tool call. No privileged side door.

## Security and trust boundaries

| Boundary | Control |
|---|---|
| Human to control plane | AgentCore Identity; per-user identity so a receipt names a person, not a shared account |
| Control plane to receipt store | Write only on the gate decision path; read-only credentials elsewhere |
| Node to target system | MCP through Gateway only; control-affecting tools gated |
| Tool output to node reasoning | Treated as untrusted data, never as instruction |
| Charter to running prompt | Manual publish gate, source commit SHA recorded on the prompt version |

Signing keys for receipts are production secrets with a rotation policy. Never in code, config, or logs.

## Constraints this design accepts

- **AWS is not swappable.** No portability abstraction gets written (ADR-0004).
- **Throughput is bounded by human review.** That is the intended trade (ADR-0008).
- **One person operates this.** Anything needing a rota does not get built (ADR-0013).
- **Twenty-four is fixed.** A new domain merges into an existing role or forces a merge elsewhere (ADR-0002).

## Language rules for this project

"Autonomous" is not used. Agents propose, humans sign. A line of work is `active` or `ended`, never "paused." Role definitions carry industry-standard domain naming and no personal or business philosophy. No capability claim without something real behind it.

## Decision index

**Accepted:** ADR-0001, 0002, 0006, 0008, 0010 through 0016, 0020 through 0027.
**Superseded by ADR-0025:** ADR-0003, 0004, 0005, 0007, 0009.
**Open, needs a ruling:** ADR-0017 (route list), ADR-0018 (tagging), ADR-0019 (Pilot 1 scope).

ADR-0020 reconciles the 2026-09-04 HADES build prompts with this design: the ACL, HADES, and the Data Lake sort taxonomy become named subsystems, and Talk/Protocol/Droid/Report becomes vocabulary for the run flow above rather than a second pipeline.

Full text in [docs/adr/](../adr/). Build sequencing in [docs/plan/2026-09-09-ag3nt24-hades-plan.md](../plan/2026-09-09-ag3nt24-hades-plan.md).
