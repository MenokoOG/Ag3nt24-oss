# Contributing to Ag3nt24

Thank you for reading this first. It is short.

## Set up

Prerequisites: GnuCOBOL 3.2.0 with `cobc` on PATH, Node 24, Python 3.13, and [uv](https://docs.astral.sh/uv/).

```
git clone https://github.com/MenokoOG/Ag3nt24-oss.git
cd Ag3nt24-oss
npm run build:kernel
npm run conform            # must end with "5/5 match"
uv sync
uv run ruff format --check .
uv run ruff check .
uv run mypy packages
uv run pytest
```

CI runs the same commands. If your change passes locally and fails in CI, say so in the PR and we will look together.

## Branches

Branch from `main`. Name the branch by type and topic: `feat/<topic>`, `fix/<topic>`, `docs/<topic>`, `adr/<number>-<topic>`. Nothing merges to `main` without a pull request.

## Sign your commits (DCO)

Every commit carries a Developer Certificate of Origin sign-off. Use `git commit -s`, which adds:

```
Signed-off-by: Your Name <you@example.com>
```

The sign-off states that you wrote the change or have the right to submit it under Apache-2.0. See [developercertificate.org](https://developercertificate.org/). Unsigned commits are not merged.

## The conformance rule

`npm run conform` runs the five carried v1.0.0 scenarios through the rebuilt COBOL gates and compares every verdict against `conformance/expected.json`. Every PR keeps it at `5/5 match`.

If your change moves a verdict, the PR ships an ADR that explains why the verdict changed and why the new verdict is right. `expected.json` is never edited to make a run pass. The archive under `prior-art/a24-v1/` is never edited at all.

## ADRs

Anything that constrains future work gets an Architecture Decision Record in `docs/adr/`. Take the next number. Use the format of the existing records: title, Status, Date, Deciders, then Context, Decision, Consequences. Open decisions are marked as open and get a ruling before code depends on them.

## Vocabulary

These rules are enforced in review.

- The word "autonomous" is never used for this system. Agents propose. Humans sign.
- No capability claim without evidence in the repository. If a test, a manifest, or a conformance run does not show it, do not write it.
- "Paused" is not a status. A line of work is active or it is ended.
- The 24 roles are definitions. They are not implemented agents. Do not count them as such.

## Role and pattern proposals

Changes to one of the 24 roles (ADR-0002, ADR-0015) start as an issue using the **Pattern proposal** template. The proposal cites the ITF pattern and the discipline it teaches. Mythology stays out. A change to the roster is an ADR, ruled by the maintainer before any code follows.

## Be kind

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). Read it once.

LAHA: Love All Humans Always.
