# Ag3nt24 threat model, version 1

**Date:** 2026-09-11
**Owner:** Lawrence Jefferson II
**Status:** Draft for ruling. Written before module 1 so the findings become tests rather than incidents.

---

## Purpose

Ag3nt24 exists because nobody inside an organization can establish what their inherited AI estate actually does. A framework making that claim has to be able to establish what it does itself. This document states what the framework is defending, who it is defending against, where it can fail, and which failures are closed by a test, by a ruling, or not at all.

Scope is the kernel and every trust boundary around it. The kernel section is deep because module 1 builds it next. Scouts, HADES and the data layer are covered at the level of named risks and open rulings, and each gets its own pass when it is designed.

Nothing here is a claim that the framework is secure. Most of it is not built.

## What is being defended

1. **The integrity of a human decision.** A signature must mean the person saw what they signed. This is the asset. Everything else supports it.
2. **The receipt chain.** If the chain can be rewritten, every past decision becomes unverifiable and the framework's central claim fails.
3. **The client's estate.** Ag3nt24 is pointed at production systems belonging to someone else. An unintended write is their outage.
4. **The client's data.** HADES sorts it, certifies it, and eradicates some of it. Eradication is irreversible.
5. **The determinism of the gates.** Same input, same verdict is the property that makes the boundary provable. Losing it quietly is worse than losing it loudly.

## Adversaries assumed

- **A compromised or hostile estate.** The inherited system contains prompt files, configs and API responses written by someone else, possibly by an attacker who got there first. All of it is untrusted input.
- **A capable model, in or out of the loop.** A frontier model or an agent running on one, either as a component of the framework or as something operating on the estate side. Assumed to be good at producing well-formed, plausible, internally consistent output at volume.
- **A contributor.** The repository is public, Apache-2.0, DCO sign-off, no CLA. Anyone may open a pull request against the kernel.
- **An insider with database access.** Whoever can reach the `db` container directly.
- **Accident.** Historically the most productive adversary in this project. A git GUI on the build machine has already switched branches and destroyed untracked files mid-session.

Explicitly not assumed: a nation-state adversary with physical access. Project Poppy gates are separate and unaffected by this document.

## The load-bearing distinction

The gates verify **form, provenance envelope and authorization**. They do not and cannot verify **truth**.

A scout report with a valid lineage, a present content hash, an accepted signer id and correct field widths passes every gate cleanly, whatever it says. The same is true of a proposal. This is by design, because the human in HADES is the truth check. It is stated here first because most of the findings below are consequences of it, and because a reader who forgets it will over-trust a cleared record.

---

## Findings

Severity is the consequence if the finding is exploited or simply occurs. **Fails open** marks a failure whose default outcome is permissive.

### Kernel and the Anti-Corruption Layer

| ID | Finding | Severity | Closes with |
|---|---|---|---|
| K-1 | Gates verify form, not truth. Fabricated findings in a well-formed record clear every gate. | High | Nothing in the kernel. The human gate is the only truth check, so evidence must be inspectable at the gate (see H-2). |
| K-2 | `provenance_validate` accepts three static signer ids padded to 16: `DEV-OPERATOR`, `SYSTEM-DAEMON`, `ARCH-OVERRIDE`. No key, no signature verification. Anything that can write the string is an authorized signer. **Fails open.** | High | A ruling. ADR-0023 left the mapping of real identities onto these three undecided. |
| K-3 | `ARCH-OVERRIDE` is a standing bypass identity with no expiry, no scope and no second party. | High | A ruling on whether it exists at all in the Python port. |
| K-4 | Non-numeric fields coerce to `0` rather than raising. A zero can read as permissive, for example `RETRY-COUNT` or `ANOMALY-DETECTED`. **Fails open.** | High | The port must reproduce the behavior for conformance and reject malformed fields upstream, in the caller, before the record is built. |
| K-5 | The record is 89 characters and the bridge truncates anything longer. Content past the boundary is dropped, and `rune_authorize` already demonstrates a whole line being silently skipped when it truncates and fails the numeric test. | High | Truncation must be an error at the caller, not a recorded event. A record that would truncate never reaches a gate. |
| K-6 | `tenet_gate` evaluates all five tenets and each failure overwrites `DENIAL-REASON`, so the **last** failure in source order is the one reported. | Medium | Preserve the verdict exactly; surface all failed tenets alongside it at escalation, outside the gate. |
| K-7 | `provenance_validate` uses `GO TO OUTPUT-RESULT`, so the **first** failure wins. Two gates, two opposite reporting semantics. | Medium | Document both in the port's docstrings and test both orderings. A reviewer will otherwise assume one rule. |
| K-8 | `rune_rotation` is seeded from the receipt-chain head hash plus the epoch day and generated on demand. Anyone who can read the chain head can compute today's table and therefore knows which pattern holds which capability. | High | A ruling. Determinism is the property that makes the gate provable and also makes it predictable. Consider a secret component in the seed. |
| K-9 | `ACTOR-ID` is asserted, not authenticated. Nothing cryptographically binds a proposal to the pattern that produced it, so claiming another slot is a string edit and `rune_authorize` will faithfully approve it. | High | A ruling, and the one to make before module 1 rather than after. |
| K-10 | The LCG constants are truncated by their own PICTURE clauses, and the source comments describe the untruncated values. A port that follows the comments silently changes every rotation table and every authorization decision. | High | Port from the declarations. The differential harness catches it, which is the argument for building the harness in the same module as the port. |
| K-11 | A gate that cannot start must be a runtime failure, never a verdict. If the Python port raises where the COBOL returned, or returns where it should raise, a crash becomes an implicit allow or deny. | High | Explicit fail-closed test: every gate, on every internal error, denies and escalates rather than returning a verdict. |
| K-12 | The ACL boundary is an import rule enforced by one test (ADR-0029). A pull request that weakens or deletes that test removes the boundary silently. | High | `CODEOWNERS` on `packages/`, `kernel/` and `conformance/`, plus a required CI job that cannot be edited in the same pull request it guards. |
| K-13 | The differential harness needs GnuCOBOL 3.2.0. CI cannot run it, because 3.1.2 will not compile `rune_rotation.cbl` and Debian does not package 3.2.0. The differential check therefore runs on one developer machine only. | High | A ruling. Options: pin and publish a builder image, vendor a 3.2.0 build, or accept a signed local attestation recorded per release. |
| K-14 | `BUILD-MANIFEST.json` executable hashes are not reproducible on this toolchain, so ADR-0021's claim that the binary is reproducible from the manifest is false as written. Source hashes are stable and do match. | Medium | Narrow or withdraw the claim in ADR-0021. |

