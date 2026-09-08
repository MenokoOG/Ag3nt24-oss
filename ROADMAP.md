# Roadmap

Two labels are used here. **Done** means it is in this repository with a test or a manifest that shows it. **Designed** means there is a decision record or a doctrine file, and no code.

## Phase 1: kernel port. Done, 2026-08-16.

The four COBOL gates rebuild from unmodified v1.0.0 source with GnuCOBOL 3.2.0. The five carried scenarios reproduce their pinned verdicts: `5/5 match`. The Node bridges differ from their originals by one line each, the binary path. See [ADR-0021](docs/adr/0021-rebuild-cobol-gates-on-windows.md) and `conformance/`.

## Phase 2: 24-slot pattern registry. Next. Designed.

A registry of the 24 roles with load-time validation of each slot's pattern and capability binding. Node stdlib only. The role definitions come from ADR-0002 (one role per ITF pattern, syllabus order) and ADR-0015 (the roster for patterns 2 to 24). No agent behavior is built in this phase; the registry holds definitions.

## Phase 3: HADES data layer. Designed.

Data Lake sizing and governance, with the sort taxonomy `good | bad | messy | work-data | new`. Only `bad` reaches the Human Authorized Data Eradication Sequence. Eradication takes the ordinary path: gate request, a human signature, one receipt, then execution. The append-only ledger it needs is the receipt chain. There is no auto-eradication path. See [ADR-0020](docs/adr/0020-reconcile-hades-build-prompts-with-the-adr-spine.md).

## Phase 4: Anti-Corruption Layer and the Talk, Protocol, Droid, Report pipeline. Designed.

The ACL is a deterministic rules engine on data leaving the core pipeline: go or no-go, structured reason, logged. It runs upstream of the human gate and never replaces it. Talk, Protocol, Droid, Report is the vocabulary for the run flow in [docs/architecture/ag3nt24-overview.md](docs/architecture/ag3nt24-overview.md). See ADR-0020.

## Later

- Telemetry-driven new structure. Designed in outline only: one tagged pipeline, ADR-0009 and ADR-0018 (open).
- Rebuild. To Be Defined.

## What is not on this roadmap

Ship dates. Capability claims ahead of the code.
