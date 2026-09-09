# ADR-0004: AWS Bedrock AgentCore is the deploy target

- Status: Superseded by ADR-0025 (2026-09-09). Text unchanged.
- Date: 2026-08-28
- Deciders: Lawrence Jefferson II
- Related: ADR-0005, ADR-0006, ADR-0009

## Context

Ag3nt24 needs a runtime, a tool gateway, session memory, telemetry, policy enforcement, and workload identity. Building those is months of undifferentiated work for a one-person team, and each one is a place where a self-hosted mistake turns into a security incident.

Earlier candidates were a home lab and a PaaS (Railway or Coolify).

## Decision

AWS Bedrock AgentCore is the deploy target, using Runtime, Gateway, Memory, Observability, Policy, and Identity.

No home lab. No Railway, no Coolify. Local development runs against the same interfaces, so a laptop run and a deployed run differ by configuration only.

## Consequences

- AWS is a hard dependency for the whole system, not a swappable backend. Portability is not a goal, and no abstraction layer gets written to preserve it.
- Region choice, service quotas, and AgentCore feature availability are project constraints and belong in the architecture doc.
- Cost is metered per invocation, so cost control is a design concern from the first pilot rather than a later cleanup. See ADR-0009 and ADR-0018.
- Policy and Identity are enforced by AWS, which means the dashboard cannot become a side door around them. Any action button routes through Policy like everything else.
- AgentCore is a young service. Feature gaps get worked around inside our own code and recorded as ADRs, not by forking off the platform.

## Alternatives considered

- Home lab. Rejected: no managed identity or policy layer, and an OT-adjacent system running on hardware in a house is the wrong risk posture for a pilot that touches a live production site.
- Railway / Coolify. Rejected: gives compute and nothing else. Gateway, Memory, Policy, and Identity would all be hand-built.
- Raw ECS or Lambda with self-assembled parts. Rejected: the same build cost as the PaaS route, plus more operational surface to keep running.
