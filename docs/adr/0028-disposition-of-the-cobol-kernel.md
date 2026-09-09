# ADR-0028: Disposition of the COBOL kernel

- Status: **Accepted. Ruled 2026-09-09.**
- Date: 2026-09-09
- Deciders: Lawrence Jefferson II
- Reopens: ADR-0023 (which rejected "retire the kernel and write the ACL in Python" as an alternative)
- Related: ADR-0020 (ACL as a machine gate), ADR-0021 (kernel port), ADR-0025 (Docker), ADR-0026 (slot translation), ADR-0027 (HADES)

## Context

ADR-0023 made the four COBOL gates the Anti-Corruption Layer and rejected a Python rewrite in one line: the deterministic, compiled, no-I/O verdict is what makes the ACL provable, and it already exists with a conformance suite. That was ruled before anyone had tried to ship the kernel anywhere but the machine it was ported on.

Phase 3 tried. The attempt produced evidence in both directions, and the question is worth reopening honestly rather than defending a ruling because it is already written down.

This ADR decides one thing: whether the COBOL stays, and in what role. It does not decide the container, the phases, or anything else.

## What is actually there

Four gates, 500 lines of COBOL total: `tenet_gate` (158), `rune_rotation` (144), `rune_authorize` (103), `provenance_validate` (95). Straight-line boolean logic. No I/O, no clock, no randomness; `rune_rotation` reads its epoch day as input rather than from the system clock.

Around them, 1003 lines of JavaScript bridge, and eleven files in the repository that reference the kernel.

On the development machine: `npm run build:kernel` takes 1.8 seconds, `npm run conform` takes 1.0 second and reports `checks: 81/81`, `scenarios: 5/5`, `registry: 24/24`, `join: 24/24`.

## What the evidence says

### For keeping it

**It works, and it was exercised end to end on 2026-09-09.** Seven live HTTP requests through the Node shim into the compiled gates: a clean action record returned `DECISION=A`; a record with `provenanceMatch: false` returned `INTEGRITY VIOLATION: PROVENANCE INVALID`; a record over the retry ceiling returned `PERSEVERANCE VIOLATION: RETRIES EXCEEDED`; the rotation gate produced the day-20260112 table with its expected signature; an authorization question phrased in ITF slots returned `true` for the correct pairing, `false` for an incorrect one, and `false` again when one byte of the table was altered. No wrong verdict was observed at any point in the session.

**The provenance is real, and it transfers further than first assumed.** ADR-0021 records that the rebuilt `rune_rotation` reproduces the *original Linux binary's* output byte-identically, signature lines included, from the recovered v1.0.0 seed. That is a captured-baseline match against an artifact that no longer runs anywhere.

An earlier draft of this ADR claimed a rewrite could not inherit that lineage. **That was wrong, and the experiment below disproves it.** A port that reproduces the current COBOL byte for byte also reproduces the original Linux binary byte for byte, because the COBOL's output *is* the captured baseline. The lineage survives a rewrite, provided the COBOL is retained as the reference artifact the port is measured against. This materially cheapens Options C and D and the ruling should be made with that correction in view.

**It is auditable in an afternoon.** 500 lines of boolean logic with no dependencies is a thing a skeptical reviewer can read completely. That property is the argument for the ACL existing at all, and it is unusual.

**It is the company thesis demonstrated on itself.** classHuman AI is a research organization for legacy AI systems modernization. Its own boundary is legacy code, carried forward unmodified, with a conformance suite proving the verdicts did not drift. That is either the most credible thing in the repository or an affectation, and which one it is depends on whether it keeps working.

### Against keeping it

**The compiler pin is real and narrow, and that is now demonstrated rather than assumed.** ADR-0021 said a different compiler is a different experiment. On 2026-09-09 CI proved it: Ubuntu's GnuCOBOL 3.1.2 treats `POS` as a reserved word, and `kernel/rune_rotation.cbl` declares `01 POS PIC 99` and drives its hex loop with it. The file does not compile. GnuCOBOL 3.2.0 accepts it, and Debian and Ubuntu do not package 3.2.0. Every Linux target must build the compiler from source or the kernel does not build at all.

