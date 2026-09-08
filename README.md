# Ag3nt24

Ag3nt24 Droid Protocol Multi-Agent Framework with Anti-Corruption Layer: a legacy AI systems modernization framework, built in the open.

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE) [![CI](https://github.com/MenokoOG/Ag3nt24-oss/actions/workflows/ci.yml/badge.svg)](https://github.com/MenokoOG/Ag3nt24-oss/actions/workflows/ci.yml)

## What this is

Businesses spent 2021 to 2026 assembling AI systems while the field changed under them. Prompt chains, RAG v1, fine-tunes, vector stores, orchestration glue. Now nobody inside can explain what the system does, nobody can audit it, and nobody will sign off on replacing it.

The bottleneck is authority, not capability.

Ag3nt24 is designed for that seam. Adapter agents read the inherited AI estate on one side and speak to a modern stack on the other. They sit behind an Anti-Corruption Layer that a human controls. Agents propose. A human signs. Every signature leaves a receipt that cannot be quietly altered. HADES is the data layer: Data Lake sizing and governance, and the Human Authorized Data Eradication Sequence.

Read the system first, then choose.

## Status

Honest, as of 2026-09-08. Nothing in this repository is production capability.

- **Phase 1, kernel port: done 2026-08-16.** The four COBOL gates rebuild on Windows from byte-identical copies of the carried v1.0.0 sources, compiled with GnuCOBOL 3.2.0. No COBOL was modified. All five carried scenarios reproduce their pinned verdicts: `5/5 match`, 33 of 33 checks, exit 0. See [ADR-0021](docs/adr/0021-rebuild-cobol-gates-on-windows.md).
- **Phase 2, the 24-slot pattern registry: next.** Not started here.
- **Python:** one module, `ag3nt24_contracts.canonical`, the canonical serializer and evidence hash the receipt chain sits on. 28 tests.
- **Implemented agents: 0.** The 24 roles are definitions, one per ITF pattern in syllabus order (ADR-0002, roster in ADR-0015). They are not implemented agents. The v1.0.0 `PATTERN_SOULS.md` is ended prior art (ADR-0014) and lives under `prior-art/`.
- **Everything under `docs/` is design.** Treat it as specification.
- No benchmark claims. There is no benchmark.

Ag3nt24 v1.0.0 is ended (ruled 2026-08-15). This repository is the rebuild.

## What is in this repo

```
kernel/            four COBOL gates: tenet_gate, provenance_validate, rune_authorize, rune_rotation
kernel/bin/        BUILD-MANIFEST.json only; compiled gates are build output and are not committed
scripts/           build-kernel.js, rebuilds the gates with cobc -x and writes the manifest
bridge/            Node stdlib bridges: fixed-width records in, DECISION lines out
conformance/       run.js + expected.json, the test suite for the kernel port
prior-art/a24-v1/  the ended v1.0.0 reference, read-only; the conformance gate reads scenarios/ from here
packages/          ag3nt24_contracts, Python 3.13, the canonical hashing primitive and its tests
docs/adr/          22 architecture decision records
docs/architecture/ the design overview, start there
.github/           CI, issue templates, PR template
```

## Run it

Prerequisites: GnuCOBOL 3.2.0 with `cobc` on PATH, Node 24, Python 3.13 and [uv](https://docs.astral.sh/uv/).

```
npm run build:kernel     # rebuild the four gates from kernel/*.cbl
npm run conform          # run the five scenarios; expects "5/5 match"
uv sync && uv run pytest # the Python contracts package
```

`conform` regenerates its rune tables from the kernel on every run. A changed verdict means the port is wrong. Expectations are never adjusted to make a run pass.

The kernel port was developed and measured on Windows. The carried v1.0.0 `.bin` gates were Linux ELF and are not in this repository; the port is proven by rebuilding from source.

## Design in one screen

The kernel is the floor. Gates evaluate, a Decision Certificate is assembled, a human signs, then state changes. Nothing changes state before the signature.

- **Deterministic COBOL on slot indices.** The four gates are short, straight-line boolean logic with no I/O, no clock, and no randomness. Every verdict is reproducible on any day.
- **Fail closed.** On uncertainty, missing artifacts, invalid signatures, or anomalies: deny.
- **Append-only ledger.** Every human decision writes one receipt, hash-chained to the one before it. Machine gates log; they do not sign and they write no receipts.
- **OODA loop.** Observe, Orient, Decide, Act. The 24 patterns distribute across it.
- **24 patterns.** Each is bound to one ITF Taekwon-Do pattern, Chon-Ji through Tong-Il, for the discipline that pattern teaches. Twenty-four is fixed.
- **Two gates, two words.** The gate is the human gate. The ACL is the machine gate. Clearing the ACL is never authorization to act.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). Every commit carries a DCO sign-off (`git commit -s`). Every PR keeps `npm run conform` at 5/5 or ships an ADR explaining the verdict change.

## Security

Report vulnerabilities privately to security@classhuman.org. See [SECURITY.md](SECURITY.md).

## License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).

## About classHuman AI

classHuman AI LLC is a research and open-source organization for Legacy AI Systems Modernization. [classhuman.org](https://classhuman.org). WDVA Certified Veteran Owned Business #WDVACHAI26.

LAHA: Love All Humans Always.
