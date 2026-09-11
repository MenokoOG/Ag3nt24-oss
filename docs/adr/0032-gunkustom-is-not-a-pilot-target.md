# ADR-0032: Gunkustom.com is not a pilot target

- Status: Accepted
- Date: 2026-09-11
- Deciders: Lawrence Jefferson II
- Supersedes: ADR-0012
- Withdraws: ADR-0019
- Related: ADR-0018, ADR-0024, ADR-0025, ADR-0027

## Context

ADR-0012 fixed the pilot order on 2026-08-28: Gunkustom.com first, the mock mainframe stack second. ADR-0019 was opened the same day to scope the first slice and never got a ruling.

Two things have changed since. Gunkustom.com is not going to be a pilot, ruled here. And the 2026-09-04 re-rule moved the estate the framework modernizes: AI systems a business assembled 2021 to 2026, prompt chains, RAG v1, fine-tuned models, vector stores, orchestration glue, vendor lock-ins. A website is not that estate, and neither is a simulated mainframe. ADR-0012 was answering a question the framework no longer asks.

ADR-0019 also rests on a stack that no longer exists. It scopes work in terms of Aurora checkpoints, the LangGraph run and MCP through AgentCore Gateway, all of which ADR-0025 superseded and ADR-0029 narrowed further.

## Decision

Gunkustom.com is not a pilot target. It is removed from the roadmap, the plan, the architecture overview and the agent-id tagging examples.

ADR-0012 is superseded in full. Its three parts land as follows.

- **Pilot 1 target: unruled.** Nothing replaces Gunkustom by default. The first run needs a target that is an inherited AI estate, and naming one is a ruling this ADR does not make.
- **The mock mainframe stack: dropped as Pilot 2.** It was scoped to exercise TN3270, COBOL copybooks and EBCDIC, which the 2026-09-04 estate definition does not include. If a legacy-interface test rig is wanted later, it takes a fresh ADR written against the current estate.
- **Military and defense systems integration: still out of scope**, unchanged, and still takes an ADR to reopen. That part of ADR-0012 carries forward intact.

ADR-0019 is withdrawn rather than ruled. Its three options, its acceptance list and its open questions are all written against Gunkustom and the superseded stack. When a pilot target is named, the scope question is opened fresh.

Both records stay in `docs/adr/` with a status header pointing here. Neither is deleted.

## Consequences

- Roadmap Phase 7 has no target. It reads as unruled until a pilot target is named, and no ship language attaches to it.
- The acceptance criteria in ADR-0019 were the only written statement of what a first run has to prove. That statement is now missing, and the ADR that names a pilot target has to restate it against the current stack.
- `docs/architecture/ag3nt24-overview.md` loses its Gunkustom references here, and remains stale in other respects. It still describes AgentCore Runtime, LangGraph, the Gateway and Aurora, all superseded by ADR-0025, ADR-0028 and ADR-0029. Correcting that document is separate work and is not done in this ADR.
- No claim is made anywhere that the framework has been exercised against a real system, because it has not been.

## Alternatives considered

- **Delete ADR-0012 and ADR-0019.** Rejected. ADR-0001 makes the log append-only, the repository is public with merged pull requests referencing both paths, and a superseded record is what explains why the current shape exists.
- **Name a replacement pilot target in this ADR.** Rejected. The target drives scope, blast radius and the Production Definition of Done, and picking one to fill the hole is how the wrong target gets chosen.
- **Rule ADR-0019 first, then supersede it.** Rejected. Ruling a scope question about a target that is not happening spends a decision on nothing.
