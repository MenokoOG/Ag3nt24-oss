# ADR-0013: Build team is one person, plus the agent team once Pilot 1 proves the pattern

- Status: Accepted
- Date: 2026-08-28
- Deciders: Lawrence Jefferson II
- Related: ADR-0012

## Context

Team size is an architectural input. A design that needs 6 engineers to keep running is the wrong design for a team of 1, no matter how good it looks on a diagram.

## Decision

Lawrence builds Ag3nt24. After Pilot 1 proves the orchestrator and gate pattern, the 24-agent team takes on build work under the same gate that governs everything else: agents propose, the human signs. No external hires.

This constrains the architecture directly:

- Every component has to be operable by one person, including at 3am.
- Anything that needs a rota does not get built.
- Managed AWS services beat self-hosted ones by default (ADR-0004), because operational load is the scarce resource.
- Files stay small enough to rewrite in one pass, because that is the unit of work an agent contributor can actually complete.

## Consequences

- Sequential pilots, no parallel workstreams (ADR-0012).
- Documentation is load-bearing rather than courteous. It is how the next session, human or agent, recovers context.
- Bus factor is 1 and the mitigation is the written record: ADRs, charters, receipts, runbooks.
- The agent team contributing to its own codebase needs the receipt chain working before it starts, or there is no trail of who proposed what.

## Alternatives considered

- Hire a second engineer. Rejected: not a hiring decision this project gets to make, and building for a team that does not exist adds coordination overhead with no coordination.
- Contract out the AWS work. Rejected: the AgentCore surface is the part most worth understanding directly.
