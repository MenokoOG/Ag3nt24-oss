"""Faithful Python port of kernel/rune_rotation.cbl.

The point of this file is one question: can Python reproduce the COBOL gate's
output byte for byte, including its defects?

The defect that matters is declared truncation. LCG-A, LCG-C and LCG-M are
declared PIC 9(9) and given ten-digit VALUEs. COBOL truncates a numeric VALUE
to the PICTURE size, keeping the low-order digits, so the constants the gate
actually runs with are not the ones its comments name:

    LCG-A  VALUE 1103515245  ->  103515245
    LCG-C  VALUE 12345       ->  12345      (fits)
    LCG-M  VALUE 2147483647  ->  147483647

ADR-0021 records exactly this: "the rotation PRNG is not the textbook LCG its
comments describe, and anyone reasoning about rotation from those comments will
be wrong." A port written from the comments produces a different table. A port
written from the declarations reproduces the gate.
"""

TOTAL_RUNES = 24

# PIC 9(9), low-order nine digits of the declared VALUE.
LCG_A = 1103515245 % 10**9   # 103515245
LCG_C = 12345 % 10**9        # 12345
LCG_M = 2147483647 % 10**9   # 147483647

_HEX = {c: v for v, c in enumerate("0123456789abcdef")}
_HEX.update({c: v for v, c in enumerate("0123456789ABCDEF")})


def hex_char_to_val(ch: str) -> int:
    """HEX-CHAR-TO-VAL. Non-hex is 0: fail-soft, still deterministic."""
    return _HEX.get(ch, 0)


def rotate(epoch_day: str, sot_hash64: str) -> list[int]:
    """Return PVAL(1..24): the capability held by each rune, in rune order."""
    # HASH-SUM from the 64 hex characters. PIC 9(9); max is 64*15 = 960.
    hash_sum = sum(hex_char_to_val(c) for c in sot_hash64[:64])

    # RNG-STATE = MOD(EPOCH-DAY + HASH-SUM, LCG-M), non-zero.
    state = (int(epoch_day) + hash_sum) % LCG_M
    if state == 0:
        state = 1

    # Identity permutation [1..24].
    perm = list(range(1, TOTAL_RUNES + 1))  # perm[i-1] is PVAL(i)

    # Fisher-Yates, i from 24 down to 2.
    for i in range(TOTAL_RUNES, 1, -1):
        state = (state * LCG_A + LCG_C) % LCG_M   # NEXT-RAND
        j = (state % i) + 1
        perm[i - 1], perm[j - 1] = perm[j - 1], perm[i - 1]

    return perm


if __name__ == "__main__":
    import hashlib
    import sys

    epoch_day = sys.argv[1] if len(sys.argv) > 1 else "20260112"
    sot = (
        sys.argv[2]
        if len(sys.argv) > 2
        else "c6f56671348c65aa7dff115f4f2749011ebf43a913a0361bb46f039b3bf2cd58"
    )

    perm = rotate(epoch_day, sot)
    lines = [f"{i:02d},{perm[i - 1]:02d}" for i in range(1, TOTAL_RUNES + 1)]
    body = "\n".join(lines) + "\n"
    sig = hashlib.sha256(body.encode("utf-8")).hexdigest()
    sys.stdout.write(body + f"SIG,{sig}\n")