### Scouts and the estate boundary

| ID | Finding | Severity | Closes with |
|---|---|---|---|
| S-1 | A scout reads prompt files off the estate. In a compromised estate those are adversarial text. Any path from scout output toward the HADES prompt store is a prompt-injection path into the framework's own prompts. | High | A ruling that estate content never reaches the prompt store, and a test for it. |
| S-2 | Scouts are read-only by rule. The enforcement mechanism is unstated, so read-only is declared rather than proven. | High | Credential scope, not code discipline. A scout holds read-only credentials and cannot hold others. |
| S-3 | A scout may make a model call if it declares one, which puts a model back in front of unread input, the thing ADR-0024 exists to prevent. | Medium | Bound it: parsing only, no tool access, output still tagged `observed`, call logged with its full input. |
| S-4 | An evidence hash proves the scout recorded what it says it recorded. It does not prove the scout recorded faithfully. A compromised scout produces internally consistent lies that hash correctly. | High | Nothing closes this inside the framework. It is the reason scouts are deterministic and small enough to review. |
| S-5 | Read-only is not no-effect. Scanning a live estate writes to its logs, consumes rate limits, and can trip lockouts or alerts. | Medium | Client authorization before first contact, and a documented contact budget per scout. |

### HADES and the human gate

| ID | Finding | Severity | Closes with |
|---|---|---|---|
| H-1 | Human attention is the real bottleneck and therefore the real target. A volume of plausible, well-formed proposals produces rubber-stamping, which defeats the framework without ever failing a gate. | High | A ruling on queue limits: what depth is too deep, what happens when it is exceeded, and whether a queue over threshold halts the run rather than the human. |
| H-2 | The gate is where deception lands. If the summary a human signs against is produced by the same system making the proposal, the human is reviewing the proposer's account of itself. | High | Raw evidence resolvable from the evidence hash, inspectable at the gate, rendered by the control plane and not by the proposing agent. |
| H-3 | The receipt chain is append-only by credential, not by storage. Anyone with direct database access can rewrite history. ADR-0031 would add a background worker running as a superuser role in that same container. | High | A ruling. Options: separate database, write-once storage, or an external anchor for the chain head. |
| H-4 | One operator (ADR-0013) means there is no two-person rule on eradication, the highest-consequence action in the system. | High | A ruling. A second signature is the ordinary control and the project's own staffing rules out having one. |
| H-5 | Signing keys held by a single operator have no recovery path. A lost key makes the chain unverifiable. | High | A key custody and recovery ruling before the first receipt is written, because it cannot be retrofitted onto an existing chain. |
| H-6 | Fail closed escalates to a named person. With one operator, escalation is the same person who will approve the retry. | Medium | Name the condition that stops the run entirely rather than escalating. |

### Data layer

| ID | Finding | Severity | Closes with |
|---|---|---|---|
| D-1 | Eradication is irreversible and a signed-but-wrong eradication is unrecoverable. | High | A hold period and a reversible tombstone before physical deletion, so a signature starts a clock rather than a delete. |
| D-2 | Bucket assignment decides what becomes eligible for eradication. If an agent can label data `bad`, it holds a path toward deletion even though a human signs at the end. | High | A ruling on whether bucket assignment is itself gated, or whether only the eradication step is. |
| D-3 | The `bad` sandbox holds data that is bad by assumption and possibly hostile by intent. Its isolation properties are unstated. | Medium | Isolation requirements written before the sandbox is built. |
| D-4 | `messy` is held indefinitely with no owner and no review trigger, which is unbounded growth and an unowned queue. | Low | A review cadence, or an explicit statement that indefinite hold is intended. |
| D-5 | Client estate data entering the framework carries data rights, retention and the Project Poppy segregation requirement that commercial feedback never flows into defense-side work without written opt-in. | High | Written data rights before the first engagement. This is a legal gate, not an engineering one. |

