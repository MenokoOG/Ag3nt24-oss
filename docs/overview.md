# Ag3nt24

**Ag3nt24 Droid Protocol Multi-Agent Framework with Anti-Corruption Layer.** A legacy AI systems modernization framework.

Intelligence is flexible. Authority is stable.

classHuman AI LLC · Legacy AI systems modernization · Apache-2.0 · WDVA Certified Veteran Owned Business #WDVACHAI26

---

## Status

Nothing in this repository is production capability.

**Implemented agents: 0.** The 24 are a designed protocol roster with charters, frozen in `conformance/registry.json`. None of them run yet.

**There is no benchmark.** No ship date, no waitlist, no capability claim ahead of the code. What is built and what is designed are labelled separately in [ROADMAP.md](../ROADMAP.md), and the as-built list changes in the same commit as the thing it describes.

The boundary engine is under an open decision, [ADR-0033](adr/0033-cedar-replaces-the-cobol-gates-as-the-boundary-acl.md). The properties below are ruled. The engine that enforces them is being chosen in the open.

## The problem

Between 2021 and 2026 businesses assembled AI systems while the field changed under them. Prompt chains, retrieval pipelines, fine-tuned models, vector stores, orchestration glue, vendor lock-ins. Layers landed on top of layers, written by people who have since left, in tools that have since been deprecated.

The result is a familiar kind of legacy. Nobody inside can establish what the system actually does, so nobody will sign off on replacing it. The project stalls at exactly the point where a signature is required.

