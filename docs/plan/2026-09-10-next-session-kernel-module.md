# Next session prompt: module 1, the kernel

Written 2026-09-09 at the end of the previous session. Copy everything below the line into a fresh Claude Code session in this repository.

---

Read `F:\classHuman\M3n0ko0g-library\RUNE-BOOT.md` first and load what it names. Do not restate those files.

You are working in `F:\classHuman\Ag3nt24-oss`. Windows, Node 24, Python 3.13 via `uv`, GnuCOBOL 3.2.0 at `C:\msys64\ucrt64\bin\cobc.exe`. **Never touch `main`. Never use `--no-verify`.**

## Where things actually stand, 2026-09-09

`main` is `d87f347`. Pull requests 1 through 5 are all merged.

`main` contains two things that disagree with each other:

- **Phase 2** — the 24-slot registry, the ITF-to-rune translation in `bridge/slot_translation.js`, the pins in `conformance/expected.json`, and the extended runner. Green: `checks: 81/81`, `5/5 match`, `registry: 24/24 match`, `join: 24/24 match`.
- **Phase 3** — a Node HTTP shim (`bridge/shim.js`), a Dockerfile that compiles GnuCOBOL 3.2.0 from source, `docker-compose.yml`, and a `kernel-image` CI job. This was merged from a **draft** pull request and **that CI job has never passed**. Assume CI on `main` is red until you check.

Two rulings are made and not yet in `main`:

- **ADR-0028, ruled, on branch `claude/adr-0028-kernel-disposition`, 2 commits ahead, not merged.** The four gates are rebuilt in Python. The COBOL stays in `kernel/` as the reference implementation, still building on this machine, never deployed. `npm run conform` becomes a differential harness that runs both implementations and fails if they disagree by one byte.
- **ADR-0029, drafted and uncommitted on branch `claude/redesign-python-backend`.** Python backend end to end, React with Vite and TypeScript for the frontend, Node off the runtime path, three containers (`api`, `web`, `db`) instead of four. Read it, do not assume it; Lawrence has seen it but it is not committed.

Because ADR-0028 and ADR-0029 supersede most of Phase 3, the Dockerfile and the Node shim in `main` are dead code awaiting removal. Do not build on them.

## How Lawrence wants this built

**Module by module. Discuss before building.** He ruled this after a session that produced five pull requests, a commit pushed to `main` by accident, and a container that never worked. He has a TBI: short answers, one task at a time, no step lists unless he asks for a plan. If priorities are unclear, ask "What is the one thing we should focus on right now?"

The module map, from doctrine:

| # | Module | Doctrine | State |
|---|---|---|---|
| 1 | Kernel / ACL — four gates, differential harness | ADR-0023, ADR-0028 | COBOL proven; Python rotation port proven |
| 2 | Contracts — canonical serializer, evidence hash | ADR-0010 | exists, 28 tests, green |
| 3 | Registry / the 24 — ITF slots, translation | ADR-0002, 0015, 0026 | done, merged |
| 4 | Scouts — read-only estate discovery | ADR-0024 | designed only |
| 5 | Protocol droid and model adapter | ADR-0025 | designed only |
| 6 | HADES — gate, receipts, prompt store, ETL sort, telemetry | ADR-0027 | designed only |
| 7 | Frontend — three dashboards plus the signing surface | concept note | undesigned |
| 8 | Data — run state, prompts, receipts schema | ADR-0006 | designed only |
| 9 | Governance as a gated change | ruled 2026-09-09 | undesigned |

## Your task: module 1, the kernel

**Discuss the shape with Lawrence before writing code.** Then build it.

Port the four COBOL gates to Python as `packages/ag3nt24_kernel`, matching the workspace layout of `packages/ag3nt24_contracts` (`src/`, `tests/`, `pyproject.toml`, hatchling, version from the repository `VERSION` file). It must pass `ruff` with the repository's rule set, `mypy --strict`, and `pytest`.

Then make conformance differential: every scenario and every generated rotation table runs through both the Python gates and the compiled COBOL, and the run fails on any disagreement.