**Linux packaging cost four CI rounds and was not finished.** Missing `ca-certificates` in the builder stage, then `libncursesw.so.6` in the runtime stage, each discovered one round at a time. None of it was hard; all of it was friction, and it is friction that recurs on every new deploy target.

**A claim in ADR-0021 is not true as written.** It says the binary is reproducible from the manifest. The compiled `.exe` hashes differ on every rebuild on the same machine with the same compiler, so `kernel/bin/BUILD-MANIFEST.json` goes dirty after every build. The *source* hashes are stable and do match. The reproducibility claim needs narrowing to source, or withdrawing.

**One gate has a functional limit already logged.** ADR-0023 records that `provenance_validate` accepts three fixed signer ids, and that Phase 3 must either map HADES identities onto them in the bridge or take a new ADR to modify the gate with a new conformance baseline. Every future change to gate *behaviour* carries that same cost: edit COBOL, re-derive expectations, re-baseline. The kernel is cheap to run and expensive to change.

**The contributor pool is small.** The repository is open and takes contributors. Very few of them will review COBOL.

## The portability experiment, 2026-09-09

`rune_rotation` is the hardest of the four gates to port, because it is the only one with state, and its state is a PRNG whose declared constants are truncated by their own PICTURE clauses. If it ports faithfully, the other three, which are straight-line boolean logic, are not in doubt.

It ports.

| Implementation | Result against the COBOL |
|---|---|
| Python, arbitrary-precision integers | **byte-identical, 14 of 14 cases** |
| TypeScript, plain `number` | **differs — and silently** |
| TypeScript, `BigInt` | **byte-identical** |

The 14 cases are the two pinned epoch days plus twelve day-and-seed pairs chosen at random, each generated by the compiled COBOL through the same bridge the conformance suite uses and compared byte for byte including the `SIG` line.

Two findings fall out of it, and both matter more than the result itself.

**The port has to be written from the declarations, not the comments.** `LCG-A` is declared `PIC 9(9)` and given `VALUE 1103515245`, ten digits into nine, so the constant the gate actually runs with is `103515245`. `LCG-M` truncates the same way, to `147483647`. The source comment calls this "classic ANSI C style", and a port written from that comment produces a completely different table. ADR-0021 already warned that anyone reasoning about rotation from those comments will be wrong; this is what that costs in practice.

**TypeScript carries a silent-precision hazard that Python does not.** The PRNG computes `state * LCG_A`, which reaches `1.527e16`, above JavaScript's `Number.MAX_SAFE_INTEGER` of `9.007e15`. With ordinary numbers the arithmetic quietly loses precision and the shuffle diverges. The code looks right, runs without error, and returns a wrong authorization table. `BigInt` throughout fixes it. This is exactly the class of defect that a differential conformance harness catches and a code review does not, and it is an argument for keeping the COBOL as the thing the port is measured against, whichever language wins.

## Options

**Option A — Keep the kernel as ADR-0023 ruled.** Nothing changes. Finish the container by fixing the remaining Debian runtime libraries. Accept the from-source compiler build in the image and the rebuild friction on every new target.

**Option B — Keep the kernel, drop the container requirement for it.** The gates run natively wherever the framework runs, as they did in the demonstration above. ADR-0025's four-container set is amended so `kernel` is a process inside `core` rather than its own image. Removes the entire Linux packaging problem and the from-source compiler build. Costs the clean process boundary between the ACL and the runtime that calls it, which was part of why the kernel was given its own container.

**Option C — COBOL becomes the reference implementation; a Python gate becomes the runtime.** Both exist. The conformance suite grows into a differential harness: every scenario runs through both and the run fails if they disagree. Deployment carries only Python. The COBOL stays in the repository as the specification and the audit artifact, still building and still proven on the development machine.
Keeps the lineage, the auditability and the thesis. Removes the deploy friction. Costs two implementations of the same logic and the discipline to keep them in step, which is a real ongoing tax and the option most likely to rot if nobody enforces it.

