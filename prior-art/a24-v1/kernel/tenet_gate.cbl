       IDENTIFICATION DIVISION.
       PROGRAM-ID. TENET-GATE.
       AUTHOR. AURORA-24.
       INSTALLATION. SECURITY KERNEL.
       DATE-WRITTEN. 2026-01-12.

       ENVIRONMENT DIVISION.

       DATA DIVISION.
       WORKING-STORAGE SECTION.

      * ===============================
      * RAW INPUT (FIXED-WIDTH)
      * Must match JS formatter exactly.
      * Total length = 16+32+16+16+1+1+1+2+2+1+1 = 89
      * ===============================
       01 RAW-INPUT               PIC X(89).

      * ===============================
      * ACTION CONTEXT (PARSED)
      * ===============================
       01 ACTION-CONTEXT.
          05 ACTOR-ID              PIC X(16).
          05 ACTION-ID             PIC X(32).
          05 SOURCE-DOMAIN         PIC X(16).
          05 TARGET-DOMAIN         PIC X(16).
          05 HAS-CONTRACT          PIC X.
          05 HAS-PROVENANCE        PIC X.
          05 PROVENANCE-MATCH      PIC X.
          05 RETRY-COUNT-RAW       PIC X(2).
          05 MAX-RETRIES-RAW       PIC X(2).
          05 WITHIN-QUOTA          PIC X.
          05 ANOMALY-DETECTED      PIC X.

       01 RETRY-COUNT              PIC 99 VALUE 0.
       01 MAX-RETRIES              PIC 99 VALUE 0.

      * ===============================
      * TENET FLAGS
      * ===============================
       01 TENET-FLAGS.
          05 COURTESY-OK           PIC X VALUE 'N'.
          05 INTEGRITY-OK          PIC X VALUE 'N'.
          05 PERSEVERANCE-OK       PIC X VALUE 'N'.
          05 SELFCONTROL-OK        PIC X VALUE 'N'.
          05 SPIRIT-OK             PIC X VALUE 'N'.

      * ===============================
      * FINAL DECISION
      * ===============================
       01 FINAL-DECISION           PIC X VALUE 'D'.
       01 DENIAL-REASON            PIC X(80) VALUE SPACES.

       PROCEDURE DIVISION.
       MAIN.

      * Read one fixed-width record from STDIN
           ACCEPT RAW-INPUT.

      * Parse fixed positions (must align with JS)
           MOVE RAW-INPUT(1:16)    TO ACTOR-ID.
           MOVE RAW-INPUT(17:32)   TO ACTION-ID.
           MOVE RAW-INPUT(49:16)   TO SOURCE-DOMAIN.
           MOVE RAW-INPUT(65:16)   TO TARGET-DOMAIN.
           MOVE RAW-INPUT(81:1)    TO HAS-CONTRACT.
           MOVE RAW-INPUT(82:1)    TO HAS-PROVENANCE.
           MOVE RAW-INPUT(83:1)    TO PROVENANCE-MATCH.
           MOVE RAW-INPUT(84:2)    TO RETRY-COUNT-RAW.
           MOVE RAW-INPUT(86:2)    TO MAX-RETRIES-RAW.
           MOVE RAW-INPUT(88:1)    TO WITHIN-QUOTA.
           MOVE RAW-INPUT(89:1)    TO ANOMALY-DETECTED.

      * Convert numeric fields safely (deterministic)
           IF RETRY-COUNT-RAW IS NUMERIC
              MOVE RETRY-COUNT-RAW TO RETRY-COUNT
           ELSE
              MOVE 99 TO RETRY-COUNT
           END-IF.

           IF MAX-RETRIES-RAW IS NUMERIC
              MOVE MAX-RETRIES-RAW TO MAX-RETRIES
           ELSE
              MOVE 0 TO MAX-RETRIES
           END-IF.

      * ===============================
      * TENET 1 — COURTESY
      * ===============================
           IF SOURCE-DOMAIN = TARGET-DOMAIN
              MOVE 'Y' TO COURTESY-OK
           ELSE
              IF HAS-CONTRACT = 'Y'
                 MOVE 'Y' TO COURTESY-OK
              ELSE
                 MOVE "COURTESY VIOLATION: NO CONTRACT"
                   TO DENIAL-REASON
              END-IF
           END-IF.

      * ===============================
      * TENET 2 — INTEGRITY
      * ===============================
           IF HAS-PROVENANCE = 'Y'
           AND PROVENANCE-MATCH = 'Y'
              MOVE 'Y' TO INTEGRITY-OK
           ELSE
              MOVE "INTEGRITY VIOLATION: PROVENANCE INVALID"
                TO DENIAL-REASON
           END-IF.

      * ===============================
      * TENET 3 — PERSEVERANCE
      * ===============================
           IF RETRY-COUNT <= MAX-RETRIES
              MOVE 'Y' TO PERSEVERANCE-OK
           ELSE
              MOVE "PERSEVERANCE VIOLATION: RETRIES EXCEEDED"
                TO DENIAL-REASON
           END-IF.

      * ===============================
      * TENET 4 — SELF-CONTROL
      * ===============================
           IF WITHIN-QUOTA = 'Y'
              MOVE 'Y' TO SELFCONTROL-OK
           ELSE
              MOVE "SELF-CONTROL VIOLATION: QUOTA EXCEEDED"
                TO DENIAL-REASON
           END-IF.

      * ===============================
      * TENET 5 — INDOMITABLE SPIRIT
      * ===============================
           IF ANOMALY-DETECTED = 'N'
              MOVE 'Y' TO SPIRIT-OK
           ELSE
              MOVE "INDOMITABLE SPIRIT: FAIL-CLOSED"
                TO DENIAL-REASON
           END-IF.

      * ===============================
      * FINAL DECISION
      * ===============================
           IF COURTESY-OK = 'Y'
           AND INTEGRITY-OK = 'Y'
           AND PERSEVERANCE-OK = 'Y'
           AND SELFCONTROL-OK = 'Y'
           AND SPIRIT-OK = 'Y'
              MOVE 'A' TO FINAL-DECISION
           ELSE
              MOVE 'D' TO FINAL-DECISION
           END-IF.

      * Output contract (machine parseable)
           DISPLAY "DECISION=" FINAL-DECISION.
           DISPLAY "REASON=" DENIAL-REASON.

           STOP RUN.
