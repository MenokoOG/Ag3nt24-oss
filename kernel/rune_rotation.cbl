       IDENTIFICATION DIVISION.
       PROGRAM-ID. RUNE-ROTATION.
       AUTHOR. AURORA-24.
       INSTALLATION. SECURITY KERNEL.
       DATE-WRITTEN. 2026-01-12.

       ENVIRONMENT DIVISION.

       DATA DIVISION.
       WORKING-STORAGE SECTION.

      * ===============================
      * CONSTANTS
      * ===============================
       01 TOTAL-RUNES              PIC 99 VALUE 24.

      * ===============================
      * INPUTS (2 LINES VIA STDIN)
      * 1) EPOCH-DAY        PIC 9(8) (YYYYMMDD)
      * 2) SOT-HASH (SEED)  PIC X(64) (hex string)
      * ===============================
       01 EPOCH-DAY                PIC 9(8) VALUE 0.
       01 SOT-HASH                 PIC X(64) VALUE SPACES.

      * ===============================
      * SEED DERIVATION
      * ===============================
       01 HASH-CHAR                PIC X VALUE SPACE.
       01 HASH-SUM                 PIC 9(9) VALUE 0.
       01 HASH-VAL                 PIC 99 VALUE 0.
       01 POS                      PIC 99 VALUE 0.

      * LCG PRNG STATE (31-bit-ish)
       01 RNG-STATE                PIC 9(9) VALUE 1.
       01 RAND-VALUE               PIC 9(9) VALUE 0.

      * LCG constants (classic ANSI C style, bounded by MOD)
       01 LCG-A                    PIC 9(9) VALUE 1103515245.
       01 LCG-C                    PIC 9(9) VALUE 12345.
       01 LCG-M                    PIC 9(9) VALUE 2147483647.

      * ===============================
      * PERMUTATION (1..24)
      * ===============================
       01 PERM.
          05 PVAL OCCURS 24 TIMES PIC 99.

       01 I                        PIC 99 VALUE 0.
       01 J                        PIC 99 VALUE 0.
       01 TEMP                     PIC 99 VALUE 0.
       01 MODBASE                  PIC 99 VALUE 0.

       PROCEDURE DIVISION.
       MAIN.

      * Read inputs
           ACCEPT EPOCH-DAY.
           ACCEPT SOT-HASH.

      * Derive HASH-SUM from SOT-HASH hex characters
           MOVE 0 TO HASH-SUM.
           PERFORM VARYING POS FROM 1 BY 1 UNTIL POS > 64
              MOVE SOT-HASH(POS:1) TO HASH-CHAR
              PERFORM HEX-CHAR-TO-VAL
              ADD HASH-VAL TO HASH-SUM
           END-PERFORM.

      * Seed PRNG state deterministically
      * RNG-STATE = (epochDay + hashSum) mod M; must be non-zero
           COMPUTE RNG-STATE =
              FUNCTION MOD(EPOCH-DAY + HASH-SUM, LCG-M).
           IF RNG-STATE = 0
              MOVE 1 TO RNG-STATE
           END-IF.

      * Initialize permutation with identity [1..24]
           PERFORM VARYING I FROM 1 BY 1 UNTIL I > TOTAL-RUNES
              MOVE I TO PVAL(I)
           END-PERFORM.

      * Fisher–Yates shuffle (deterministic)
      * for i = 24 downto 2:
      *   j = (rand mod i) + 1
           PERFORM VARYING I FROM TOTAL-RUNES BY -1 UNTIL I < 2
              MOVE I TO MODBASE
              PERFORM NEXT-RAND
              COMPUTE J = FUNCTION MOD(RAND-VALUE, MODBASE) + 1
              MOVE PVAL(I) TO TEMP
              MOVE PVAL(J) TO PVAL(I)
              MOVE TEMP   TO PVAL(J)
           END-PERFORM.

      * Output mapping as RUNE=xx,CAPABILITY=yy
           PERFORM VARYING I FROM 1 BY 1 UNTIL I > TOTAL-RUNES
              DISPLAY "RUNE=" I ",CAPABILITY=" PVAL(I)
           END-PERFORM.

           STOP RUN.

      * ===============================
      * PRNG: NEXT-RAND
      * RAND-VALUE becomes next integer derived from RNG-STATE
      * ===============================
       NEXT-RAND.
      * Use modular arithmetic to keep state bounded
      * Note: GnuCOBOL supports FUNCTION MOD for integer arithmetic
           COMPUTE RNG-STATE =
              FUNCTION MOD((RNG-STATE * LCG-A) + LCG-C, LCG-M).
           MOVE RNG-STATE TO RAND-VALUE.
           EXIT PARAGRAPH.

      * ===============================
      * HEX-CHAR-TO-VAL
      * Converts HASH-CHAR (0-9a-fA-F) into HASH-VAL 0..15
      * Non-hex chars treated as 0 (fail-soft; still deterministic)
      * ===============================
       HEX-CHAR-TO-VAL.
           MOVE 0 TO HASH-VAL.
           EVALUATE HASH-CHAR
              WHEN '0' MOVE 0  TO HASH-VAL
              WHEN '1' MOVE 1  TO HASH-VAL
              WHEN '2' MOVE 2  TO HASH-VAL
              WHEN '3' MOVE 3  TO HASH-VAL
              WHEN '4' MOVE 4  TO HASH-VAL
              WHEN '5' MOVE 5  TO HASH-VAL
              WHEN '6' MOVE 6  TO HASH-VAL
              WHEN '7' MOVE 7  TO HASH-VAL
              WHEN '8' MOVE 8  TO HASH-VAL
              WHEN '9' MOVE 9  TO HASH-VAL
              WHEN 'a' MOVE 10 TO HASH-VAL
              WHEN 'b' MOVE 11 TO HASH-VAL
              WHEN 'c' MOVE 12 TO HASH-VAL
              WHEN 'd' MOVE 13 TO HASH-VAL
              WHEN 'e' MOVE 14 TO HASH-VAL
              WHEN 'f' MOVE 15 TO HASH-VAL
              WHEN 'A' MOVE 10 TO HASH-VAL
              WHEN 'B' MOVE 11 TO HASH-VAL
              WHEN 'C' MOVE 12 TO HASH-VAL
              WHEN 'D' MOVE 13 TO HASH-VAL
              WHEN 'E' MOVE 14 TO HASH-VAL
              WHEN 'F' MOVE 15 TO HASH-VAL
              WHEN OTHER
                 MOVE 0 TO HASH-VAL
           END-EVALUATE.
           EXIT PARAGRAPH.