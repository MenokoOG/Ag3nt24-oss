# ADR-0029: One Python backend, a React and Vite frontend, no Node at runtime

- Status: **Accepted. Ruled 2026-09-09.**
- Date: 2026-09-09
- Deciders: Lawrence Jefferson II
- Amends: ADR-0025 (the container set and the two-language kernel image)
- Follows: ADR-0028 (the gates are rebuilt in Python, the COBOL stays as the reference)
- Stands unchanged: ADR-0002, ADR-0008, ADR-0015, ADR-0020, ADR-0023, ADR-0024, ADR-0026, ADR-0027

## Context

ADR-0025 ruled four containers and put Node in one of them, because the kernel bridges were JavaScript and the COBOL gates were spawned as subprocesses. ADR-0028 then ruled the gates are rebuilt in Python. That removes the only reason Node was in the runtime at all.

What is left in JavaScript is the six bridge modules, the HTTP shim and the conformance runner: roughly a thousand lines whose entire job was to marshal fixed-width records into a COBOL subprocess and read the verdict back. When the gate is a Python function, that job does not exist.

Separately, the concept note of 2026-09-09 asks for three operator surfaces: provider configuration, agent operations, and protocol droid operations. Those are a web application, and nothing in the repository has decided what builds one.

## Decision

**The backend is Python 3.13, end to end.** No Node on the runtime path. The bridges, the shim and the Node conformance runner are replaced by Python equivalents.

**The frontend is React with Vite and TypeScript.** It is a client of the backend API and holds no business rules. `BigInt` is mandatory anywhere the frontend touches rotation arithmetic, for the reason ADR-0028 records; the expectation is that it never needs to.

**Node stays as a development dependency only** for the frontend build. It does not appear in a runtime image and nothing the backend does depends on it.

**The container set becomes three, not four.**

- `api` — Python 3.13, FastAPI. HADES, the protocol droid, the scouts, the model adapter, and the kernel gates as an imported package. No GnuCOBOL.
- `web` — the built React bundle, served statically.
- `db` — PostgreSQL. Run state, prompts, telemetry, and receipts in their own schema with a write credential held only by the gate route.

ADR-0025's fourth container existed to isolate a COBOL toolchain. There is no COBOL toolchain in the runtime any more, so there is nothing to isolate.

**The ACL boundary is enforced by an import rule, not a process boundary.** This is the one property the merge costs and it is bought back deliberately. `ag3nt24_kernel` imports nothing from `core` or `hades`, exposes only the four gate functions, and a test asserts it — the same pattern `packages/ag3nt24_contracts/tests/test_dependency_rule.py` already uses. Every crossing of the boundary calls a gate function, and no path around it compiles.

The honest note: a process boundary is a stronger guarantee than an import rule, because an import rule holds only while the test does. It is recorded here so a future reader does not mistake the merge for an oversight. If the boundary ever needs to be provable to an outside auditor rather than to this repository's own test suite, `ag3nt24_kernel` goes back behind its own service, and nothing else has to change to allow that.

**The COBOL keeps its place.** It stays in `kernel/`, still builds with GnuCOBOL 3.2.0 on a development machine, and the differential harness ADR-0028 ruled runs both implementations and fails on a one-byte disagreement. It is a development and audit dependency, never a deployment one.

## Consequences

- The Linux packaging problem that stopped Phase 3 disappears entirely. No from-source compiler, no `libncursesw`, no `ca-certificates`, no compiler pin in any image.
- One language for every reviewer of backend code. The contributor barrier ADR-0028 recorded against COBOL applies to the reference implementation only.
- `ruff`, `mypy --strict` and `pytest` already run in CI and now cover the gates too.
- The existing `ag3nt24_contracts` package is unaffected and stays the only thing `core` and `hades` may both import, as ADR-0010 ruled.
- The build plan of 2026-09-09 is superseded. Phases 3 through 7 assumed a kernel container and a Node bridge; both are gone. A replacement plan is written alongside this ADR.
- Draft PR #5 is substantially superseded. The HTTP shim's route design survives as the API's shape; its implementation does not.
- Two containers instead of four is a smaller thing to run, which serves the concept note's stated aim of something small that a person can actually stand up.

## Alternatives considered

- **Keep Node for the bridges and add Python beside it.** Rejected: it keeps two backend languages to serve a subprocess call that no longer happens.
- **Keep the kernel as its own container, in Python.** Rejected for now, and this is the closest call in this ADR. It preserves the process boundary at the cost of a network hop on every gate call and a second image. The import rule plus its test is judged sufficient while the auditor is this repository. Revisited if that changes.
- **Server-rendered templates instead of React.** Rejected: the concept note describes live operational surfaces with running state, which is what a client application is for.
- **Next.js or another full-stack framework.** Rejected: it would put business logic back on a Node runtime, which is the thing this ADR removes.
