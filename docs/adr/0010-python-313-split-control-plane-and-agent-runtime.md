# ADR-0010: Python 3.13 throughout, control plane split from the agent runtime

- Status: Accepted
- Date: 2026-08-28
- Deciders: Lawrence Jefferson II
- Related: ADR-0004, ADR-0009, ADR-0017 (route list)

## Context

LangGraph, the Strands SDK, boto3, and the Bedrock tooling are all Python-first. Splitting the stack across languages to gain nothing is a cost with no return.

Separately: the dashboard API and the agent graph have different uptime requirements, different scaling shapes, and different failure blast radii. Running them in one process couples them.

## Decision

Python 3.13 for all backend code. Strict typing: full annotations, `mypy --strict` on the public surface, no bare `Any` on any public interface.

Two services, deployed and scaled independently:

1. **Control-plane API.** FastAPI plus Pydantic. Serves the dashboard, gate decisions, receipt queries, run management. Route list in ADR-0017.
2. **Agent runtime.** The LangGraph graph and the 24 nodes, running on AgentCore Runtime, reached through the AgentCore agent-invoke endpoint.

A control-plane outage must not take down the agent graph. A graph failure must not take down the dashboard's ability to show what happened. Neither imports the other's internals; both depend on a shared typed contracts package (ADR-0011).

## Consequences

- One shared package of Pydantic models, versioned with the repo, so the two services cannot drift on a schema.
- Two deploy units, two health checks, two sets of logs, and clearer ownership of each.
- A run in progress survives a control-plane restart, because run state is in the checkpointer, not in the API process.
- A gate decision made while the runtime is down is recorded and applied when the runtime returns. The gate write path goes to durable state first, and resumption is a separate step.
- Local development runs both, which is more moving parts on a laptop. A single compose file covers it.

## Alternatives considered

- One FastAPI app hosting the graph and the dashboard API. Rejected: a dashboard traffic spike or a bad dashboard deploy takes the graph with it.
- TypeScript control plane with a Python runtime. Rejected: duplicate model definitions in two languages, which is exactly the drift the shared package prevents.
- Python 3.12. Rejected: no reason to start a new codebase one release behind.
