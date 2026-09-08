# ADR-0002: 24 domain roles, one per ITF pattern, OT expertise inside Chon-Ji

- Status: Accepted
- Date: 2026-08-28
- Deciders: Lawrence Jefferson II
- Related: ADR-0014 (disposition of the legacy a-24 stubs), ADR-0015 (role roster for patterns 2-24)

## Context

Legacy modernization spans more expert domains than one model call can hold with any accuracy. The work needs named specialists with narrow scopes, so each one gets a small curated context instead of a general prompt trying to be everything at once.

The naming scheme is the 24 ITF Taekwon-Do Chang Hon patterns in syllabus order, Chon-Ji (1) through Tong-Il (24). It gives 24 short, stable, collision-free identifiers that do not drift when a role's responsibilities get refined.

Electrical and OT/SCADA expertise was a candidate for a 25th role.

## Decision

The team is exactly 24 roles. One PhD-level domain role per ITF pattern, indexed 1-24 in syllabus order:

```
01 Chon-Ji      07 Toi-Gye       13 Eui-Am        19 Yon-Gae
02 Dan-Gun      08 Hwa-Rang      14 Choong-Jang   20 Ul-Ji
03 Do-San       09 Choong-Moo    15 Juche         21 Moon-Moo
04 Won-Hyo      10 Kwang-Gae     16 Sam-Il        22 So-San
05 Yul-Gok      11 Po-Eun        17 Yoo-Sin       23 Se-Jong
06 Joong-Gun    12 Ge-Baek       18 Choi-Yong     24 Tong-Il
```

Chon-Ji is Systems Architecture, and electrical / OT-SCADA expertise lives inside that role. There is no 25th agent.

The count is fixed. Adding a role means merging two existing ones, and that merge takes its own ADR.

## Consequences

- The index is a hard constraint. A new domain gets absorbed by the nearest existing role, or it forces a merge somewhere else.
- Chon-Ji carries the widest brief on the team: architecture plus the OT/SCADA protocol surface. ADR-0003 gives it a different agent runtime for that reason.
- Slot numbers are what telemetry, cost attribution, and receipts key on. Renaming a role does not change its slot.
- Pattern 15 is Juche in the current ITF syllabus; schools on the older syllabus use Ko-Dang in that position. Slot 15 is the identifier and the label is cosmetic.
- No claim is made here about implementation. As of this ADR the count of implemented agents is 0. See the as-built block in `docs/architecture/ag3nt24-overview.md`.

## Alternatives considered

- 25 agents with OT/SCADA split out. Rejected: OT discovery and system architecture are one conversation on a modernization job, and splitting them puts a handoff in the middle of a single line of reasoning.
- Generic role names (`architecture-agent`, `security-agent`). Rejected: those get renamed as scope shifts, and every rename breaks a tag, a receipt reference, or a dashboard filter. The pattern names stay stable because they carry no scope claim.
