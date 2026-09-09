# ADR-0027: HADES is the control room at the boundary

- Status: Accepted
- Date: 2026-09-09
- Deciders: Lawrence Jefferson II
- Amends: ADR-0020
- Related: ADR-0006, ADR-0008, ADR-0023, ADR-0024, ADR-0025

## Context

ADR-0020 defined HADES as data-only: Data Lake sizing and governance plus the Human Authorized Data Eradication Sequence. That ruling put the human gate, the prompt store, telemetry and every other human-facing surface in an unnamed control plane. The 2026-09-09 ruling names it.

## Decision

HADES is the control room of the framework and the human's only surface. It is a data lake and engineering platform for anti-corruption at the boundary where scouts contact the legacy system and hand off to the team.

Two expansions of the name, both in force:

- **Human Authorized Data Evaluation System**, on the way in. Data ingested from the legacy system is sorted, validated and transformed so the current data structures and the source of truth can be identified. From that, the team builds new data structures for the legacy system or updates the system in place, since the estates being modernized are AI systems.
- **Human Authorized Data Eradication Sequence**, on the way out. Data of no use in the old system or the new one takes the eradication path: sandbox, security audit, gate request, a human signature, one receipt, then execution. No auto-eradication path under any condition.

The sort taxonomy from ADR-0020 stands: `good | bad | messy | work-data | new`. Only `bad` reaches the eradication sequence.

HADES holds, and nothing else holds:

- The human gate of ADR-0008 and the receipt writer. One signature, one receipt, then state changes.
- The prompt store: system prompts and the 24 charters as deployed artifacts, versioned, with the source commit SHA. Authoring stays in this repository.
- Human interaction with the ETL pipeline: the sort, the validation rules, the transforms, and the review of each bucket.
- All telemetry, tagged by ITF slot, for every scout, pattern and kernel call.
- The legacy-AI channel: when the team needs to talk to the inherited AI system directly, it happens here, through the kernel, logged.

Humans make the decisions in HADES. The team returns findings and proposals for planning and implementation; HADES is where they become actions.

Two gates, two words, unchanged: **the kernel is the ACL** (ADR-0023), machine, logs only. **The gate** is the human gate, in HADES, the only thing that writes receipts.

## Consequences

- ADR-0020's "data-only" scope is widened. The append-only ledger is still the ADR-0008 receipt chain; no second store.
- `hades` is one container (ADR-0025) and the control plane of ADR-0010. The dashboard of ADR-0009 is a HADES view.
- A client Data Lake remains a target system, as ADR-0020 ruled. HADES governs it; it is not a fifth store.
- The earlier expansions of the name (the diagnostic and deactivation system of the v1.0.0 doctrine, and HADES v0) stay ended. This is a new component that reuses the name.

## Alternatives considered

- Keep HADES data-only and name the control plane separately. Rejected: two human-facing surfaces is one too many for a one-person operator, and the data decisions and the gate are the same conversation.
