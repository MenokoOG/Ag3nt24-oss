# ADR-0005: Tool access is MCP through AgentCore Gateway, using existing open-source servers

- Status: Accepted
- Date: 2026-08-28
- Deciders: Lawrence Jefferson II
- Related: ADR-0004, ADR-0008

## Context

The agent team has to reach legacy and OT surfaces: Modbus, OPC-UA, MQTT, plus ordinary web and database targets. Every one of those is a protocol with sharp edges, and a hand-rolled client is a new attack surface plus a new maintenance burden for a team of one.

## Decision

All tool access goes through MCP servers registered with AgentCore Gateway. No node opens a socket to a target system directly.

For Modbus, OPC-UA, and MQTT, existing open-source MCP servers get used. Writing one from scratch requires an ADR that says which server was evaluated and why it fell short.

Every registered server declares whether it is read-only or control-affecting. Control-affecting tools are gated per ADR-0008.

## Consequences

- One choke point for authorization, rate limiting, and audit. If a tool call is not in Gateway, it did not happen.
- Third-party MCP servers become dependencies with supply-chain risk. Each one gets pinned to a version, reviewed before adoption, and recorded with its source repository.
- Protocol coverage is limited by what the community has published. A gap in OPC-UA coverage becomes a scope decision, not a quiet workaround.
- Tool output is untrusted input. A device response, a file, or a mainframe screen is data, never instructions to the agent reading it. That rule lives in the node contract (ADR-0016).

## Alternatives considered

- Direct protocol clients inside each node. Rejected: no central audit point, credentials spread across 24 nodes, and every protocol bug becomes ours.
- Build our own MCP servers first. Rejected: months of protocol work before the orchestrator proves anything. Revisit only when a specific open-source server is shown to be inadequate.
- A single catch-all "run this command" tool. Rejected: unauditable and impossible to gate meaningfully.
