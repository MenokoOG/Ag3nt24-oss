# ADR-0033: Cedar replaces the COBOL gates as the Anti-Corruption Layer

- Status: **Proposed. Needs a ruling from Lawrence.**
- Date: 2026-09-11
- Deciders: Lawrence Jefferson II
- Supersedes if accepted: ADR-0023 (the COBOL kernel is the ACL)
- Amends if accepted: ADR-0021, ADR-0028, ADR-0029
- Related: ADR-0008, ADR-0015, ADR-0020, ADR-0022, ADR-0026, threat model 01

## Context

The boundary is the product. Every crossing between the inherited estate and the framework passes a gate, and the gate's property is that it cannot be argued with: same input, same verdict, no model call, no I/O. ADR-0023 assigned that job to the four COBOL gates because they already existed, were compiled, deterministic, and carried a conformance suite.

Threat model 01 found fourteen issues in them. Four fail open. `provenance_validate` accepts three static signer strings with no key, one of them a standing bypass named `ARCH-OVERRIDE`. Non-numeric fields coerce to `0` rather than raising. The record is 89 characters and anything longer is silently truncated, which `rune_authorize` already demonstrates by skipping a whole line. `ACTOR-ID` is asserted rather than authenticated, so claiming another pattern's slot is a string edit that the gate will faithfully approve.

Three more issues are structural. The two validation gates report failures with opposite semantics, last-wins in one and first-wins in the other. The differential harness cannot run in CI, because Debian packages GnuCOBOL 3.1.2 and `rune_rotation.cbl` needs 3.2.0, so the only proof that a port matches lives on one developer machine. And the build manifest's executable hashes are not reproducible, so ADR-0021's reproducibility claim is false as written.

The COBOL gates' real value was never that they authorize well. It is that they are deterministic and have a provenance story. That value is available from something built for this job.

## Decision

**Cedar becomes the Anti-Corruption Layer.** One policy engine, one schema, called at every crossing in the system.

Cedar is an open-source authorization language and engine under Apache-2.0, which matches this repository's license and the open-source-only rule. It gives, as engine guarantees rather than as conventions we maintain:

- **Default deny.** A request denies unless an explicit `permit` evaluates true. This is ADR-0008's fail-closed rule enforced by the engine instead of by discipline.
- **Guaranteed termination, effect free.** Policies of bounded size always terminate and have no side effects.
- **No I/O.** The language has no facility for reading files or reaching the network, which is the property ADR-0023 bought the COBOL for.
- **Policy isolation.** One policy's evaluation cannot affect another's.
- **Formal analysis.** The Cedar symbolic compiler is written in Lean and translates policies into SMT formulas, with proven soundness and completeness. Two policy sets can be proven equivalent, and a policy change can be proven not to grant unintended permission.

That last property is the one that changes the argument. Today the gate's correctness rests on five pinned scenarios. Under Cedar it rests on a proof over all possible requests, and every future policy change carries the same proof. A pinned conformance suite says the gate did not change on five inputs. Cedar Analysis says what changed on every input.

### What each COBOL gate becomes

| Gate | Becomes |
|---|---|
| `tenet_gate` | Cedar policies over the five tenets, with every failed tenet reported rather than the last one in source order |
| `provenance_validate` | Split. Signature verification is authentication and moves out of the gate. What remains, lineage and content-hash presence, becomes Cedar policy |
| `rune_authorize` | Cedar policy over the capability the acting pattern holds on the current rotation table |
| `rune_rotation` | Not policy. It stays a pure Python function, ported from the declarations and not the comments, and its output is supplied to Cedar as entity attributes |

### Authentication is separate, and that is the point

Cedar states plainly that it does not authenticate and that the host application must. That separation is the fix for K-9 and K-2 rather than a gap.

Each of the 24 patterns and each scout holds an Ed25519 keypair. The public key lives in the 24-slot registry beside the pattern's slot and domain. A proposal or a scout report is signed by the component that produced it. The API verifies the signature before building the authorization request, and Cedar receives a verified principal rather than a string anyone can write. The three static signer ids and `ARCH-OVERRIDE` do not survive the move.

