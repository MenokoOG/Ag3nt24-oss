# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- ADR-0023 through ADR-0027 (Phase 0 rulings, 2026-09-09): the COBOL kernel is the boundary ACL; scouts are a deterministic layer under the 24; Docker and a model-agnostic stack supersede ADR-0003, 0004, 0005, 0007 and 0009 and amend 0006, 0010 and 0021; ITF slot order with a pinned rune translation; HADES is the control room at the boundary (amends ADR-0020).
- `docs/plan/2026-09-09-ag3nt24-hades-plan.md`: the build plan, phases 0 to 7, four containers, model selection.
- Phase 2, registry and translation: `conformance/registry.json` pins the 24 ITF slots with pattern name, key, domain role from ADR-0015 and the rune number from ADR-0026, cross-checked row by row against `prior-art/a24-v1/tkd-24/pattern_id.js`. `bridge/slot_translation.js` is the table's only reader and validates at load rather than at call, refusing anything that is not a bijection between ITF slots 1-24 and rune numbers 1-24. `conformance/expected.json` gains a `registry` key holding both pins, derived by hand from the ADRs. `conformance/run.js` adds the 24-slot registry check and the day-20260112 kernel join, which resolves both columns of the regenerated rotation table into ITF patterns; the run now reports `checks: 81/81`, `registry: 24/24 match` and `join: 24/24 match` alongside the unchanged `5/5 match`. Node stdlib only. No kernel change, no archive change, no agent behavior.

### Changed

- ADR-0015 ruled: the 24-role roster is frozen (Option A for the index, Option C for charters). Slot 10 reads Cloud and Container Platform.
- ROADMAP rewritten to phases 0 to 7. Phase 2 is now registry and translation, replacing the two earlier Phase 2 definitions.
- README status, design summary and repo layout updated for the rulings.
- Superseded and amended ADRs carry a status line pointing at ADR-0025 or ADR-0027. Their text is unchanged, per ADR-0001.
- Architecture overview carries a 2026-09-09 header pointing at the plan; its stack sections are superseded by ADR-0025.

## [0.1.0] - 2026-09-08

First public release of the repository: kernel port, doctrine, and contracts. Nothing is claimed as production capability.

### Added

- Kernel port (Phase 1): four COBOL gates in `kernel/`, `scripts/build-kernel.js`, Node bridges in `bridge/`, and the conformance suite in `conformance/` pinning all five carried scenarios at `5/5 match`. Merged from the private kernel-port repository.
- `prior-art/a24-v1/`: the ended v1.0.0 reference (scenarios, bridges, tkd-24 stubs, agents, kernel sources, doctrine). Read-only. Previously named `from-old-ag3nt24/` in the private kernel-port repository; `conformance/run.js` and `conformance/expected.json` now point here.
- `docs/adr/`: 22 architecture decision records; ADR-0002 and ADR-0015 define the 24 roles (ADR-0015 still open).
- `packages/ag3nt24_contracts`: the canonical serializer and evidence hash, with 28 tests. Merged from the private doctrine repository.
- `docs/adr/0001` through `0020` from the doctrine repository; `0021` (rebuild the COBOL gates on Windows, formerly the kernel repository's `0002`); `0022` (open source under Apache-2.0).
- `docs/architecture/ag3nt24-overview.md`.
- Community files: LICENSE (Apache-2.0), NOTICE, README, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, ROADMAP, issue and PR templates, CI.
