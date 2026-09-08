# ADR-0015: Domain-role roster for patterns 2 through 24

- Status: **Open. Needs a ruling from Lawrence**
- Date: 2026-08-28
- Related: ADR-0002 (fixes the count and the index), ADR-0014
- Blocks: charter authoring, ADR-0016, ADR-0019

## Context

ADR-0002 fixes the structure: 24 roles, ITF syllabus order, Chon-Ji (01) is Systems Architecture with OT/SCADA inside it. The other 23 domains are not assigned.

The roster is not cosmetic. It determines which specialist is in the room for a modernization job, what each charter says, which MCP tools each role is allowed to touch, and which vector namespace each one reads. Getting it wrong shows up as two roles arguing over the same finding, or a whole domain with nobody accountable for it.

Constraints that apply: no personal or business philosophy in role definitions, industry-standard domain naming only, and every role has to earn its slot on legacy modernization work specifically.

## Proposed roster

| # | Pattern | Domain role | Primary accountability |
|---|---|---|---|
| 01 | Chon-Ji | Systems Architecture (incl. electrical / OT-SCADA) | Target architecture, system decomposition, OT and control-system surface. **Decided, ADR-0002** |
| 02 | Dan-Gun | Legacy Code Archaeology | Reading COBOL, PL/I, RPG, assembler; recovering intent from undocumented code |
| 03 | Do-San | Data Engineering and Migration | Copybook and EBCDIC decoding, ETL, source-to-target mapping, reconciliation |
| 04 | Won-Hyo | Requirements and Domain Modeling | Business-rule extraction, bounded contexts, ubiquitous language |
| 05 | Yul-Gok | Formal Methods and Verification | Invariants, equivalence arguments between old and new behavior |
| 06 | Joong-Gun | Security Engineering | Threat modeling, application security, secrets and credential handling |
| 07 | Toi-Gye | Knowledge Management | Corpus curation, documentation systems, per-role RAG namespace hygiene |
| 08 | Hwa-Rang | Program and Delivery Coordination | Sequencing, dependency management, preventing duplicated agent work |
| 09 | Choong-Moo | Reliability Engineering | Failure modes, degraded operation, error budgets |
| 10 | Kwang-Gae | Cloud Platform and Infrastructure | AWS, infrastructure as code, networking, AgentCore surface |
| 11 | Po-Eun | Interface and Contract Governance | API contracts, SLAs, provenance, compatibility rules |
| 12 | Ge-Baek | Test Engineering | Test strategy, parity harnesses, coverage of the change under review |
| 13 | Eui-Am | Cost Engineering and FinOps | Budget envelope, unit economics, per-run cost ceilings |
| 14 | Choong-Jang | Release Engineering and Change Control | CI/CD, cutover planning, rollback mechanics |
| 15 | Juche | Human Factors and Operator Experience | Operator workflows, accessibility, gate ergonomics |
| 16 | Sam-Il | Regulatory and Compliance | Sector rules, IEC 62443, NERC CIP, SOC 2, data residency |
| 17 | Yoo-Sin | Performance Engineering | Capacity, latency budgets, benchmarking old against new |
| 18 | Choi-Yong | Incident Response and Forensics | Containment, evidence handling, post-incident analysis |
| 19 | Yon-Gae | Network and Protocol Engineering | TN3270, Modbus, OPC-UA, MQTT transport behavior and failure modes |
| 20 | Ul-Ji | Adversarial Testing | Red-team review of proposals and of the framework itself |
| 21 | Moon-Moo | Observability and Telemetry | Instrumentation, tracing, what a run leaves behind |
| 22 | So-San | Business Continuity and Disaster Recovery | Backup, restore, continuity during cutover |
| 23 | Se-Jong | Data Standards and Canonical Schema | Canonical formats, field naming, serialization, hash input |
| 24 | Tong-Il | Integration and Synthesis | Reconciling cross-domain findings into one proposal for the gate |

## Notes on the proposal

About half of these keep the spirit of the duty the same name carried in the prior a-24 doctrine (ADR-0014). Se-Jong stays canonical schema. Tong-Il stays synthesis. So-San stays recovery. Toi-Gye stays knowledge custody. Eui-Am stays resource and budget. Ul-Ji stays adversarial. That continuity is convenient, and it is not a requirement.

The biggest deliberate divergence is **Yon-Gae**, which was "overwhelming defensive force" in the old doctrine and is Network and Protocol Engineering here. Reason: three security roles (Joong-Gun, Ul-Ji, Yon-Gae) is one too many for a modernization team, and TN3270 plus the OT protocol stack needs an owner who is not Chon-Ji.

Slots worth a second look before ruling:

- **05 Yul-Gok, Formal Methods.** Real value on equivalence between a COBOL rule and its replacement, and the hardest role to staff with a useful prompt. Candidate for merging into 12 Ge-Baek if it underperforms in Pilot 2.
- **15 Juche, Human Factors.** Earns its slot only because the gate is a human interface and a bad gate UI is a safety problem. If the dashboard stays thin, this slot is the first merge candidate.
- **19 Yon-Gae vs 01 Chon-Ji.** The boundary between "OT surface" and "protocol behavior" needs one sentence in each charter or these two will overlap.

## Options

**Option A: accept the roster above as proposed.**
**Option B: accept the structure, change specific assignments.** Name which slots move and to what.
**Option C: derive the roster from Pilot 1 instead.** Assign only the roles Pilot 1 actually needs (likely 01, 02, 03, 23, 24 plus the gate), and fill the rest from observed gaps.

## Recommendation

**Option C for charter authoring, Option A for the index.** Freeze all 24 names and slot numbers now, because tags, cost attribution, and receipts depend on them. Write charters only for the roles Pilot 1 uses. An unimplemented role with no charter is honest; a charter written for a role nobody has exercised is fiction.
