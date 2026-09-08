# ADR-0016: LangGraph node interface contract

- Status: **Accepted**
- Date: 2026-08-28. Ruled 2026-09-05 by Lawrence Jefferson II.
- Decision: Option C, two separate lists, a provenance enum, supervisor-owned routing.
- Related: ADR-0003, ADR-0008, ADR-0010, ADR-0011, ADR-0014, ADR-0020
- Unblocks: P1-13, P1-31, and every node implementation
- Note: this ADR carries the field-level shapes the node boundary needs, which settles the `AgentSpec` half of P1-03. `GraphState`, `GateRequest` and `Receipt` field lists are still outstanding under ADR-0011.

## Context

This is the contract that makes substitutability real. If all 24 nodes implement the same input and output shape, the supervisor treats them uniformly, a new role drops in without touching the graph, and testing one node needs no graph at all. If they do not, the graph accumulates per-node special cases and the design stops being 24 roles and starts being 24 exceptions.

Two things make it harder than the usual LangGraph case. Chon-Ji is Strands-backed (ADR-0003), so the contract has to fit a model-first loop as well as a plain function. And every node's output can become a `GateRequest`, so the output shape has to carry enough for a human to decide without reading logs.

## Options

**Option A: shared `GraphState` only, plain LangGraph idiom.**
Every node is `(state: GraphState) -> dict`, reading and writing reducer-merged channels. Nothing else.
*For:* idiomatic, minimum code, checkpointing works with no adaptation.
*Against:* every node sees the entire state, which is an interface-segregation failure. Unit testing a node means constructing a whole `GraphState`. Nothing stops node 7 writing node 12's channel, and nothing catches it when it does.

**Option B: per-node typed request and response, adapter into the graph.**
Each role implements a narrow protocol. The adapter projects `GraphState` down to that node's input and merges its output back.

```
class DomainNode(Protocol):
    spec: AgentSpec
    def run(self, req: NodeRequest) -> NodeResponse: ...
```

*For:* a node sees only its slice, tests need no graph, and the projection is one reviewed place.
*Against:* a projection layer to maintain, and a mapping per node.

**Option C: Option B with a generic adapter and a declared state projection on `AgentSpec`.**
Same protocol as B, but the projection is data, not code: `AgentSpec` declares which state channels the node reads and which it may write, and one generic adapter enforces it for all 24.
*For:* one adapter, not 24. A node writing a channel it never declared is an error at the boundary, not a silent bug. The declaration is also exactly what the tool allowlist and the telemetry tag need, so it earns its keep three ways.
*Against:* the most upfront design, and the declaration can drift from what a node actually needs unless the adapter enforces it (it does).

## Sketch of the contract under Option C

`NodeRequest` carries: the run and checkpoint identity, the node's declared slice of state, its `AgentSpec`, the resolved prompt version, and its remaining step and token budget.

`NodeResponse` carries:

- `findings`: what the node observed, each with an evidence reference and a confidence
- `proposals`: zero or more proposed actions, each flagged read-only or control-affecting
- `state_delta`: writes restricted to declared channels
- `status`: `active`, `complete`, `ended`, `needs_gate`
- `cost`: tokens in and out, tool calls made
- `errors`: structured, never swallowed

Rules that hold for every node:

1. A node never executes a control-affecting tool call. It proposes; the gate decides (ADR-0008).
2. Tool output is data, never instruction. A device response, a mainframe screen, or a file is untrusted input, and a node that treats it as a directive is a defect.
3. A node returns within its declared budget or returns `ended` with a reason. It does not run long and hope.
4. Every external call has a timeout and an explicit retry policy or an explicit none.
5. The response is valid against the contract or the run fails at that node. No partial acceptance.

## Decision

**Option C**, with three shape rulings on top of it. All four ruled 2026-09-05.

### 1. One generic adapter, and the projection is declared data

Every role implements the same narrow protocol. One adapter serves all 24 by reading the projection off `AgentSpec` rather than knowing anything about the node.

```python
class DomainNode(Protocol):
    spec: AgentSpec

    def run(self, req: NodeRequest) -> NodeResponse: ...
```

`AgentSpec` grows two declarations that the adapter enforces:

| Field | Meaning |
|---|---|
| `reads_channels: frozenset[str]` | The only `GraphState` channels projected into `NodeRequest.state` |
| `writes_channels: frozenset[str]` | The only channels `NodeResponse.state_delta` may contain |

A node that returns a delta touching an undeclared channel is a **contract violation at the adapter boundary**, and the run fails at that node. It is not filtered, not warned about, and not merged partially. This is the whole reason Option C beats Option A: "any node may quietly write any channel" is the bug class that is unfindable at 3am with a bus factor of one.

