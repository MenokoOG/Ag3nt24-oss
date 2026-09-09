# Roadmap

Two labels are used here. **Done** means it is in this repository with a test or a manifest that shows it. **Designed** means there is a decision record or a doctrine file, and no code.

The full plan, with the system diagram and the container layout, is [docs/plan/2026-09-09-ag3nt24-hades-plan.md](docs/plan/2026-09-09-ag3nt24-hades-plan.md).

## Phase 0: rulings. Done, 2026-09-09.

The kernel is the boundary ACL (ADR-0023). Scouts are a deterministic layer under the 24 (ADR-0024). Docker and a model-agnostic stack (ADR-0025). ITF slot order with a rune translation (ADR-0026). HADES is the control room (ADR-0027). The 24-role roster is frozen (ADR-0015).

## Phase 1: kernel port. Done, 2026-08-16.

The four COBOL gates rebuild from unmodified v1.0.0 source with GnuCOBOL 3.2.0. The five carried scenarios reproduce their pinned verdicts: `5/5 match`. See [ADR-0021](docs/adr/0021-rebuild-cobol-gates-on-windows.md) and `conformance/`.

## Phase 2: registry and translation. Done 2026-09-09.

`conformance/registry.json` carries the 24 ITF slots with pattern name, key, domain role and rune number. `bridge/slot_translation.js` reads it and refuses to load a table that is not a bijection between ITF slots 1-24 and rune numbers 1-24. Conformance is extended with the 24-slot registry check and the day-20260112 rotation table resolved through the translation into ITF patterns, both pinned by hand in `conformance/expected.json`. The run reports `checks: 81/81`, `registry: 24/24 match`, `join: 24/24 match`, and still `5/5 match`. Node stdlib only. No agent behavior. See [ADR-0026](docs/adr/0026-itf-slot-order-with-rune-translation.md).

## Phase 3: kernel container. Designed.

Dockerfile, HTTP shim, conformance as the image test.

## Phase 4: protocol droid and model adapter. Designed.

Scout report in, team selected from the registry, findings and proposals out. First charter: Chon-Ji (01).

## Phase 5: first scout. Designed.

Read-only contact with a modern AI estate: API face, prompt files, vector-store and model configuration.

## Phase 6: HADES. Designed.

Human gate, receipt chain, prompt store, ETL sort `good | bad | messy | work-data | new`, telemetry, legacy-AI channel. Only `bad` reaches the eradication sequence, and only through a signature.

## Phase 7: first run. Designed.

Gunkustom.com read-only per ADR-0012 and ADR-0019 (open).

## What is not on this roadmap

Ship dates. Capability claims ahead of the code.
