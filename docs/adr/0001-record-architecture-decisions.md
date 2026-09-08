# ADR-0001: Record architecture decisions

- Status: Accepted
- Date: 2026-08-28
- Deciders: Lawrence Jefferson II

## Context

Ag3nt24 is a legacy modernization framework built by one person plus, later, the agent team it defines. Decisions made now constrain the codebase for years, and there is no second engineer carrying the reasoning in their head. Without a written record, every architectural question gets re-litigated whenever a new session starts with an empty context window.

## Decision

Every decision that constrains future work gets an ADR in `docs/adr/`, numbered sequentially, in Markdown.

An ADR is `Accepted` only when Lawrence has ruled on it. Until then its status is `Open`, it carries at least two real options, and it names what is blocked while it stays open. Agents propose ADRs; the human signs them.

An ADR is never edited to reverse a ruling. It gets `Superseded by ADR-NNNN` and a new ADR is written.

File name format: `NNNN-kebab-case-title.md`.

## Consequences

- A PR that changes a constraint without an ADR is incomplete.
- `Open` ADRs are this project's decision backlog. They get worked down, not accumulated.
- The word "autonomous" does not appear in these documents. Agents propose, humans sign. A line of work is `active` or `ended`, never "paused."

## Alternatives considered

- Decisions in commit messages only. Rejected: unsearchable, and the reasoning dies with the diff.
- A single running decision log. Rejected: it grows into a file nobody can rewrite in one pass, which breaks the modularity rules this project runs under.
