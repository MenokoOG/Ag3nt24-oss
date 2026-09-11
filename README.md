# Ag3nt24

Ag3nt24 Droid Protocol Multi-Agent Framework with Anti-Corruption Layer: a legacy AI systems modernization framework, built in the open.

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE) [![CI](https://github.com/MenokoOG/Ag3nt24-oss/actions/workflows/ci.yml/badge.svg)](https://github.com/MenokoOG/Ag3nt24-oss/actions/workflows/ci.yml)

## What this is

A business has an AI system it can no longer explain. Prompt chains, retrieval pipelines, fine-tuned models, vector stores, orchestration glue, assembled between 2021 and 2026 while the field changed underneath. The people who wrote it have moved on. Nobody inside can say what it does, so nobody will sign off on replacing it, and the project stalls at the signature.

Ag3nt24 works that seam. Adapter agents read the inherited estate on one side and speak to a modern stack on the other, behind an Anti-Corruption Layer a human controls. Agents propose, a human signs, and every signature leaves a receipt that cannot be quietly altered. HADES is the data layer, covering Data Lake sizing and governance and the Human Authorized Data Eradication Sequence.

The aim is a replacement with minimal downtime, where the customer notices nothing except better UX.

Start with [docs/overview.md](docs/overview.md).

## Status

Design, with early implementation. Nothing here is production capability.

- **Implemented agents: 0.** The 24 are a designed roster with charters, one role per ITF pattern, frozen in `conformance/registry.json`.
- **There is no benchmark**, no ship date and no waitlist.
- **Built and green:** the 24-slot registry and its translation table, four gates reproducing their pinned verdicts, and `ag3nt24_contracts` with the canonical serializer and evidence hash the receipt chain sits on.
- **Everything under `docs/` is design.** Read it as specification.

What is built and what is designed are tracked separately in [ROADMAP.md](ROADMAP.md), and that list changes in the same commit as the thing it describes. The decision history is in [CHANGELOG.md](CHANGELOG.md) and [docs/adr/](docs/adr/).

Two decisions are open rather than settled, and both are in the tree: [ADR-0033](docs/adr/0033-cedar-replaces-the-cobol-gates-as-the-boundary-acl.md) on which engine enforces the boundary, and [ADR-0031](docs/adr/0031-durable-orchestration-for-the-hades-sort.md) on orchestration for the HADES sort.

## Design in brief

Scouts make read-only first contact with the estate. The kernel is the Anti-Corruption Layer every crossing passes, in both directions. The protocol droid reads the cleared report and picks the team from the 24. The team returns findings and proposals. HADES is where a human signs, and state changes after that.

- **Deterministic boundary.** The gates are short, straight-line boolean logic on slot indices, with no I/O, no clock and no randomness. Same input, same verdict.
- **Fail closed.** On uncertainty, a missing artifact, an invalid signature or an anomaly, the answer is deny, with the reason recorded.
- **Append-only ledger.** One receipt per human decision, hash-chained to the one before it. Machine gates log. They do not sign and they write no receipts.
- **Two gates, two words.** The gate is the human gate, in HADES. The ACL is the kernel. Clearing the ACL is not authorization to act.
- **24 roles.** Each bound to one ITF Taekwon-Do pattern, Chon-Ji through Tong-Il, for the discipline that pattern teaches.
- **OODA.** Observe, Orient, Decide, Act, with the roles distributed across it.
- **Three containers** (ADR-0029): `api` (Python 3.13, FastAPI, holding HADES, the protocol droid, the scouts, the model adapter and the kernel gates as an imported package), `web` (the built React bundle), `db` (PostgreSQL). Any model provider sits behind one adapter.

A threat model for the kernel and its boundaries is in [docs/security/](docs/security/), written before the build. It lists what fails open today, and marks each finding as a test, a ruling, or a recorded risk.

## What is in this repo

```
packages/          ag3nt24_contracts, Python 3.13: the canonical serializer, evidence hash, and tests
kernel/            the four gates as carried source, kept as the reference the Python port is measured against (ADR-0028)
scripts/           build-kernel.js, rebuilds the reference gates and writes the manifest
bridge/            slot translation and the conformance bridge
conformance/       run.js, expected.json and registry.json: the 24 slots and the pinned verdicts
prior-art/a24-v1/  the ended v1.0.0 reference, read-only; conformance reads its scenarios
docs/overview.md   the official overview, start here
docs/adr/          33 architecture decision records
docs/architecture/ the design overview
docs/security/     threat models, written before each build phase
docs/plan/         build plans
site/              the project site
.github/           CI, issue templates, PR template
```

## Run it

Prerequisites: Node 24, Python 3.13 with [uv](https://docs.astral.sh/uv/), and GnuCOBOL 3.2.0 with `cobc` on PATH for the reference gates.

```
npm run build:kernel      # rebuild the reference gates
npm run conform           # the 24-slot registry, the translation, and the five scenarios
uv sync && uv run pytest  # the Python contracts package
```

A changed verdict means a port is wrong. Pinned expectations are not adjusted to make a run pass.

ADR-0028 rebuilds the gates in Python, which becomes the only implementation deployed. That work is in progress. When it lands, `npm run conform` runs both implementations and fails on a one-byte disagreement, and GnuCOBOL becomes a development and audit dependency only.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). Every commit carries a DCO sign-off (`git commit -s`). Every pull request keeps `npm run conform` green or ships an ADR explaining the verdict change.

If you work on authorization, formal methods, legacy modernization, or you have inherited an AI estate you cannot explain, the open ADRs are the most useful place to push back.

## Security

Report vulnerabilities privately to security@classhuman.org. See [SECURITY.md](SECURITY.md).

## License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).

## About classHuman AI

classHuman AI LLC is a research and open-source organization for Legacy AI Systems Modernization. [classhuman.org](https://classhuman.org). WDVA Certified Veteran Owned Business #WDVACHAI26.

LAHA: Love All Humans Always.