**Option D — Retire the COBOL. The ACL is Python.** `conformance/expected.json` becomes the specification: every pinned verdict already carries a `why` tracing it to specific lines of the gate, so the rewrite has an unusually good spec to work against. The COBOL moves to `prior-art/` as history.
Removes the compiler pin, the packaging friction, the two-language image, the re-baselining cost, and the contributor barrier. Costs the captured-baseline lineage, the "our own boundary is carried legacy code" story, and roughly a phase of work to reach the parity that already exists today.

## What each option does to work in flight

Phase 2 is merged and unaffected under every option; the 24-slot registry and the ITF translation are the framework's numbering and do not depend on the gates' implementation language.

Phase 3 (`claude/phase-3-kernel-container`, PR #5, draft) is unfinished and is: completed under A; substantially discarded under B; retargeted at the Python gate under C or D, keeping the HTTP shim, which is implementation-agnostic and already written.

## Rune's read, advisory only

Option C, and the portability experiment strengthens rather than weakens that.

Before the experiment the case for C rested on preserving something believed unrepeatable. It is repeatable, so that argument is gone and a better one replaces it: the COBOL is worth keeping because it is the only independent check on the port. The `BigInt` finding is the evidence. A TypeScript gate written by a competent engineer, reviewed by another competent engineer, would have shipped a wrong authorization table, and nothing in the code would have looked wrong. What caught it was running both and comparing bytes. Retire the COBOL and that check is gone, and what remains is a Python or TypeScript gate whose correctness rests on the same reasoning that produced it.

Under Option C the runtime is Python or TypeScript, deployment carries no compiler pin, and the COBOL stays as the reference the harness measures against. If TypeScript wins, `BigInt` is not optional anywhere in the rotation path.

Option D is defensible and would not be a mistake. It should be taken on the grounds that the differential check is not worth the tax of a second implementation, rather than because Phase 3 was frustrating. If it is taken, `conformance/expected.json` and the tables generated before retirement become the specification, and they should be generated and committed *before* the COBOL stops building anywhere.

Option A is the weakest of the four. It accepts the recurring cost without gaining anything the others do not also provide.

## Ruling (2026-09-09)

**Option C.** The gates are rebuilt in Python. Python is the runtime and the only implementation deployed: no compiler pin, no from-source GnuCOBOL, no two-language image, and the Linux packaging problem that stopped Phase 3 disappears.

The COBOL stays in `kernel/` as the reference implementation. It keeps building on the development machine and it keeps its build manifest. It is not deployed and it is not on the runtime path.

`npm run conform` becomes a differential harness. Every scenario and every generated rotation table runs through both implementations and the run fails if they disagree by a single byte. That check is the reason this option was chosen over retiring the COBOL: the portability experiment produced a TypeScript gate that a competent engineer would have shipped and a competent reviewer would have passed, and it returned a wrong authorization table with no error of any kind. Running both and comparing bytes is what caught it. Nothing else would have.

Consequences that follow immediately:

- ADR-0023 stands as to *what* the ACL is and where it sits. Its alternative "retire the kernel and write the ACL in Python" is superseded by this ruling only as to implementation language; the kernel is not retired.
- ADR-0025's four-container set stands, and `kernel` no longer needs GnuCOBOL in its image.
- ADR-0021 keeps its force for the COBOL reference. Its claim that the binary is reproducible from the manifest is still wrong as written and still needs narrowing to source hashes.
- The HTTP shim written in Phase 3 is implementation-agnostic and is retargeted rather than discarded.
- Phase 3 as scoped is substantially superseded. What survives is the shim and the compose file.
- Port from the declarations, never the comments. If any part of the runtime is ever written in TypeScript, `BigInt` is mandatory on the rotation path.
