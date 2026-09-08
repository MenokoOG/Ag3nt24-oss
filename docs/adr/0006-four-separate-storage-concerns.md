# ADR-0006: Four storage concerns, four stores, never collapsed

- Status: Accepted
- Date: 2026-08-28
- Deciders: Lawrence Jefferson II
- Related: ADR-0007, ADR-0008

## Context

Ag3nt24 holds four kinds of state with genuinely different durability, mutability, and trust requirements. The tempting simplification is one database for all of it. That collapse destroys the property that makes the audit trail worth anything: an append-only receipt chain sitting in the same store as mutable graph state can be rewritten by anything that can write graph state.

## Decision

Four concerns, four stores.

| Concern | Store | Properties |
|---|---|---|
| MD-spec charters (source of truth, human-authored) | S3 with versioning, mirrored in Git | Versioned, human-authored, reviewable as diffs |
| Graph and session state (LangGraph checkpointer) | Aurora PostgreSQL | Mutable, transactional, high write rate, prunable |
| Vector / RAG corpus per domain | Bedrock Knowledge Bases over S3 Vectors | Rebuildable from source, one namespace per role |
| Audit receipts (signed, append-only, hash-chained) | DynamoDB or S3 Object Lock, decided at implementation | Immutable, write-once, independent credentials |

The receipt store never shares a database, a schema, or a write credential with graph state. That separation is not negotiable and it is not an optimization target.

Vector indexes are treated as derived data. Losing one costs a rebuild, not a recovery.

## Consequences

- Four backup and restore paths instead of one, each documented before the first write.
- Cross-store consistency is eventual by design. A receipt references a graph state by run ID and checkpoint ID; it does not join against it.
- The final choice between DynamoDB and S3 Object Lock stays open until the receipt volume and query pattern of Pilot 1 are known. Both satisfy the append-only requirement; they differ on query cost and retention mechanics.
- Anyone proposing "just put it all in Postgres" is proposing to delete the audit guarantee. That is an ADR-level reversal, not a refactor.

## Alternatives considered

- One PostgreSQL instance for everything. Rejected for the reason above.
- Receipts in CloudWatch Logs. Rejected: retention and immutability are configuration rather than a storage property, and the hash chain needs a stable addressable record per receipt.
- Charters in the database instead of Git. Rejected: charters are human-authored prose that should be reviewed as diffs by a human before publication (ADR-0007).