### Governance and supply chain

| ID | Finding | Severity | Closes with |
|---|---|---|---|
| G-1 | Public repository, DCO, no CLA. Anyone may open a pull request against the kernel and the contracts, which are the highest blast radius in the tree. | High | `CODEOWNERS` on `kernel/`, `packages/`, `conformance/` and `docs/adr/`. |
| G-2 | Conformance expectations are pinned by hand and "never adjust a pinned expectation to make a run pass" is a rule rather than a control. A pull request that edits `expected.json` and a gate together passes CI. | High | Separate ownership of `conformance/expected.json`, and a required review on any diff that touches both. |
| G-3 | ADR-0031 proposes a preview-status Rust extension running as a superuser background worker into the trust base, in the same container as the receipt schema. | Medium | The constraints already written into ADR-0031, plus the H-3 ruling. |
| G-4 | The build machine is part of the trust base and is not hardened. A git GUI on it has already switched branches and permanently destroyed untracked files mid-session. | Medium | Branch check before every commit and push, and no untracked file treated as durable. |
| G-5 | Rulings supersede but documents lag. The architecture overview described a superseded stack for two days after the rulings landed, and someone could have built from it. | Medium | The cascade rule already exists. Enforce it in the pull request that makes the ruling, not afterwards. |
| G-6 | `SECURITY.md` exists and the disclosure process has never been exercised. | Low | One rehearsal before the first external contributor. |
| G-7 | The model provider is in the trust base. One adapter serves any provider, chosen by environment, and agent reasoning is not gated. Only crossings are. A swapped or compromised endpoint changes every agent's behavior without failing a gate. | High | Provider endpoint pinning and a ruling on whether an endpoint change is itself a gated event. |

---

## The failure mode that matters most

Every finding above is secondary to H-1. The kernel cannot be argued with, so a capable adversary does not argue with it. It produces correct, well-formed, plausible work at a volume the single human reviewer cannot sustain, and the signature degrades into a formality. At that point every gate still reports green, every receipt still chains, and the framework's central claim is hollow while all its indicators read healthy.

This is the one failure the architecture cannot detect from inside, because a rubber-stamped approval and a considered one are the same record. Any control has to be structural: a bounded queue, a bounded number of decisions per period, and a run that halts rather than a human who hurries.

## Adversarial cases for the module 1 differential harness

These become tests in the same module that writes the port. Each must produce an identical result in the Python gates and the compiled COBOL.

1. A record whose meaningful content sits past character 89.
2. Every field, individually, filled with non-numeric content, asserting the `0` coercion is reproduced exactly.
3. A `tenet_gate` record failing two, three, four and all five tenets, asserting the last-in-source-order reason each time.
4. A `provenance_validate` record failing all three checks at once, asserting the first-in-source-order reason.
5. Each of the three signer ids, exact and padded, plus near-misses: wrong padding, trailing space, lowercase, one character short, one character long.
6. `rune_authorize` with a rune number claiming a capability it does not hold on a pinned table, and the same claim on an adjacent day.
7. Rotation tables for both pinned epoch days and for a day whose state crosses `Number.MAX_SAFE_INTEGER`, asserting the truncated LCG constants.
8. Every gate forced into an internal error, asserting a runtime failure and never a verdict.
9. The `SIG,` line, asserting it is skipped in both implementations for the same reason.
10. A record that is byte-identical except for one field, asserting the verdict changes where it should and holds where it should not.

## Open rulings this produces

Ordered by what blocks module 1.

1. **K-9.** Is `ACTOR-ID` authenticated or asserted? Blocks the port's interface.
2. **K-2 and K-3.** How do real identities map onto the three signer ids, and does `ARCH-OVERRIDE` survive the port?
3. **K-13.** How is the differential harness trusted when CI cannot run it?
4. **K-5.** Does a truncating record error at the caller, and is that a change in behavior the conformance suite must reflect?
5. **H-3, H-4, H-5.** Receipt chain custody, the two-person question, and key recovery. All three have to be settled before the first receipt exists.
6. **K-8.** Does the rotation seed gain a secret component?
7. **H-1.** Queue limits, and what happens when one is exceeded.
8. **S-1 and S-2.** Estate content never reaching the prompt store, and credential-scoped read-only for scouts.
9. **D-1 and D-2.** Hold period before physical deletion, and whether bucket assignment is gated.
10. **G-1 and G-2.** `CODEOWNERS`, and separate ownership of the pinned expectations.

## Out of scope for version 1

Per-module threat models for the protocol droid, the frontend and the model adapter, written when those are designed. Project Poppy, which has its own gates. Physical and network security of a client's estate, which belongs to the client.

---
LAHA — Love All Humans Always.
