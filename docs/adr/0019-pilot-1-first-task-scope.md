# ADR-0019: Pilot 1 first task scope on Gunkustom.com

- Status: **Withdrawn by ADR-0032.** Never ruled. Scoped against a target that is not happening and a stack that ADR-0025 superseded.
- Date: 2026-08-28
- Related: ADR-0008, ADR-0012, ADR-0015
- Blocks: the Pilot 1 task breakdown past step 8

## Context

ADR-0012 fixed the target: Gunkustom.com, a production site Lawrence owns, with known ground truth. The first slice is still open.

The slice has one job: prove that the orchestrator, the gate, and the receipt chain work end to end on a real system. It is not there to prove the framework is smart. The smallest slice that exercises all three beats a larger one that exercises two of them well.

**An unknown blocks the concrete version of this ADR.** The Gunkustom stack is not documented in this repository, and I have not looked at the live site. Hosting, framework, data stores, deploy mechanism, and what an MCP server can reach are all unstated. Everything below is scoped without them. The chosen option needs a stack summary before it becomes a task list.

## Options

**Option A: read-only inventory.**
Chon-Ji (01) enumerates the Gunkustom stack: services, endpoints, data stores, dependencies, deploy path. Se-Jong (23) normalizes it into a canonical inventory schema. Tong-Il (24) synthesizes one inventory document. One gate: the human approves or rejects the inventory as accurate. One receipt.
- Agents used: 3 plus the supervisor
- Writes to Gunkustom: none
- Proves: the graph runs, MCP tools work through Gateway, the gate fires, a receipt is written and chains
- Does not prove: that the gate actually guards a write, because there is no write

**Option B: read-only inventory, then one gated write.**
Option A, then a second run that proposes exactly one low-risk reversible change (a config value, a page of copy, a robots or headers entry), gates it, and applies it through an MCP tool on approval. Two receipts: one for the inventory, one for the write.
- Agents used: 4 or 5
- Writes to Gunkustom: one, reversible, chosen by the human before the run starts
- Proves: everything in A, plus that no execution path bypasses the gate
- Cost: needs an MCP server with write access to something on Gunkustom, which is the piece most likely to be missing

**Option C: business-rule parity slice.**
Dan-Gun (02) and Won-Hyo (04) extract one business rule from the Gunkustom code. Ge-Baek (12) writes a parity test for it. Gate: the human approves the extracted rule as correct. Ground truth is checkable because Lawrence knows the rule.
- Proves: the framework says true things about a real system, which A does not test rigorously
- Does not prove: the write path or the gate as a guard
- Risk: quality of a model's rule extraction is the variable under test, and a poor result muddies whether the orchestrator worked

## Recommendation

**A, then B, as two runs in one pilot.** A gets the whole spine working with zero blast radius. B is a small delta on top and is the run that actually proves the gate is a guard rather than a speed bump. C is the right second pilot task, after the spine is trusted.

Acceptance for the pair:

1. A run completes and its checkpoints are readable from Aurora
2. Exactly one `GateRequest` per proposed control-affecting action, no more, no fewer
3. Every gate decision has a receipt, the chain verifies, and a deliberately corrupted test receipt breaks verification
4. Telemetry is attributable per agent slot and reconciles against the bill within threshold
5. No path exists that reaches a write without a gate, and this is demonstrated by trying

## What needs deciding

1. A, B, or C.
2. If B: which single change, chosen before the run so the target is not the model's pick.
3. The Gunkustom stack summary. Hosting, framework, data stores, deploy path, and what credentials an MCP server may hold. This is the input that turns the choice into a task list.
4. Whether Pilot 1 runs against production Gunkustom directly or against a staging copy first. (Recommendation: Option A against production read-only is fine. Option B's write goes to staging first if staging exists.)
