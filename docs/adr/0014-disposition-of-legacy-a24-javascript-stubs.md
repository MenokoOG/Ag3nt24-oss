# ADR-0014: Disposition of the existing a-24 JavaScript stubs and doctrine

- Status: **Accepted**
- Date: 2026-08-28. Ruled 2026-09-05 by Lawrence Jefferson II.
- Decision: Option C plus B. The a-24 line is ended.
- Unblocks: the first Python commit in this repository, ADR-0015, and the Pilot 1 repository layout

## Context

This repository already has content, and it does not match the Ag3nt24 design in ADR-0002 through ADR-0013. What is here now, on `main` at commit `73db788`:

- `PATTERN_SOULS.md`, 288 lines, status `Accepted`, dated 2026-05-13
- `pattern_id.js`, `pattern_capability.js`
- `agents/` with `base_agent.js`, `index.js`, and 24 role modules

Four concrete conflicts with the new design.

**1. Different concept.** The existing modules are policy gates. Each returns a verdict envelope of `ALLOW | DENY | HOLD | OBSERVE` with a `reason_code` and an `evidence_hash`. Ag3nt24's 24 are domain specialists that produce findings and proposals. Same 24 names, different job.

**2. Different slot order.** `pattern_id.js` numbers `EUI_AM` as slot 1 and `DAN_GUN` as slot 24. ADR-0002 numbers by ITF syllabus order, where Chon-Ji is 1 and Eui-Am is 13. Chon-Ji is slot 22 in the existing file. Both files cannot be right, and slot numbers are what telemetry, cost, and receipts key on.

**3. Different language.** JavaScript here, Python 3.13 in ADR-0010.

**4. Framing.** `PATTERN_SOULS.md` carries family lineage, "SOUL" vocabulary, and defense-kernel framing. Ag3nt24 runs on industry-standard framing only, and defense integration is deferred by ADR-0012.

Two further facts worth having on the table. The doctrine file declares its own as-built status honestly: 18 of 24 modules return an unconditional `PHASE_3_STUB_DEFAULT_ALLOW`, and it says the per-role logic "was never written." And it references files that are not in this repository at all: `kernel/tenet_gate.cbl`, `CITIZENSHIP_CHARTER.md`, `CONTROL_PLANE_AUTHORITY_GRAPH.md`, `DOCTRINE_INVARIANTS.md`. So this repository is a partial extract of a larger a-24 project that lives somewhere else.

## Options

**Option A: delete, start clean.** Remove the JS and the doctrine from the working tree. Git history keeps them. Ag3nt24 is a Python project from its first commit with no dead weight.
*For:* zero ambiguity, no half-live code, no two conflicting slot orders in one repository.
*Against:* the reference is one `git show` away instead of in front of you, and the evidence-hash and verdict-envelope shapes are genuinely worth reading while writing `Receipt`.

**Option B: move to `docs/prior-art/a-24/`, mark the line ended.** Files stay readable, are not built, are not imported, and carry a header saying the a-24 gate line is ended and the slot order in them does not apply.
*For:* keeps the useful shapes visible during implementation of `Receipt` and `AgentSpec`.
*Against:* two slot orders in one tree, which is exactly the kind of thing that gets copied by mistake at 1am.

**Option C: port the concepts forward, drop the code.** Delete or archive the JS, and deliberately lift two things into the Python design: the verdict envelope with `evidence_hash` (it is most of `Receipt` already), and the construct-time validation that binds a role to its declared capability (that is `AgentSpec` validation). Record the lift in ADR-0011 and ADR-0016.
*For:* keeps the real value, which is the design, not the stubs.
*Against:* needs a deliberate read-through now rather than later.

**Option D: separate the products.** a-24 stays its own product in its own repository, and Ag3nt24 gets a new repository. This one keeps the name it has.
*For:* clean separation if a-24 is still a live line of work.
*Against:* needs to know whether a-24 is still active, which only Lawrence can answer.

## Decision

**Option C plus B. The a-24 policy-gate line is ended.** a-24 is not an active product, so Option D does not apply. Ag3nt24 is the successor in this repository, and the repository keeps the name `agent24-protocol-droid`.

Three actions, all taken on 2026-09-05:

1. **The JavaScript and the doctrine moved to `docs/prior-art/a-24/`** with an as-built header stating the line is ended and that its slot order does not apply. Nothing there is built, imported, or cited by any Ag3nt24 document.
2. **`PATTERN_SOULS.md` is superseded** by ADR-0002 and ADR-0015. It is not authoritative for any system, and it moved with the code.
3. **Two concepts were lifted forward** into the Python design rather than ported as code:

   | Lifted from | Lifted into | What carries |
   |---|---|---|
   | `BaseAgent.makeVerdict` in `agents/base_agent.js` | `Receipt` (ADR-0011) | The envelope shape `{ pattern, capability, verdict, reason_code, evidence_hash, contributing_facts, agent_version }`, and specifically **SHA-256 over sorted-key stable JSON**. Deterministic serialization before hashing is what makes a hash reproducible across runs, and therefore what makes a chain verifiable at all. |
   | The `BaseAgent` constructor's capability/pattern check | `AgentSpec` (ADR-0011, ADR-0016) | **Construct-time** rejection of a role whose declared capability belongs to a different role. The error surfaces when the spec is built, not when the node is called. |

   Nothing else carries. The verdict vocabulary (`ALLOW | DENY | HOLD | OBSERVE`) does not: Ag3nt24 nodes produce findings and proposals, and the approve/deny decision belongs to the human gate, not to a node.

## Answers to the open questions

1. **Is a-24 an active product line?** No. Ended.
2. **Is Ag3nt24 the successor in this repository?** Yes.
3. **Does the repository keep its name?** Yes, `agent24-protocol-droid`.
4. **Is `PATTERN_SOULS.md` superseded?** Yes, by ADR-0002 and ADR-0015. It is not authoritative for a different system either.

## Consequences

- The first Python commit is unblocked. ADR-0015 and the Pilot 1 repository layout are unblocked.
- Exactly one slot order is authoritative in this tree: the ITF syllabus order in ADR-0002. The prior-art directory carries an explicit warning that its numbering is wrong for Ag3nt24, because a slot number copied out of it at 1am would silently corrupt telemetry, cost attribution, and receipts.
- `docs/prior-art/a-24/` is excluded from linting, type checking, and packaging when the toolchain lands (P1-10). It is reference text that happens to be valid JavaScript.
- If a-24 is ever revived, it starts from git history or its own repository, not from this directory.

## Recommendation (superseded by the Decision above)

**C plus B**, unless a-24 is still a live product, in which case **D** first.

Do the concept lift now, while writing the contracts package, then move the JavaScript to `docs/prior-art/a-24/` with an as-built header saying the line is ended. `PATTERN_SOULS.md` moves with it and does not get cited by any new document.

## Questions that needed answers before this closed (answered above)

1. Is a-24 still an active product line, or is it ended?
2. Is Ag3nt24 the successor to a-24 in this repository, or a separate product that should get its own repository?
3. If it is the successor: does the repository keep the name `agent24-protocol-droid`?
4. Is `PATTERN_SOULS.md` superseded by ADR-0002 and ADR-0015, or does it stay authoritative for a different system?