Two sources put numbers near this. MIT's NANDA initiative reported in 2025 that roughly 95% of enterprise generative AI pilots produced no measurable return, and attributed most of the gap to learning and integration rather than model quality ([The GenAI Divide: State of AI in Business 2025](https://mlq.ai/media/quarterly_decks/v0.1_State_of_AI_in_Business_2025_Report.pdf)). That figure is widely repeated and worth reading with the report's own method in front of you. A decade earlier, Sculley and colleagues at Google described why these systems rot faster than ordinary software: glue code, configuration debt, undeclared consumers, and entanglement that makes any change ripple ([Hidden Technical Debt in Machine Learning Systems](https://papers.nips.cc/paper/5656-hidden-technical-debt-in-machine-learning-systems.pdf), NeurIPS 2015). The 2015 paper describes the machinery. The 2025 report describes what happens when a lot of it gets built quickly.

Ag3nt24 addresses the signature problem. It establishes what the inherited system does, certifies the data, and rebuilds behind a boundary a human controls.

## How it works

**Scouts make first contact.** Deterministic crawlers, read-only, no persona. They map the API surface, the prompt files, the vector-store and model configuration, and the orchestration entry points. A scout emits one report per contact, with every finding tagged `observed` and carrying an evidence hash. Scouts write nothing to the estate.

**The kernel is the Anti-Corruption Layer.** Every crossing between the inherited estate and the framework passes it, in both directions. Inbound, a scout report is invisible to the rest of the system until its provenance is accepted. Outbound, every proposal is checked against the capability the acting role holds. The kernel is deterministic: the same input returns the same verdict, with no model call and no I/O.

The anti-corruption layer is Eric Evans's pattern from *Domain-Driven Design* (2003), a translation boundary that stops the old model's assumptions leaking into the new one. The incremental replacement behind it follows Martin Fowler's [strangler fig](https://martinfowler.com/bliki/StranglerFigApplication.html) shape. Both are 20-year-old ideas for mainframes and monoliths. They apply cleanly to an AI estate, which is the observation the framework is built on.

**The protocol droid reads the cleared report** and selects the roles the operation needs from the registry. The 24 are organised as an engineering team, one role per ITF Taekwon-Do pattern in syllabus order, Chon-Ji through Tong-Il. The pattern gives each role its discipline, its duty and its failure mode. The registry refuses to load if any pattern lacks a role, any role lacks a pattern, or any capability is claimed twice.

Findings carry provenance: `observed`, `inferred` or `reported`. No confidence scores. A human reviewing a finding can check how the system came to know something. They cannot check `0.87`.

**HADES is where a human signs.** It holds the human gate, the receipt writer, the prompt store, the ETL sort, the telemetry and the channel back to the legacy system. Data sorts into `good`, `bad`, `messy`, `work-data` and `new`. Only `bad` reaches the Human Authorized Data Eradication Sequence, and only after a human signs. No auto-eradication path exists under any condition.

## Two gates, two words

The **kernel** is the ACL. It is a machine. It logs, and it never signs. Clearing the ACL is never authorization to act.

The **gate** is the human gate, in HADES. It is the only thing that writes receipts.

Copy, code and documentation keep those separate. One receipt per decision, hash-chained to its predecessor. Approve, deny and timeout each write one. No role carries ledger-write authority. Verdicts are evidence. Human signatures are authority.

**Fail closed.** On uncertainty, a missing artifact, an invalid signature or a detected anomaly, the answer is deny, with the reason recorded and an escalation to a named person.

## What is built today

The 24-slot registry and its translation table, with a conformance suite that refuses a table which is not a bijection. Four gates that reproduce their pinned verdicts. A contracts package holding the canonical serializer and the evidence hash every finding is measured with.

A threat model for the kernel and its boundaries is published in [docs/security/](security/), written before the build rather than after it. It lists what fails open today. Each finding is either a test, a ruling, or a recorded risk, and it says which.

## Standards this is measured against

Design decisions are recorded as ADRs in [docs/adr/](adr/) and nothing reaches `main` without one where it constrains future work.

The boundary work is scored against published standards rather than house opinion: [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/) for input validation and authorization, [NIST SP 800-218](https://csrc.nist.gov/pubs/sp/800/218/final) for secure development practice, and STRIDE as the threat-modelling method. Workload identity follows [SPIFFE](https://spiffe.io/). The policy-engine decision in ADR-0033 weighs [Cedar](https://www.cedarpolicy.com/), whose evaluator has a Lean-verified symbolic compiler and sound, complete SMT analysis ([paper](https://arxiv.org/abs/2403.04651), [Cedar Analysis](https://aws.amazon.com/blogs/opensource/introducing-cedar-analysis-open-source-tools-for-verifying-authorization-policies/)), against [Open Policy Agent](https://www.openpolicyagent.org/).

Where something already exists and works, it gets used. The framework is the part nobody else has built.

## Licence and contributing

Apache-2.0. Contributions carry a Developer Certificate of Origin sign-off on every commit. No contributor licence agreement. Everything reaches `main` through a pull request, and every pull request keeps the conformance suite green or ships an ADR explaining the change.

Read [CONTRIBUTING.md](../CONTRIBUTING.md) and [SECURITY.md](../SECURITY.md) before opening one.

## Sources

- MIT NANDA, [*The GenAI Divide: State of AI in Business 2025*](https://mlq.ai/media/quarterly_decks/v0.1_State_of_AI_in_Business_2025_Report.pdf)
- D. Sculley et al., [*Hidden Technical Debt in Machine Learning Systems*](https://papers.nips.cc/paper/5656-hidden-technical-debt-in-machine-learning-systems.pdf), NeurIPS 2015
- Eric Evans, *Domain-Driven Design: Tackling Complexity in the Heart of Software*, Addison-Wesley, 2003
- Martin Fowler, [*Strangler Fig Application*](https://martinfowler.com/bliki/StranglerFigApplication.html)
- Cushing et al., [*Cedar: A New Language for Expressive, Fast, Safe, and Analyzable Authorization*](https://arxiv.org/abs/2403.04651), PACMPL/OOPSLA 2024
- AWS Open Source Blog, [*Introducing Cedar Analysis*](https://aws.amazon.com/blogs/opensource/introducing-cedar-analysis-open-source-tools-for-verifying-authorization-policies/)
- [Cedar security guarantees](https://docs.cedarpolicy.com/other/security.html)
- [Open Policy Agent](https://www.openpolicyagent.org/)
- [SPIFFE](https://spiffe.io/)
- [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)
- [NIST SP 800-218, Secure Software Development Framework](https://csrc.nist.gov/pubs/sp/800/218/final)

---

LAHA: Love All Humans Always.
