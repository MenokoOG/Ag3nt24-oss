# Ag3nt24 — copy and content rules

These are not style suggestions. They are hard constraints on every string that ships
in the marketing site, the HADES dashboard, the GitHub org readme, and any error,
empty, or toast message. Treat a violation as a build failure, not a nit.

## Never say

| Banned | Why | Use instead |
| --- | --- | --- |
| "autonomous", "autonomously", "fully autonomous" | The framework's entire premise is that a human authorizes every state change. | "agents propose, a human signs", "human-authorized" |
| "24 implemented agents", "24 agents running", "our 24 agents" | The 24 are definitions and charters. Implemented agents: 0. | "24-member team", "protocol roster", "24 roles, one per ITF pattern" |
| Any mention of degrees, credentials, or academic qualification | Out of scope for public copy. | Describe the domain, not the qualification. |
| "research-only", or any date restriction / expiry / "valid until" | Not a claim this project makes. | Say nothing. |
| Any service offering, engagement, consulting, SOW, or pricing | Nothing is sold, anywhere, on any surface. | Link to the repository. |
| Specific personal or health detail behind the accessibility work | | Exactly "accessibility-first design", nothing more. |
| "Elevate", "Seamless", "Unleash", "Next-Gen", "Revolutionary", "Supercharge" | Copy clichés. | Say the concrete thing. |
| Emoji in UI | | Use a colored dot, a mono tag, or an icon. |

## Always true

- **Status is honest and prominent.** "Nothing in this repository is production capability."
  "Implemented agents: 0." "There is no benchmark." These stay on the public site, above the fold
  of the second screenful, not buried in a footer.
- **The 24 are a designed protocol roster**, one role per ITF Taekwon-Do pattern, Chon-Ji through
  Tong-Il, frozen in `conformance/registry.json`. Slot numbers are zero-padded (`01`…`24`).
- **Two gates, two words.** The *kernel* is the ACL: machine, logs only, never signs.
  The *gate* is the human gate, in HADES, the only thing that writes receipts.
  Copy must never blur them. "Clearing the ACL is never authorization to act."
- **Fail closed.** On uncertainty, missing artifacts, invalid signatures or anomalies: deny.
- **One receipt per decision**, hash-chained. Approve, deny and timeout all write one.
- **No auto-eradication path exists under any condition.**
- **Owner line:** classHuman AI LLC · Legacy AI systems modernization · Apache-2.0 ·
  WDVA Certified Veteran Owned Business #WDVACHAI26. Sign-off, where used: "LAHA: Love All Humans Always."

## Rune numbers

`rune` is a kernel-internal translation of the ITF slot into the v1.0.0 ordering. A rune number is
never a name, never an identity, and must never appear in a receipt, a telemetry tag, a log line, or
any user-facing surface outside the kernel bridge. The site exposes them only behind an explicit
"show kernel rune numbers" toggle on the roster, labelled as kernel-internal.

## Voice

Short declaratives. Concrete nouns. State the constraint, then the reason, then stop.
No metadiscourse ("here's why this matters"), no rhetorical questions, no "not X, but Y" constructions.
The README of the repository is the reference register — match it.
