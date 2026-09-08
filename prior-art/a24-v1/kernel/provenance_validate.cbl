       IDENTIFICATION DIVISION.
       PROGRAM-ID. PROVENANCE-VALIDATE.
       AUTHOR. AURORA-24.
       INSTALLATION. SECURITY KERNEL.
       DATE-WRITTEN. 2026-01-12.

       ENVIRONMENT DIVISION.

       DATA DIVISION.
       WORKING-STORAGE SECTION.

      * ===============================
      * RAW INPUT (FIXED WIDTH)
      * 16 SIGNER-ID
      * 64 PARENT-HASH
      * 64 CURRENT-SOT-HASH
      * 64 CONTENT-HASH
      * TOTAL = 208
      * ===============================
       01 RAW-INPUT               PIC X(208).

       01 SIGNER-ID               PIC X(16).
       01 PARENT-HASH             PIC X(64).
       01 CURRENT-SOT-HASH        PIC X(64).
       01 CONTENT-HASH            PIC X(64).

      * ===============================
      * AUTHORIZED SIGNERS (STATIC)
      * ===============================
       01 AUTHORIZED-SIGNERS.
          05 AUTH-SIGNER OCCURS 3 TIMES.
             10 AUTH-ID           PIC X(16).

       01 IDX                      PIC 99 VALUE 0.
       01 AUTH-MATCH               PIC X VALUE 'N'.

       01 PROVENANCE-VALID         PIC X VALUE 'N'.
       01 FAILURE-REASON           PIC X(80) VALUE SPACES.

       PROCEDURE DIVISION.
       MAIN.

      * Initialize authorized signer IDs (pad to 16 chars)
           MOVE "DEV-OPERATOR     " TO AUTH-ID(1).
           MOVE "SYSTEM-DAEMON    " TO AUTH-ID(2).
           MOVE "ARCH-OVERRIDE    " TO AUTH-ID(3).

      * Read provenance envelope from STDIN
           ACCEPT RAW-INPUT.

           MOVE RAW-INPUT(1:16)    TO SIGNER-ID.
           MOVE RAW-INPUT(17:64)   TO PARENT-HASH.
           MOVE RAW-INPUT(81:64)   TO CURRENT-SOT-HASH.
           MOVE RAW-INPUT(145:64)  TO CONTENT-HASH.

      * SIGNER AUTHORIZATION
           MOVE 'N' TO AUTH-MATCH.
           PERFORM VARYING IDX FROM 1 BY 1 UNTIL IDX > 3
              IF SIGNER-ID = AUTH-ID(IDX)
                 MOVE 'Y' TO AUTH-MATCH
              END-IF
           END-PERFORM.

           IF AUTH-MATCH NOT = 'Y'
              MOVE "PROVENANCE FAIL: UNAUTHORIZED SIGNER"
                TO FAILURE-REASON
              GO TO OUTPUT-RESULT
           END-IF.

      * LINEAGE VALIDATION
           IF PARENT-HASH NOT = CURRENT-SOT-HASH
              MOVE "PROVENANCE FAIL: LINEAGE MISMATCH"
                TO FAILURE-REASON
              GO TO OUTPUT-RESULT
           END-IF.

      * CONTENT VALIDATION
           IF CONTENT-HASH = SPACES
              MOVE "PROVENANCE FAIL: CONTENT HASH MISSING"
                TO FAILURE-REASON
              GO TO OUTPUT-RESULT
           END-IF.

           MOVE 'Y' TO PROVENANCE-VALID.

      * OUTPUT
       OUTPUT-RESULT.
           IF PROVENANCE-VALID = 'Y'
              DISPLAY "PROVENANCE=VALID"
           ELSE
              DISPLAY "PROVENANCE=INVALID"
              DISPLAY "REASON=" FAILURE-REASON
           END-IF.

           STOP RUN.
