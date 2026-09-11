# ADR-0034: Retire the carried reference implementation

- Status: **Accepted. Ruled 2026-09-11.**
- Date: 2026-09-11
- Deciders: Lawrence Jefferson II
- Supersedes: ADR-0028 as to retention of the COBOL, ADR-0021
- Amends: ADR-0033 (the migration-oracle clause)
- Related: ADR-0014, ADR-0023, ADR-0029

## Context

ADR-0028 ruled Option C on 2026-09-09: the gates are rebuilt in Python, Python is the only implementation deployed, and the COBOL stays in `kernel/` as a reference for a differential harness. The same ADR wrote down what Option D would require if the COBOL were retired instead: `conformance/expected.json` and the generated tables become the specification, and they are committed before the COBOL stops building anywhere.

That condition is already met. `conformance/expected.json` carries the pinned verdicts for all five scenarios, the 24-slot registry pin, the translation join, and the resolved day-20260112 rotation table, 81 checks in total, pinned by hand and committed.

## Decision

The COBOL is retired. It is not the runtime, not a reference implementation, and not part of the repository going forward.

`conformance/expected.json` is the specification. The pinned verdicts and tables in it define correct behavior, and the Python gates are measured against those pins directly.

What leaves the repository: `kernel/*.cbl`, `kernel/bin/`, `scripts/build-kernel.js`, the COBOL bridges under `bridge/`, and every instruction to install GnuCOBOL. `NOTICE`, `CONTRIBUTING.md`, `ROADMAP.md`, `README.md`, the CI workflow and the issue templates lose their COBOL references in the same change.

`prior-art/a24-v1/` is untouched. ADR-0014 rules it read-only history and conformance reads its scenario fixtures, which are JSON.

## Sequencing

The removal lands with module 1, in the pull request that adds `packages/ag3nt24_kernel`.

Every check in `conformance/run.js` runs today by spawning a compiled gate. Deleting the COBOL before the Python gates exist leaves the repository with no working boundary check at all, and a `npm run conform` that cannot pass. Binding the removal to module 1 means the repository never has a window without one.

Module 1 changes accordingly. It is no longer a port measured against a second implementation. It is an implementation measured against the pins.

## Consequences

- One language in the repository for anything executable. No compiler pin, no GnuCOBOL, no platform that can or cannot build the gates.
- The CI gap from ADR-0028 closes. Conformance runs in CI on any runner, which was not possible while a gate needed GnuCOBOL 3.2.0.
- **The differential check is given up, and that is the cost.** ADR-0028 kept the COBOL because a TypeScript port passed review and still returned a wrong authorization table, which only a byte comparison caught. Without a second implementation, the pins are the only thing standing between a plausible wrong port and a green run. They have to be treated as immovable, and the adversarial cases in threat model 01 have to be written as tests rather than left as a list.
- ADR-0021 is spent. Its subject was rebuilding the COBOL on Windows, and there is no COBOL to rebuild. Its known-wrong reproducibility claim goes with it.
- ADR-0033's migration-oracle clause no longer applies. If Cedar is ruled in, it is measured against the pins like any other implementation.
- The public description stops referring to compiled COBOL anywhere. The README, the overview and the site copy change in the same pull request as the removal.

## Alternatives considered

- **Keep the COBOL through module 1, then retire it.** Rejected. It keeps a second implementation alive for one module and leaves COBOL in the public description for that whole period.
- **Delete it today, ahead of module 1.** Rejected on sequencing only. It leaves a public repository whose only test command cannot run.
