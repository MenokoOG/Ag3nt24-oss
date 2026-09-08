# a24-v1: the ended v1.0.0 reference

Ag3nt24 v1.0.0 is ended (ruled 2026-08-15). This directory is its carried reference, kept as source.

**Read-only. Never edited.** The conformance gate (`conformance/run.js`) reads `scenarios/` from here and compares every verdict against `conformance/expected.json`. Scenarios A and D step 0 carry a stale rune/capability pair; the correction is applied at load time by the runner, declared in `expected.json`, and announced on every run. The archive itself is not changed. See ADR-0021.

What is here:

- `kernel/` the four COBOL gate sources (`.cbl`). The compiled Linux `.bin` files are not carried; the gates are rebuilt from `../../kernel/`.
- `scenarios/` the five end-to-end scenarios (A = ALLOW, B through E = DENY).
- `bridge/` the original Node bridges. The ported copies in `../../bridge/` differ by one line each, the binary path.
- `tkd-24/` and `agents/` the v1.0.0 pattern registry scaffold and the 24 SOUL stubs. Registered stubs, not implemented agents; 18 of 24 return an unconditional default and the other 6 carry placeholder checks.
- `PATTERN_SOULS.md`, `DOCTRINE_INVARIANTS.md`, `ZERO TRUST SOVEREIGN STANDARD.md` doctrine as carried. The live doctrine copies are in `../../doctrine/`.

Slot order warning: `tkd-24/pattern_id.js` numbers EUI_AM as slot 1 and CHON_JI as slot 22. That order does not apply to Ag3nt24, which uses the ITF syllabus order (ADR-0002). Do not copy a slot number out of this directory.
