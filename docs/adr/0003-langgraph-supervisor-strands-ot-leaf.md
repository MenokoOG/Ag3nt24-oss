# ADR-0003: LangGraph StateGraph as root supervisor, Strands Agents SDK for the Chon-Ji leaf

- Status: Accepted
- Date: 2026-08-28
- Deciders: Lawrence Jefferson II
- Related: ADR-0002, ADR-0016 (node interface contract)

## Context

The 24 roles need an orchestration layer that is inspectable, checkpointable, and deterministic enough that a human gate has something concrete to approve. LangGraph's `StateGraph` gives explicit nodes and edges, a durable checkpointer, and interrupt points that map directly onto a human gate.

Legacy discovery is the exception. Walking an unmapped OT or mainframe environment is not a fixed sequence of steps: which probe to run next depends on what the last one returned. Encoding that as graph edges means guessing the shape of a system nobody has mapped yet.

## Decision

LangGraph `StateGraph` is the root supervisor. All 24 roles are nodes in it. Routing, checkpointing, and human interrupts happen at that layer.

The Chon-Ji (Systems Architecture / OT) node is built on the Strands Agents SDK, behind the same node interface every other role implements. Inside that node the model picks tools; the graph does not.

Every other node is a plain graph node. A second model-first leaf takes its own ADR.

## Consequences

- Two agent frameworks in the dependency tree, with the split justified per node rather than per project.
- The node interface contract (ADR-0016) has to hold for a plain node and a Strands-backed node alike, or substitutability breaks on the one node where it matters most.
- Chon-Ji's tool calls are less predictable than the rest of the graph, so it needs its own step and token budget. Its output still passes the same gate as everything else.
- Checkpointing stays at the graph level. Strands' internal loop state is not durable across a restart, so a Chon-Ji node that dies mid-discovery resumes from its last graph checkpoint and re-runs the loop.

## Alternatives considered

- LangGraph everywhere, with discovery modeled as a loop plus a router node. Rejected: the router becomes a hand-written tool-selection heuristic, which is the job the model already does better.
- Strands everywhere. Rejected: the human gate needs deterministic interrupt points and a durable state object, and a model-first loop gives weaker guarantees about where it stops.
- One agent with 24 prompt personas. Rejected: no per-role context isolation, no per-role cost attribution, no per-role failure containment.