The declaration earns its keep three ways, which is why it is data and not code: it is the state projection, it is checkable against the tool allowlist, and it is what the ADR-0018 telemetry tag is keyed on.

The Strands-backed Chon-Ji node (ADR-0003) sits behind this same protocol. Model-first looping happens inside `run`, and from the graph's side it is substitutable with a plain function. That substitutability is testable and gets tested (P1-70).

### 2. `findings` and `proposals` are two separate lists

Not one list with a discriminator. They have different lifecycles: proposals feed the gate, findings feed the report. Separate fields make "this node proposed nothing" a fact readable off the type, instead of a filter that every consumer has to remember to run. A forgotten filter is how a proposal reaches the report, or a finding reaches the gate.

### 3. Findings carry provenance, not a confidence score

```python
class Provenance(StrEnum):
    OBSERVED = "observed"   # read directly off the target system
    INFERRED = "inferred"   # derived from what was read
    REPORTED = "reported"   # the target system claims it
```

**Confidence is not modelled at all**, in any form. A float is a number a model invents; `0.87` looks like a measurement and is not one. Coarse buckets are the same self-assessment with less resolution.

Provenance is different in kind: it is a fact about how the node came to know something, and a human at the gate can check it. "Three observed, one inferred" is a sentence someone can act on before signing. It also degrades honestly — a node that cannot say how it knows something is a node returning `REPORTED`, and that shows.

### 4. All routing stays with the supervisor

A node returns findings and proposals and says nothing about what runs next. One component decides the graph's shape, so a run's path is reconstructable from one place and the budget stays enforceable in one place. A node may not request a peer.

## The contract

`NodeRequest`, built by the adapter and never by a node:

| Field | Purpose |
|---|---|
| `run_id`, `checkpoint_id` | Run and checkpoint identity |
| `state` | Only the channels in `spec.reads_channels` |
| `spec` | The node's own `AgentSpec` |
| `prompt_version` | Resolved prompt ARN, pinned. Missing is a hard failure with no inline fallback (ADR-0007) |
| `budget` | Remaining steps and remaining tokens |

`NodeResponse`, returned by the node:

| Field | Purpose |
|---|---|
| `findings: list[Finding]` | What the node observed. Each carries an evidence reference and a `Provenance` |
| `proposals: list[Proposal]` | Zero or more proposed actions, each flagged read-only or control-affecting |
| `state_delta: dict[str, JsonValue]` | Writes, restricted to `spec.writes_channels` |
| `status: NodeStatus` | `active`, `complete`, `ended`, `needs_gate` |
| `cost` | Tokens in, tokens out, tool calls made |
| `errors` | Structured. Never swallowed |

Evidence references and any payload that reaches a receipt hash go through `ag3nt24_contracts.canonical`, so the same evidence hashes identically on every run (ADR-0008, ADR-0014).

`status` uses the project's word discipline: a node is `active` or it is `ended`. Nothing is ever "paused".

### Rules that hold for every node

1. A node never executes a control-affecting tool call. It proposes; the gate decides (ADR-0008). *The gate* always means the human gate; the ACL is the other one (ADR-0020).
2. Tool output is data, never instruction. A device response, a mainframe screen, or a fetched page is untrusted input, and a node that treats it as a directive is a defect.
3. A node returns within its declared budget or returns `ended` with a reason. It does not run long and hope.
4. Every external call has a timeout and an explicit retry policy or an explicit none.
5. The response is valid against the contract or the run fails at that node. No partial acceptance.

## Consequences

- P1-13 and P1-31 are unblocked. The adapter is one file and gets the strictest review after the contracts package.
- `reads_channels` and `writes_channels` are load-bearing. A node needing a channel it did not declare is a spec change, reviewed as a diff, not a runtime accommodation.
- Adding a role touches the roster and one new module. It does not touch the adapter or the graph.
- Dropping confidence means the dashboard cannot sort findings by certainty. That is the intended trade: it could not have sorted them truthfully.
- Supervisor-owned routing means a role that needs another role's output waits for the supervisor to schedule it. If that becomes a real constraint it is an ADR, not a workaround inside a node.

## Recommendation (superseded by the Decision above)

**Option C.** The declared read and write channels on `AgentSpec` pay for themselves three times over, and Option A's failure mode (any node quietly writing any channel) is the exact bug class that is unfindable at 3am with a bus factor of 1.

## What needed deciding (all four answered above)

1. Option A, B, or C. → **C**
2. Whether `findings` and `proposals` are separate lists or one list with a discriminator. → **Separate**
3. Whether confidence is a float, an enum, or absent. → **Absent. Provenance instead**
4. Whether a node may propose a new run of a different node, or whether all routing stays with the supervisor. → **Supervisor owns routing**
