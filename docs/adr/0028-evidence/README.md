# Evidence for ADR-0028

Not adopted code. Nothing in this directory is imported, built, or run by the
framework. It exists so the portability claim in ADR-0028 can be checked by
anyone rather than taken on trust, and it should be deleted or promoted when
ADR-0028 is ruled.

## What it shows

`rune_rotation` is the hardest of the four gates to port: the only one with
state, and its state is a PRNG whose declared constants are truncated by their
own PICTURE clauses.

- `rotation_port.py` — a Python port. Byte-identical to the compiled COBOL on
  the two pinned epoch days and twelve random day/seed pairs, `SIG` line
  included.
- `rotation_port.mjs` — the same algorithm in JavaScript twice, once with
  ordinary numbers and once with `BigInt`. The `BigInt` version matches the
  COBOL. **The ordinary-number version does not, and fails silently.**

## Reproducing it

The COBOL side comes from the compiled gate through the same writer the
conformance suite uses:

```
npm run build:kernel
node -e "const{writeRuneTable}=require('./bridge/rune_table_writer');writeRuneTable({epochDayYYYYMMDD:'20260112',sotHash64:'c6f56671348c65aa7dff115f4f2749011ebf43a913a0361bb46f039b3bf2cd58'})"
python docs/adr/0028-evidence/rotation_port.py 20260112
node docs/adr/0028-evidence/rotation_port.mjs 20260112 c6f56671348c65aa7dff115f4f2749011ebf43a913a0361bb46f039b3bf2cd58
```

Compare against `out/rune_table_20260112.csv`.

## The two traps

**Write the port from the declarations, not the comments.** `LCG-A` is declared
`PIC 9(9)` and given `VALUE 1103515245` — ten digits into nine — so the constant
the gate runs with is `103515245`, and `LCG-M` truncates to `147483647`. The
source comment calls it "classic ANSI C style". A port written from that comment
produces a completely different table.

**JavaScript needs `BigInt`.** The PRNG computes `state * LCG_A`, which reaches
`1.527e16`, above `Number.MAX_SAFE_INTEGER` (`9.007e15`). With ordinary numbers
the arithmetic loses precision and the shuffle diverges. The code looks correct,
throws nothing, and returns a wrong authorization table.
