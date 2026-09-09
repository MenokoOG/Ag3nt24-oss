# ADR-0026: ITF slot order everywhere, with a pinned rune translation in the bridge

- Status: Accepted
- Date: 2026-09-09
- Deciders: Lawrence Jefferson II
- Related: ADR-0002 (ITF order), ADR-0014 (a-24 disposition), ADR-0018 (tagging), ADR-0021 (kernel port), ADR-0023

## Context

The kernel numbers the 24 in the v1.0.0 order (`pattern_id.js`: Eui-Am 1 through Dan-Gun 24). Its rotation tables and `rune_authorize` operate on those numbers. ADR-0002 rules ITF syllabus order (Chon-Ji 1 through Tong-Il 24) and says slot numbers key telemetry, cost attribution, and receipts. The two orders coincide in exactly one slot (Hwa-Rang, 8). Nothing in the repository proved the schemes agree, because they do not.

## Decision

ITF order is the only slot numbering the framework uses. Receipts, telemetry tags, charters, the registry and HADES all carry ITF slots.

The kernel stays byte-identical. A single pinned translation table in the bridge maps ITF slot to rune number before any call to `rune_authorize`, and rune number to ITF slot when a rotation table is read. The table is data, lives in `conformance/registry.json`, and is checked at load time as a bijection.

```
ITF  Pattern       Rune    ITF  Pattern       Rune
01   Chon-Ji       22      13   Eui-Am        01
02   Dan-Gun       24      14   Choong-Jang   10
03   Do-San        05      15   Juche         14
04   Won-Hyo       18      16   Sam-Il        23
05   Yul-Gok       06      17   Yoo-Sin       19
06   Joong-Gun     09      18   Choi-Yong     17
07   Toi-Gye       12      19   Yon-Gae       02
08   Hwa-Rang      08      20   Ul-Ji         03
09   Choong-Moo    21      21   Moon-Moo      15
10   Kwang-Gae     16      22   So-San        13
11   Po-Eun        07      23   Se-Jong       04
12   Ge-Baek       11      24   Tong-Il       20
```

Capability numbers in a rotation table are v1 capability slots and translate through the same table (capability `n` is owned by the pattern in v1 slot `n`).

## Consequences

- Conformance stays `5/5 match`; the five carried scenarios call the kernel with rune numbers and are untouched.
- Phase 2 extends conformance with the translation: 24 slots checked as a bijection, and the day-20260112 rotation table resolved to ITF patterns and pinned.
- A rune number never appears in a receipt, a tag, or a log line outside the kernel bridge. A reviewer who sees one has found a bug.
- The a-24 archive's order remains historical only, as ADR-0014 ruled.

## Alternatives considered

- Renumber the kernel so rune numbers are ITF slots. Rejected: it edits the COBOL, breaks byte-identical conformance and the baseline match against the Linux originals, for no behavioral gain.
- Keep v1 order everywhere. Rejected: it reverses ADR-0002 and the order it would keep was documented in v1.0.0 as the Chang Hon syllabus, which it is not.
