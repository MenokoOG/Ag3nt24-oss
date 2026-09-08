# ADR-0022: Open source under Apache-2.0

- Status: **Accepted**
- Date: 2026-09-08
- Deciders: Lawrence Jefferson II
- Related: ADR-0001, ADR-0014, ADR-0021

## Context

Ag3nt24 was built in two private repositories. The doctrine repository held the architecture decision records, the design overview, and the Python contracts package. The kernel-port repository held the COBOL gates, the Node bridges, the conformance suite, and the carried v1.0.0 archive.

classHuman AI LLC is a research and open-source organization for Legacy AI Systems Modernization. Work that stays private cannot be read, checked, or improved by anyone outside. The problem the framework addresses is that nobody inside an organization can explain its AI systems well enough to sign off on them; a framework that claims to fix that and is itself closed is a poor argument. Visibility of the design, the decisions, and the tests is the point. Contributors need one place to read and one process to follow.

Two repositories also meant two histories for one system, with the archive of record in one and the decisions that depend on it in the other.

## Decision

1. The project is licensed under the Apache License, Version 2.0. Copyright 2026 Lawrence Jefferson II / classHuman AI LLC. A NOTICE file credits the doctrine author.
2. One public repository, `MenokoOG/Ag3nt24-oss`, merged from the two private repositories. The doctrine repository contributes `docs/adr/0001` through `0020`, `docs/architecture/`, `packages/ag3nt24_contracts`, and the uv workspace. The kernel-port repository contributes `kernel/`, `scripts/`, `bridge/`, `conformance/`, its ADR on the Windows rebuild (renumbered `0021`), and the v1.0.0 archive, now at `prior-art/a24-v1/`. The doctrine files `PATTERN_SOULS.md` and `DOCTRINE_INVARIANTS.md` from that archive are copied to `doctrine/` as the doctrine source of truth.
3. Contributions carry a Developer Certificate of Origin sign-off on every commit (`git commit -s`). No contributor license agreement.
4. All changes reach `main` through pull requests. Every pull request keeps the conformance suite at `5/5 match` or ships an ADR explaining the verdict change.
5. Files that belong to the private working environment do not travel: agent operating files, code review notes, internal briefs, planning documents, and the reference inputs reviewed on 2026-09-04.

## Consequences

- Anyone can read the gates, the expectations, and the reasoning behind every pinned verdict. That is the review the private repositories could not get.
- The as-built status in the README is a public statement and is held to the same rule as before: it changes in the same commit as the capability it describes.
- Apache-2.0 grants a patent license with the copyright license. Contributors accept that when they sign off.
- The `prior-art/a24-v1/` archive is published as-is, read-only, with its own README stating that the line is ended. The conformance suite reads its scenarios and applies its one declared correction at load time, exactly as before the move.
- Two private repositories remain as history. They are not the source of truth from this date; this repository is.
- The private repositories' ADR numbering diverges here: the kernel repository's `0002` is `0021` in this tree. Its `0001` (record architecture decisions) duplicated the doctrine repository's `0001` and was dropped.
