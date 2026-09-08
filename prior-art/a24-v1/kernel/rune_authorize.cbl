       IDENTIFICATION DIVISION.
       PROGRAM-ID. RUNE-AUTHORIZE.
       AUTHOR. AURORA-24.
       INSTALLATION. SECURITY KERNEL.
       DATE-WRITTEN. 2026-01-12.

       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT RUNE-TABLE-FILE ASSIGN TO DYNAMIC TABLE-PATH
               ORGANIZATION IS LINE SEQUENTIAL.

       DATA DIVISION.
       FILE SECTION.
       FD  RUNE-TABLE-FILE.
       01  RUNE-TABLE-LINE         PIC X(10).

       WORKING-STORAGE SECTION.

      * ===============================
      * INPUT (STDIN)
      * RRCC + TABLE PATH (256)
      * ===============================
       01 RAW-INPUT                PIC X(260).
       01 CALLER-RUNE-RAW          PIC X(2).
       01 REQ-CAP-RAW              PIC X(2).
       01 TABLE-PATH               PIC X(256).

       01 CALLER-RUNE              PIC 99 VALUE 0.
       01 REQUESTED-CAPABILITY     PIC 99 VALUE 0.

       01 AUTHORIZED               PIC X VALUE 'N'.

      * Parsing CSV lines: "RR,CC"
       01 LINE-RUNE-RAW            PIC X(2).
       01 LINE-CAP-RAW             PIC X(2).

       01 EOF-FLAG                 PIC X VALUE 'N'.

       PROCEDURE DIVISION.
       MAIN.

      * Read input record from STDIN
           ACCEPT RAW-INPUT.

           MOVE RAW-INPUT(1:2)     TO CALLER-RUNE-RAW.
           MOVE RAW-INPUT(3:2)     TO REQ-CAP-RAW.
           MOVE RAW-INPUT(5:256)   TO TABLE-PATH.

      * Numeric conversion
           IF CALLER-RUNE-RAW IS NUMERIC
              MOVE CALLER-RUNE-RAW TO CALLER-RUNE
           ELSE
              MOVE 0 TO CALLER-RUNE
           END-IF.

           IF REQ-CAP-RAW IS NUMERIC
              MOVE REQ-CAP-RAW TO REQUESTED-CAPABILITY
           ELSE
              MOVE 0 TO REQUESTED-CAPABILITY
           END-IF.

      * Default deny
           MOVE 'N' TO AUTHORIZED.

      * Open and scan the rune table CSV
           OPEN INPUT RUNE-TABLE-FILE.

           PERFORM UNTIL EOF-FLAG = 'Y' OR AUTHORIZED = 'Y'
              READ RUNE-TABLE-FILE
                 AT END
                    MOVE 'Y' TO EOF-FLAG
                 NOT AT END
                    PERFORM PARSE-AND-CHECK
              END-READ
           END-PERFORM.

           CLOSE RUNE-TABLE-FILE.

      * Output
           IF AUTHORIZED = 'Y'
              DISPLAY "AUTHORIZED=Y"
           ELSE
              DISPLAY "AUTHORIZED=N"
           END-IF.

           STOP RUN.

       PARSE-AND-CHECK.

      * Expect: positions 1-2 rune, 3 comma, 4-5 cap
           MOVE RUNE-TABLE-LINE(1:2) TO LINE-RUNE-RAW.
           MOVE RUNE-TABLE-LINE(4:2) TO LINE-CAP-RAW.

           IF LINE-RUNE-RAW IS NUMERIC
           AND LINE-CAP-RAW IS NUMERIC
              IF FUNCTION NUMVAL(LINE-RUNE-RAW) = CALLER-RUNE
              AND FUNCTION NUMVAL(LINE-CAP-RAW) = REQUESTED-CAPABILITY
                 MOVE 'Y' TO AUTHORIZED
              END-IF
           END-IF.

           EXIT PARAGRAPH.
