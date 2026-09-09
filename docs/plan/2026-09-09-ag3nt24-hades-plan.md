# Ag3nt24 + HADES: the build plan

Date: 2026-09-09. Proposed by Rune Onyx. Ruled by Lawrence Jefferson II with ADR-0023 through ADR-0027 and ADR-0015.

## What is ruled

The COBOL kernel is the boundary ACL (ADR-0023). Scouts are a separate, deterministic layer under the 24 (ADR-0024). Docker and a model-agnostic stack replace the AWS AgentCore and LangGraph decisions (ADR-0025). ITF slot order everywhere, translated to rune numbers in the bridge (ADR-0026). HADES is the control room at the boundary (ADR-0027). The 24-role roster is frozen (ADR-0015).

## The system in one screen

```
 legacy AI estate
       |
  [ SCOUTS ]        deterministic crawlers: API face, schemas, prompts, vector stores, glue
       |  scout report (findings, provenance, evidence hashes)
  [ KERNEL ]        tenet_gate + provenance_validate + rune_authorize + rune_rotation
       |  DECISION=A only                          <- the ACL. Machine gate. Logs, no receipts.
  [ AG3NT24 ]       the protocol droid: reads the report, picks the team from the 24, activates it
       |
  [ THE 24 ]        PhD-level pattern agents, ITF order, Chon-Ji 01 ... Tong-Il 24
       |  findings + proposals (never actions)
  [ HADES ]         the control room. Human gate. Prompt store. ETL sort: good | bad | messy | work-data | new.
       |            Telemetry. Legacy-AI channel. One signature, one receipt, then state changes.
  receipt chain     append-only, hash-chained (ag3nt24_contracts.canonical is the hash)
```

Two gates, two words: the kernel is the ACL, HADES holds the gate.

## Containers

Four, one compose file, target under 500 MB total.

`kernel`: Debian slim plus GnuCOBOL, the four gates built at image build from `kernel/*.cbl`, the Node bridges, and a small HTTP shim so the other containers can call it. Conformance runs as the image test.

`core`: Python 3.13. The protocol droid, the 24-slot registry, the scout runners, and one thin model adapter (Anthropic, OpenAI-compatible, local; provider chosen by environment, one request and response shape).

`hades`: Python 3.13, FastAPI. The human gate and receipt writer, the prompt store, the ETL sort, telemetry, the legacy-AI channel. The only container a human touches.

`db`: PostgreSQL. Run state, prompts, telemetry. Receipts in their own schema with a write credential held only by the gate route.

## Phases

Two labels, as in the ROADMAP. Done means it is in this repository with a test or a manifest that shows it. Designed means there is a decision record and no code.

**Phase 0. Rulings. Done 2026-09-09.** ADR-0023 through ADR-0027 accepted, ADR-0015 ruled. Canon updated in the library.

**Phase 1. Kernel port. Done 2026-08-16.** `5/5 match`, ADR-0021.

**Phase 2. Registry and translation.** `conformance/registry.json` with 24 ITF slots: pattern, domain from ADR-0015, and the rune number from ADR-0026. Conformance extended: the five scenarios, then 24 slots checked as a bijection, then the day-20260112 rotation table resolved through the translation and pinned. One `N/N match` line. Node stdlib only. This closes the two earlier Phase 2 definitions (the kernel repository's brief and the previous ROADMAP).

**Phase 3. Kernel container.** Dockerfile, HTTP shim, conformance as the image test, manifest records the platform. `docker compose up kernel` and one request returns `DECISION=A`.

**Phase 4. Protocol droid and model adapter.** Takes a scout report, calls the kernel, selects the team from the registry, activates it with charters, returns findings and proposals as canonical, hashable JSON. First charter: Chon-Ji (01). Adapter proven against two providers.

**Phase 5. First scout.** HTTP and OpenAPI face, repository and file discovery for prompt files, vector-store and model configuration, orchestration entry points. Read-only. Emits the scout report the kernel accepts.

**Phase 6. HADES.** Gate route, receipt chain, prompt store, ETL sort with the five buckets, telemetry tagged by ITF slot, the legacy-AI channel. Eradication takes the ordinary path: gate request, signature, receipt, then execution. No auto path.

**Phase 7. First run.** Gunkustom.com read-only per ADR-0012, Option A of ADR-0019 once that ADR is ruled. Zero writes, one gate, one receipt.

Phases 2 and 3 are one pull request each. Phases 4 through 6 are each several pull requests. No dates are promised and nothing is cited as capability before the Production Definition of Done.

## Model selection

Phase 0: Opus, no sub-agent; long-lived consequences. Phases 2 and 3: Sonnet, mechanical, under 30 percent of context. Phase 4: Opus for the droid and adapter design, Sonnet sub-agents drafting the 24 charters in batches of six from one parameterized manifest. Phases 5 and 6: Sonnet, one Opus review pass per phase. Checkpoint at the end of every phase: conformance green, CHANGELOG line, fresh session for the next phase carrying only the ADRs. Token saving: registry and charters generated from one manifest, never hand-authored 24 times.

## Not on this plan

Ship dates. Capability claims ahead of the code. Anything ended by the 2026-08-15 ruling.
