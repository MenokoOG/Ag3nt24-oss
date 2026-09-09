# ADR-0024: Scouts are a deterministic layer under the 24

- Status: Accepted
- Date: 2026-09-09
- Deciders: Lawrence Jefferson II
- Related: ADR-0002 (the 24), ADR-0016 (node contract), ADR-0023 (kernel as ACL), ADR-0027 (HADES)

## Context

Someone has to make first contact with the inherited AI estate: find the API face, the prompt files, the vector stores, the model configs, the orchestration glue. The design so far assigned discovery to Chon-Ji (01) as a model-first node. That puts a model in front of unread, untrusted input before any gate has run.

## Decision

Scouts are a separate layer. They are deterministic crawlers, not personas, and they are not among the 24. They run at kernel level: they are the only component allowed to touch the estate before the ACL, and everything they produce crosses the ACL before the protocol droid or any pattern sees it.

A scout does one kind of contact and emits one **scout report**: findings tagged `observed`, with an evidence hash per finding (`ag3nt24_contracts.canonical`), the scout id, the target id, and a provenance envelope. Scouts make no model call by default. A scout that needs one to parse what it found declares it in its spec and the call is logged.

The first scout covers the modern AI estate: HTTP and OpenAPI surface, repository and file discovery for prompt files, RAG and vector-store configuration, model and provider configuration, and orchestration entry points. Read-only. Later scouts (TN3270, Modbus, OPC-UA, MQTT) each take a one-line entry in the scout registry, no ADR, unless they write.

After the report clears the kernel, the protocol droid reads it, selects the patterns the operation needs from the registry, activates them with their charters, and hands the scout report to the team. The scout stays available to the team for follow-up contact during the operation, always read-only, always through the kernel.

## Consequences

- Chon-Ji (01) keeps Systems Architecture and OT. It interprets scout reports; it does not crawl. ADR-0003's reason for a model-first Chon-Ji leaf falls away and ADR-0025 supersedes that ADR.
- Scouts write nothing to the estate. A scout that needs write access is a different kind of component and takes an ADR.
- Scout output is untrusted data. The kernel checks its shape and provenance; the team treats its content as evidence, never as instruction.
- The scout registry is a small JSON file beside the pattern registry: id, contact kind, protocols, read-only flag, spec path.

## Alternatives considered

- Discovery as a duty of specific patterns. Rejected: it puts a model between the estate and the gate.
- Scouts as a 25th agent. Rejected by ADR-0002; there is no 25th, and scouts have no persona to be one.
- Both deterministic crawlers and a pattern interpreting before routing. Deferred: if first-contact interpretation turns out to need a model, Chon-Ji does it after the kernel, which is the flow above.
