# ADR-0012: Pilot order is Gunkustom.com, then the mock mainframe stack; defense work is out of scope

- Status: Accepted
- Date: 2026-08-28
- Deciders: Lawrence Jefferson II
- Related: ADR-0019 (Pilot 1 first task scope)

## Context

A modernization framework proves nothing against a toy. It also cannot start against a system where a mistake is somebody else's outage. The two properties needed first are real ground truth and owned blast radius.

## Decision

Pilots run in this order.

**Pilot 1: Gunkustom.com.** A production system Lawrence owns, with known ground truth. Any agent claim about it can be checked against something real. It is production, so the full Production Definition of Done applies. The first slice is read-only; scope is ADR-0019.

**Pilot 2: the mock legacy stack.** A modern business layer in front of a simulated mainframe: Hercules emulator, GnuCOBOL, TN3270. Purpose-built so legacy-interface behavior can be exercised without touching anyone's production mainframe. Pilot 2 is a controlled test rig, exempt from the client-facing DoD gates, and it never gets deployed to a client.

**Deferred: military and defense systems integration.** Explicitly out of scope. No requirement, no design accommodation, no vocabulary from it in the architecture. Reopening it takes an ADR.

Pilot 2 does not start until Pilot 1 has proved the orchestrator and gate pattern end to end.

## Consequences

- Pilot 1 findings are verifiable, which makes the framework's accuracy measurable instead of asserted.
- Pilot 2 gives a legacy interface (TN3270, COBOL copybooks, EBCDIC) that Pilot 1 does not exercise. The framework will not have covered mainframe work until Pilot 2 lands, and no claim otherwise gets made before then.
- Deferring defense removes classification, air-gap, and accreditation constraints from the design. If it returns later, that is a re-architecture, and the ADR that reopens it says so.

## Alternatives considered

- Mock stack first, on the theory that it is safer. Rejected: a simulated system has no independent ground truth, so a wrong answer looks the same as a right one.
- A client system first. Rejected: an unproven framework does not get pointed at someone else's production.
- Both pilots in parallel. Rejected: one person. Sequencing is the constraint, not the preference.
