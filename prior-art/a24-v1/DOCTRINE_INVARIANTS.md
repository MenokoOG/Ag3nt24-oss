# DOCTRINE INVARIANTS — Non-Bypassable Rules
**Version:** 1.0  
**Status:** Canonical  
**Applies To:** Aurora-24, HADES, all agents and citizens

## 1. Core Invariants (MUST HOLD)
1. **Source-of-Truth primacy:** No write to SoT Ledger without validated provenance.
2. **Fail-closed:** On uncertainty, missing artifacts, invalid signatures, or anomalies → deny.
3. **Determinism at the boundary:** Authorization and integrity gates must be reproducible.
4. **Human finalization:** AI citizens cannot finalize high-impact actions.
5. **Auditability:** Every decision must produce a machine-parseable record.
6. **Non-delegable moral authority:** Ethical gates cannot be bypassed by agents or automation.
7. **Rotation + temporal controls:** Authority mappings are time-bound and expire/decay.
8. **Rehabilitation before destruction:** HADES is the default response to falsey agents.
9. **Preservation of lessons:** When decommissioning, preserve knowledge and incident learnings.
10. **No silent override:** Emergency actions must be logged, time-boxed, and reviewed.

## 2. High-Impact Actions (CLA REQUIRED)
Actions requiring Corporate-Level Authority:
- decommissioning an AI citizen or core service
- purging or isolating knowledge stores beyond routine quarantine
- modifying doctrine invariants
- disabling rotation, quorum, delay, decay, or signature verification
- overriding SoT ledger protections
- irreversible production changes affecting public trust

## 3. Outputs (Standardized)
All gates SHALL emit:
- allow/deny
- reason (bounded, explicit)
- evidence pointers (hashes, provenance markers)
- timestamps