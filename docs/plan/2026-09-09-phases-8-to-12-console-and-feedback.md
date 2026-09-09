# Phases 8 to 12: the console, the feedback loop, gated governance

Date: 2026-09-09. Status: **Proposed.** Proposed by Rune Onyx from Lawrence Jefferson II's concept note of the same date. Two rulings inside it were made by Lawrence on 2026-09-09 and are recorded below.

Extends `docs/plan/2026-09-09-ag3nt24-hades-plan.md`, which ends at Phase 7, first run. Nothing here is Designed or Done in the ROADMAP sense yet, and nothing here is a capability claim. No dates are promised.

## The two rulings

**Ruled 2026-09-09: the aim, not the word.** The protocol droid is meant to run a long chain of steps without a human in each one. That aim stands and it is what Phases 8 through 11 are for. The banned word stays banned, because the thing being described is already what the two-gate design does: the kernel gates the machine path, and a human signs before state changes. An operator hands a framework their production estate because it cannot act alone, so the constraint is the product rather than a limit on it. Agents propose; humans sign.

**Ruled 2026-09-09: governance changes go through the gate.** Governance is data, a change to it is a proposal, and a proposal takes the ordinary path — gate request, human signature, receipt, then effect. Same path ADR-0027 gives Eradication. This delivers what the concept asked for, which is governance changed on a running system without a redeploy and with an audit trail. What it refuses is any path where a component widens its own permissions. An access-control layer cannot have that hole.

## Where the concept lands

| Concept item | Phase |
|---|---|
| Provider configuration surface (AWS, Google, Azure, Alibaba, local) | 8 |
| Agent ops: prompts and conversations with the 24 | 8 |
| Protocol droid operations surface | 8 |
| Reaches any estate with an agent or ML component attached to an LLM | Its own ADR, **before Phase 5** |
| Telemetry good enough to feed HADES feedback loops | 9 |
| Governance changed without a redeploy | 10 |
| Droid stands up a change-monitoring watch for the operator | 11 |

## Phase 8. The console

`hades` grows the only face a human touches. Three surfaces, one container, one auth boundary.

**Provider configuration.** One screen holding the connection for each model provider the Phase 4 adapter speaks to, plus a local option. The adapter is already model-agnostic by ADR-0025; this is where a human puts a credential and chooses which provider a run uses. Credentials stay in the container and never enter a receipt. The screen shows which provider each of the 24 currently points at and what that costs per run, because Eui-Am (13) owns the budget envelope and a cost nobody can see is a cost nobody controls.

**Agent ops.** Where prompts are written and conversations with the 24 happen, reading and writing the Phase 6 prompt store, every conversation tagged with its ITF slot. A conversation is not an action. The 24 return findings and proposals, and anything that would change state leaves this screen for the gate.

**Droid operations.** The control surface for a run: what the scout found, which of the 24 the droid selected and on what evidence, what each returned, what is waiting at the gate. This is the screen that makes the boundary visible, and it is why Juche (15) has a slot.

## Phase 9. Telemetry and the feedback loop

Phase 6 tags telemetry by ITF slot. That is instrumentation, not a loop. This closes it: per-run traces carrying the evidence hashes `ag3nt24_contracts` already produces, outcome and cost attributed per slot, and the ETL sort's five buckets feeding back into which prompt a slot uses next. Moon-Moo (21) owns what a run leaves behind. Ge-Baek (12) owns whether the loop is measured or merely believed. Metrics are defined before any result is reported.

## Phase 10. Governance as a gated change

Per the ruling above. Governance becomes versioned data with its own schema under Se-Jong (23), a proposed change is a gate request like any other, and the receipt chain records what changed, who signed, and when it took effect. No redeploy, no self-widening. Ul-Ji (20) reviews the change before it reaches the gate.

## Phase 11. Change monitoring

Once an operator has Ag3nt24, the droid can stand up a watch over their estate and report when something material moves: a model deprecated, an API contract changed, a vector store re-indexed, a prompt edited outside the store. Read-only, scheduled, and it proposes rather than acts. Yon-Gae (19) owns the protocol surface it watches. Choi-Yong (18) owns what happens when the watch fires on something bad.

## Phase 12. Production Definition of Done, and publication

Nothing before this is cited as capability. The white paper is written from what the receipts show, not from what the design intended.

## The target criterion needs an ADR before Phase 5

The concept states the scope more sharply than anything currently in this repository: Ag3nt24 is for systems that have an agent or an ML component attached to an LLM, whether that model is a cloud provider's or local. That is a real narrowing, and its value is that it says what Ag3nt24 does not modernize, which is most legacy software.

It should be written down before Phase 5 builds the first scout, because the scout's discovery surface is exactly that criterion made executable. Proposed as an ADR sitting against ADR-0012 and the still-open ADR-0019.

## Not decided here

Console technology, routes, screens, wireframes, phase order, dates. The ROADMAP is not changed by this document; these phases move to Designed when they have decision records.