`ag3nt24_kernel` imports nothing from `core` or `hades` and exposes only the gate functions. Assert it with a test, the way `packages/ag3nt24_contracts/tests/test_dependency_rule.py` already does.

## Facts already paid for. Do not rediscover these.

1. **`POS` is a reserved word in GnuCOBOL 3.1.2.** `kernel/rune_rotation.cbl` declares `01 POS PIC 99` and drives its hex loop with it, so it does not compile on Ubuntu or Debian, which package 3.1.2. Only 3.2.0 works, and Debian does not package 3.2.0.
2. **`rune_rotation`'s LCG constants are truncated by their own PICTURE clauses.** `LCG-A PIC 9(9) VALUE 1103515245` runs as `103515245`; `LCG-M` runs as `147483647`. The source comment calls it "classic ANSI C style" and is wrong. **Port from the declarations, never the comments.**
3. **JavaScript and TypeScript need `BigInt` on the rotation path.** `state * LCG_A` reaches `1.527e16`, above `Number.MAX_SAFE_INTEGER` (`9.007e15`). Ordinary numbers lose precision silently and return a wrong authorization table with no error.
4. **`tenet_gate` evaluates all five tenets unconditionally and each failure overwrites `DENIAL-REASON`.** When several fail, the **last** in source order owns the reported reason. Order: Courtesy, Integrity, Perseverance, Self-control, Indomitable Spirit. A port that returns the first failure looks correct and is wrong; scenarios B and C exercise this.
5. **`provenance_validate` is the opposite.** It uses `GO TO OUTPUT-RESULT`, so the **first** failure wins. Order: unauthorized signer, lineage mismatch, content hash missing. Its three signer ids are static and padded to 16: `DEV-OPERATOR`, `SYSTEM-DAEMON`, `ARCH-OVERRIDE`.
6. **`rune_authorize`** reads a `PIC X(10)` line, takes positions 1-2 as the rune and 4-5 as the capability, stops at the first match, and defaults to deny. The `SIG,...` line truncates to ten characters, fails the `IS NUMERIC` test, and is skipped. Non-numeric fields become `0`.
7. **A working Python parity proof already exists:** `docs/adr/0028-evidence/rotation_port.py`, byte-identical to the compiled COBOL on 14 of 14 cases including both pinned epoch days and the `SIG` line. Start there.
8. **`kernel/bin/BUILD-MANIFEST.json` goes dirty after every build.** The `.exe` hashes are not reproducible on this toolchain. The **source** hashes are stable and do match the pin. ADR-0021's claim that "the binary is reproducible from the manifest" is wrong as written and still needs narrowing or withdrawing.
9. **`.gitattributes` sets `*.cbl text eol=crlf`.** If a worktree holds them as LF, `build-kernel.js` recomputes every source hash and rewrites the manifest. Fix: `rm kernel/*.cbl prior-art/a24-v1/kernel/*.cbl && git checkout -- kernel prior-art`.
10. **A git GUI on this machine switches the working tree and discards untracked files without warning.** It did both mid-session: it moved the tree onto `main`, and it deleted an untracked concept file and 19 untracked `.github/instructions/` files permanently. **Run `git branch --show-current` immediately before every commit and every push.** A commit reached `main` this way and had to be force-restored.
11. **Docker Desktop is installed; its Linux engine needs WSL2, which is not installed.** `wsl --install` in an Administrator PowerShell, then reboot. Not required for module 1.

## Rules

- Never edit the COBOL. Never edit `prior-art/`. Never adjust a pinned expectation to make a run pass.
- The word "autonomous" does not appear. "Paused" is retired. Never write "24 implemented agents". Nothing here is a capability claim. No services, no pricing.
- Stdlib first. If you think you need a dependency, stop and say why.
- `git commit -s` (DCO required). Push `claude/*` branches; Lawrence merges `main`.
- Ask before doing anything outside this task.

## Acceptance

`uv run pytest`, `uv run ruff check .`, `uv run mypy packages` all pass. The differential conformance run reports the Python and COBOL gates agreeing on every scenario and every rotation table, and still ends with `5/5 match`. Nothing under `kernel/` or `prior-art/` is modified.
