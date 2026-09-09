# ADR-0020: Reconcile the HADES build prompts with the ADR spine

- Status: Accepted. Amended by ADR-0027 (2026-09-09): HADES is the control room, wider than data-only. The ACL and the taxonomy stand.
- Date: 2026-09-05
- Deciders: Lawrence Jefferson II
- Related: ADR-0006, ADR-0008, ADR-0010, ADR-0011, ADR-0012, ADR-0014, ADR-0016
- Unblocks: P1-10, the repository layout and the first Python commit

## Context

Two build plans sit in this repository and they describe different first commits.

**The ADR spine**, ADR-0001 through ADR-0014, accepted 2026-08-28. Python 3.13, two independently deployed services over a shared contracts package (ADR-0010), a LangGraph supervisor over 24 role nodes (ADR-0003), a human gate with hash-chained receipts (ADR-0008), four separate stores (ADR-0006), AgentCore as the deploy target (ADR-0004).

**The HADES build prompts**, `docs/new-files-9-4-2026/ag3nt24-hades-claude-code-prompts.md`, from the 8-31 notebook and added as a reference input on 2026-09-04. A different tree — `/core`, `/acl`, `/hades`, `/roles`, `/datalake`, `/legacy-droid-knowledge` — and a different vocabulary: a Talk to Protocol to Droid to Report pipeline, an Anti-Corruption Layer as a boundary gate, HADES loop sizing with a Human Authorized Data Eradication Sequence, and a five-way Data Lake sort taxonomy.

The CHANGELOG entry for those files says they are inputs only and change no accepted ADR. That is true as far as it goes, and it leaves the actual question unanswered: the repository is named `agent24-protocol-droid`, which is the prompts' vocabulary and not the ADRs', and P1-10 cannot be scaffolded until one layout wins.

They are not rival designs. Read carefully, most of the prompt document names real subsystems the ADRs never covered, in words drawn from a different level of the same system. Two places genuinely collide, and both collisions are about gates.

## Decision

**The ADR spine is the architecture. The HADES prompts contribute three named subsystems and one vocabulary mapping.** Neither document is discarded, and the prompt document stops being a competing build sequence: from this ADR forward it is superseded as a sequence and survives only as the source of the subsystem definitions below.

### 1. Talk, Protocol, Droid, Report is vocabulary, not a second pipeline

It maps onto the run flow already in `docs/architecture/ag3nt24-overview.md` with nothing left over. It is not built as a separate set of stages, and no package is named for it.

| Prompt stage | Ag3nt24 mechanism |
|---|---|
| Talk | Run intake: a task, a pilot target, and a budget, arriving through the control plane |
| Protocol | The supervisor's routing plus the node interface contract every role implements (ADR-0016) |
| Droid | One role node, an `AgentSpec` bound to a charter and a tool allowlist |
| Report | Findings and proposals, reconciled cross-domain by Tong-Il (24) into one gate-ready proposal |

This mapping is why the repository keeps its name. `agent24-protocol-droid` describes the run flow honestly; it does not obligate a package layout.

### 2. The ACL is a second gate, and it does not touch the first one

The prompts describe the Anti-Corruption Layer as a deterministic go/no-go on any data or report crossing out of the core pipeline. ADR-0008 describes a human gate on any control-affecting action. **These are different gates on different things and both exist.**

- **The ACL is machine, deterministic, and about data shape and provenance.** It is a rules engine. No model call. It runs on data crossing into HADES and the Data Lake, and it rejects with a structured logged reason.
- **The human gate is a person, and it is about authority.** It fires on control-affecting actions and only a person clears it.

Ordering: the ACL runs first and is upstream. Clearing the ACL is never authorization to act. A proposal that passes the ACL still stops at the human gate.

**ACL decisions do not write `Receipt`s.** The receipt chain records human decisions (ADR-0008). Filling it with machine validation verdicts would bury the signatures the chain exists to protect under noise, and would make chain verification a throughput problem. ACL decisions go to structured logs at the boundary, which is Definition of Done gate 3, not gate 5.

This also settles the prompt document's "gate cannot be bypassed" line: it applies to both gates, and the bypass test for the human gate is already P1-35.

### 3. The eradication ledger is the receipt chain, not a second chain

Prompt 3 asks for eradication logged to an append-only ledger. **That ledger is the ADR-0008 receipt chain.** No second append-only store is built.