SPIFFE and SPIRE are the heavier standard for the same problem and stay the upgrade path if workload identity ever has to be provable to an outside auditor. A keypair per pattern is the smaller thing that closes the finding now.

### The COBOL keeps a job, and it is a smaller one

The COBOL stays in `kernel/` as prior art and as the migration oracle. It is not deployed and it is not the reference implementation of anything going forward.

The five carried scenarios and the 24-slot registry join run against Cedar. Where Cedar reproduces the COBOL verdict, that is recorded. Where Cedar deliberately differs, each difference gets one line in this ADR's migration record stating which finding it closes. The expected list of deliberate divergences: a truncating record errors instead of being silently cut, a non-numeric field errors instead of becoming `0`, all failed tenets are reported instead of the last, and an unverified principal denies instead of being accepted as a string.

A divergence that is not on that list and not explained is a port defect and stops the work.

## Consequences

- Four fail-open behaviors close at once: K-2, K-3, K-4 and K-5 from threat model 01. K-9 closes with the signing change that this ADR requires alongside it.
- K-13 closes. Cedar runs anywhere, so the boundary's correctness check runs in CI instead of on one machine.
- K-6 and K-7 close. One reporting semantic, chosen once.
- K-14 becomes moot, since there is no bespoke binary to reproduce.
- **A new runtime dependency enters a stdlib-first project.** Cedar is Rust. The engineering standards require a warning before any new third-party dependency, and this is it. The embedding options are a Rust extension via Python bindings, a WebAssembly build, or the Cedar CLI as a subprocess. The binding choice is deliberately left open and decided in the module that builds it, measured rather than assumed.
- **Policy correctness becomes ours.** Cedar guarantees safe evaluation, not correct policy. It also makes schema accuracy the application's responsibility. Both move work from "the gate is compiled so it is right" to "the policy is proven to say what we meant," which is more honest and more effort.
- **The COBOL story is spent as a differentiator.** The public claim stops being "the gate kernel is compiled COBOL" and becomes "the boundary is a formally analyzable policy engine, default deny, with every policy change proven not to widen access." That is a stronger claim to an enterprise security reviewer and a weaker one as a story. The README and every public description change in the same pull request as this ruling.
- The `ag3nt24_kernel` package and its import-rule boundary from ADR-0029 survive unchanged. The package's insides change; its contract does not.
- Module 1 changes shape. It is no longer a COBOL-to-Python port. It is a Cedar schema, a policy set, the signature verification path, the `rune_rotation` function, and the migration proof against the COBOL.

## Alternatives considered

- **Open Policy Agent with Rego.** The other serious candidate, Apache-2.0, CNCF, far broader ecosystem and more general purpose. Rejected for this specific job because the requirement is a boundary that cannot be tricked and can be proven so. Cedar's analysis story, a Lean-verified symbolic compiler with sound and complete SMT analysis, is the property being bought. Rego is more expressive and correspondingly harder to reason about exhaustively. OPA remains the right answer if the framework later needs general policy well beyond the boundary.
- **Keep the COBOL and fix the findings in the bridge.** Rejected. Every fix sits upstream of the gate, which means the gate is no longer where the decision is made and the determinism argument moves to code with none of the guarantees.
- **Port to Python as ADR-0028 ruled, then harden.** Rejected. It reproduces four fail-open behaviors faithfully in a new language and inherits the obligation to keep reproducing them.
- **Write our own engine.** Rejected on sight. Consume, don't fork.
- **Cerbos, Casbin, OpenFGA, SpiceDB.** Not evaluated in depth. The last two solve relationship-based access at scale, which is a different problem from a deterministic boundary verdict.

## What needs deciding

1. Accept, or keep the COBOL and accept the findings as recorded risk.
2. If accepted, confirm the public claim changes in the same pull request. No description of the framework outlives the thing it describes.
3. The signing change is not optional if this is accepted, because Cedar will not authenticate. Confirm Ed25519 keys in the registry rather than SPIFFE for now.
4. What happens to ADR-0021, ADR-0023 and ADR-0028 as records. The proposal is superseded with a status header, never deleted.
