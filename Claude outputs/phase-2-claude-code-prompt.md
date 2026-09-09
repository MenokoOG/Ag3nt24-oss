# Ag3nt24 Phase 2: registry and translation

You are working in `F:\classHuman\Ag3nt24-oss` on branch `claude/phase-2-registry` (already created and pushed). Windows, Node 24, GnuCOBOL 3.2.0 at `C:\msys64\ucrt64\bin\cobc.exe`. Never touch `main`. Never use `--no-verify`.

## Read first, in this order

1. `docs/adr/0026-itf-slot-order-with-rune-translation.md` (the translation table you are implementing)
2. `docs/adr/0002-24-role-team-one-per-itf-pattern.md` and `docs/adr/0015-domain-role-roster-for-patterns-2-24.md` (the 24 slots and domains)
3. `docs/adr/0021-rebuild-cobol-gates-on-windows.md` and `conformance/run.js`, `conformance/expected.json` (how conformance works today)
4. `docs/plan/2026-09-09-ag3nt24-hades-plan.md`, section Phase 2
5. `prior-art/a24-v1/tkd-24/pattern_id.js` and `pattern_capability.js` (read-only cross-check for the v1 rune numbers; never edited, never imported)

Do not read anything else under `prior-art/` or `docs/adr/` unless a step below needs it.

## Goal

Add the 24-slot registry with the ITF-to-rune translation, extend the conformance runner to verify it and to resolve the kernel's day-20260112 rotation table into ITF patterns, and pin the result. Node stdlib only. No new dependencies. No agent behavior.

## Before writing anything

Run `npm run build:kernel && npm run conform`. It must print `5/5 match` and exit 0. If it does not, stop and report; Phase 2 does not start on a red kernel.

## Steps

1. Create `conformance/registry.json`. Schema `ag3nt24/registry/1`. One entry per ITF slot 1 to 24: `slot`, `pattern` (as ADR-0002 spells it, e.g. `Chon-Ji`), `key` (upper snake, e.g. `CHON_JI`), `domain` (the exact role text from the ADR-0015 table), `rune` (the v1 number from the ADR-0026 table). Add a `derivedFrom` block naming ADR-0002, ADR-0015, ADR-0026 and `prior-art/a24-v1/tkd-24/pattern_id.js`, and a `why` line on the file explaining that rune numbers exist only to call the kernel.

2. Cross-check, do not copy: for every entry, confirm that `pattern_id.js` lists `key` at slot `rune`. If any row disagrees with ADR-0026, STOP and report the row. Do not invent a mapping and do not edit the ADR.

3. Create `bridge/slot_translation.js` (stdlib only). Exports `runeForSlot(slot)`, `slotForRune(rune)`, `patternForSlot(slot)`, and `loadRegistry()`. `loadRegistry()` reads `conformance/registry.json` and throws if there are not exactly 24 entries, slots are not 1..24 contiguous, runes are not a bijection onto 1..24, or any key or pattern repeats. This is the load-time invariant ADR-0026 asks for. Capability numbers translate through the same table: capability `n` is owned by the pattern whose `rune` is `n`.

4. Extend `conformance/run.js` after the five scenarios:
   - Registry check: load the registry, print a 24-row table (slot, pattern, domain, rune, PASS/FAIL against the pinned expectation), and count each row as one check.
   - Kernel-registry join: take the freshly generated `out/rune_table_20260112.csv` (the runner already regenerates it), and for every `RR,CC` row resolve `RR` to its ITF slot and pattern and `CC` to the ITF slot and pattern that owns that capability. Assert all 24 rows resolve, no ITF slot appears twice on either side. Print the resolved table. Compare it to the pinned expectation row by row.
   - Fold the new checks into the existing totals so the run ends with one `checks: N/N match` and one `scenarios: 5/5 match` line, and the final `5/5 match` line stays exactly as it is (CONTRIBUTING and CI grep for it). Add a separate final line `registry: 24/24 match` and `join: 24/24 match`.
   - A rune number must not appear in any printed line outside the translation columns.

5. Pin the expectations in `conformance/expected.json` under a new top-level key `registry` with `slots` (the 24 rows) and `joinDay20260112` (the 24 resolved rows), each row carrying a `why`. Derive the join by hand from the ADR-0026 table and the known day-1 rune table (`01,23 02,11 03,09 04,18 05,13 06,10 07,08 08,22 09,16 10,06 11,17 12,04 13,07 14,20 15,01 16,12 17,05 18,14 19,02 20,03 21,15 22,19 23,21 24,24`). Do not generate the pin by running the code and copying its output. If the run disagrees with the hand derivation, the code is wrong until proven otherwise.

6. Do not modify `kernel/`, `prior-art/`, or the five scenarios. Do not modify existing entries in `expected.json`. `git status` at the end must show no change under those paths.

7. Update `CHANGELOG.md` under `[Unreleased]` (one Added block for Phase 2), update `ROADMAP.md` Phase 2 to Done with today's date, and update the README status bullet for Phase 2. No other doc changes.

8. Commit in small steps with `git commit -s` (DCO required). Message style: `feat: 24-slot registry with ITF-to-rune translation (Phase 2)`. Push the branch. Do not open the PR; report back with the full conformance output, `git log --oneline main..HEAD`, and the list of files changed.

## Rules

- Never edit COBOL. Never edit the archive. Never adjust an expectation to make a run pass.
- The words "autonomous" and "paused" do not appear. Never write "24 implemented agents". Nothing here is a capability claim.
- Stdlib only. If you think you need a package, stop and say why.
- Ask before doing anything outside this file.

## Acceptance

`npm run build:kernel && npm run conform` prints the five scenario steps, the 24 registry rows, the 24 resolved join rows, ends with `5/5 match`, `registry: 24/24 match`, `join: 24/24 match`, and exits 0. Verifiable in under five minutes by anyone with Node and GnuCOBOL.

## Model and context

Sonnet. No sub-agent. Expect under 30 percent of context: the ADRs above are short, `run.js` is 465 lines. Checkpoint after step 3 (translation module loads clean) and after step 5 (pins written) with a commit each. If context passes 60 percent, commit, write a three-line handoff in the final message, and stop.