Data eradication is the most control-affecting action in the system, so it takes the ordinary path and gets no special one: sandbox, security audit, `GateRequest`, a human signature, one `Receipt`, then execution. The name is already explicit that the human is the authority — Human Authorized Data Eradication Sequence — and the mechanism that makes that true is the gate that already exists.

There is no auto-eradication path and no default-approve stub, under any condition.

### 4. HADES is data-only, and the Data Lake is not a fifth Ag3nt24 store

HADES covers two things and nothing else: Data Lake sizing and governance, and the Human Authorized Data Eradication Sequence.

ADR-0006's four stores are **Ag3nt24's own state** — charters, graph state, vectors, receipts. A client's Data Lake is a **target system**: HADES sizes and governs it, and Ag3nt24 does not keep its own state there. ADR-0006 is unchanged and still says four.

The `/legacy-droid-knowledge` corpus is likewise not new storage. It is the vector and RAG concern that ADR-0006 already assigns to Bedrock Knowledge Bases over S3 Vectors, one namespace per role.

The five-way sort taxonomy — `good | bad | messy | work-data | new` — is accepted as the Data Lake governance vocabulary, with `bad` as the only input to the eradication sequence and therefore the only path that reaches the human gate.

### 5. Layout

One repository, one `packages/` root, each package a single responsibility and importable by name. The two services of ADR-0010 stay independently deployable; a shared repository is not a shared deployment.

```
packages/
  ag3nt24_contracts/    the four Pydantic models (ADR-0011), depends on nothing
  ag3nt24_runtime/      LangGraph supervisor, node adapter, the 24 role nodes
  ag3nt24_control/      FastAPI control plane: gates, receipts, runs
  ag3nt24_acl/          the boundary gate, deterministic rules engine
  ag3nt24_hades/        loop sizing and the Human Authorized Data Eradication Sequence
  ag3nt24_datalake/     the five-way sort taxonomy
```

Dependency rule, enforced in CI: every package may import `ag3nt24_contracts`; `ag3nt24_contracts` imports none of them; `ag3nt24_control` and `ag3nt24_runtime` never import each other.

### 6. What Pilot 1 actually builds

**`ag3nt24_acl`, `ag3nt24_hades`, and `ag3nt24_datalake` are not created as directories yet.** This ADR fixes where they go and what they are; it does not authorize scaffolding them empty. Engineering standards are explicit that a repository versions something real and that setup is not progress, and Pilot 1 is a read-only inventory of a website (ADR-0012, ADR-0019) with no Data Lake in it at all.

Pilot 1 creates `ag3nt24_contracts`, then `ag3nt24_runtime`, then `ag3nt24_control`, in that order, each when its task in the Pilot 1 breakdown comes up. The other three arrive with their first real code, against a pilot that has data in it.

## Consequences

- P1-10 is unblocked and its scope is small: toolchain, one package, CI, and the dependency rule.
- The HADES prompt document is superseded as a build sequence. Its Prompt 0 scaffold is not executed. Its subsystem definitions survive here, and a superseded header goes on the file so it is not picked up as a task list at 1am.
- Its model-routing table and its per-module context budgeting are working practice rather than architecture, and are unaffected.
- Two gates now exist in the vocabulary and they will be confused if the words are loose. Standing usage: **the gate** always means the human gate. The other is always **the ACL**.
- Three packages named here have no code. If Pilot 2 does not need them, this ADR gets revisited rather than the directories getting created to make the diagram true.

## Alternatives considered

- **Execute the HADES prompt sequence as written.** Rejected: it starts by scaffolding six directories of which Pilot 1 uses at most two, and it has no receipt chain, no checkpointer, and no control plane, which are the three things Pilot 1 exists to prove.
- **Treat the prompt document as input only and change nothing.** Rejected: that was the 2026-09-04 position, and it left the ACL, HADES, and the sort taxonomy with no home in the architecture while the repository name pointed at a pipeline no document described.
- **Split HADES into its own repository.** Rejected for now: it shares the contracts package and the receipt chain, and a second repository buys separation that the deployment boundary already provides. Revisit if HADES gets consumers outside Ag3nt24.
- **Let ACL decisions write receipts too.** Rejected: it makes the audit chain mostly machine noise and turns verification into a throughput problem. Structured logs at the boundary cover it.
