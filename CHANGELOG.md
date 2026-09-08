# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

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
