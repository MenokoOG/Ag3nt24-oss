// Demo fixtures for the HADES dashboard. These are the placeholder values from
// the design prototype, kept in one place so wiring a real source later means
// replacing this module, not the screens. Shapes follow README section 4.

export type Bucket = "good" | "bad" | "messy" | "work-data" | "new";
export type Decision = "APPROVE" | "DENY" | "TIMEOUT";
export type AclVerdict = "cleared" | "denied";

export type GateRequest = {
  id: string;
  slot: number;
  action: string;
  bucket: Bucket;
  runId: string;
  target: string;
  evidenceHash: string;
  priorReceiptHash: string;
  waiting: string;
  aclVerdict: AclVerdict;
  summary: string;
};

export type Receipt = {
  n: number;
  slot: string;
  action: string;
  decision: Decision;
  evidenceHash: string;
  priorHash: string;
  by: string;
  ts: string;
};

export const RUN_ID = "01JQ8Z4K";
export const OPERATOR = "operator@classhuman.org";
export const CHAIN_HEAD = 1204;

export const BUCKETS: readonly Bucket[] = ["good", "bad", "messy", "work-data", "new"];

export const GATES: readonly GateRequest[] = [
  {
    id: "g1", slot: 3, action: "Eradicate 12,880 records", bucket: "bad", runId: RUN_ID,
    target: "lake://legacy-crm/vectors/v1", evidenceHash: "a41f9c2e8b07d5…", priorReceiptHash: "7d10be44af931c…",
    waiting: "00:41:12", aclVerdict: "cleared",
    summary: "Sandbox pass and security audit are complete. The records are duplicate embeddings from an abandoned RAG v1 index with no downstream reader in either the old system or the new one.",
  },
  {
    id: "g2", slot: 1, action: "Write target schema to staging", bucket: "new", runId: RUN_ID,
    target: "pg://hades/staging.claims_v2", evidenceHash: "0c93ee71fa4802…", priorReceiptHash: "a41f9c2e8b07d5…",
    waiting: "02:07:55", aclVerdict: "cleared",
    summary: "Proposed decomposition of the claims subsystem into three bounded contexts, reconciled by Tong-Il against findings from Dan-Gun and Won-Hyo. Writes staging only; no production table is touched.",
  },
  {
    id: "g3", slot: 19, action: "Open TN3270 session to host LPAR2", bucket: "work-data", runId: RUN_ID,
    target: "tn3270://mainframe.internal:23", evidenceHash: "5be0d1339c7a64…", priorReceiptHash: "0c93ee71fa4802…",
    waiting: "00:12:30", aclVerdict: "denied",
    summary: "The kernel denied this crossing: the provenance record for the session credential is missing. Fail closed. Approval here would be a second authorization path and is not available while the ACL verdict stands.",
  },
];

export type LogLine = { ts: string; level: string; color: string; tag: string; msg: string };

export const LOG: readonly LogLine[] = [
  { ts: "09:41:02", level: "INFO", color: "#39FF14", tag: "a24-03-do-san", msg: "sort complete · good=812440 bad=12880 messy=38910" },
  { ts: "09:41:04", level: "INFO", color: "#39FF14", tag: "a24-23-se-jong", msg: "canonical serializer · 12880 records hashed" },
  { ts: "09:41:09", level: "GATE", color: "#FFD700", tag: "a24-03-do-san", msg: "GateRequest written · run 01JQ8Z4K · state=active" },
  { ts: "09:42:31", level: "INFO", color: "#39FF14", tag: "a24-01-chon-ji", msg: "decomposition proposal v3 emitted" },
  { ts: "09:43:00", level: "KERN", color: "#00CED1", tag: "tenet_gate", msg: "verdict=PASS  checks=33/33" },
  { ts: "09:43:00", level: "KERN", color: "#00CED1", tag: "provenance_validate", msg: "verdict=PASS" },
  { ts: "09:44:17", level: "KERN", color: "#00CED1", tag: "rune_authorize", msg: "slot=19 rune=2 verdict=DENY  reason=provenance_missing" },
  { ts: "09:44:17", level: "WARN", color: "#FF69B4", tag: "a24-19-yon-gae", msg: "crossing refused · fail closed" },
  { ts: "09:45:02", level: "INFO", color: "#39FF14", tag: "a24-21-moon-moo", msg: "span batch flushed · 1,204 spans" },
  { ts: "09:46:40", level: "INFO", color: "#39FF14", tag: "a24-24-tong-il", msg: "synthesis · 3 findings reconciled into 1 proposal" },
  { ts: "09:47:12", level: "RCPT", color: "#9B30FF", tag: "receipt-1204", msg: "chain verified · prev=7d10be44af931c…" },
];

export const RECEIPTS: readonly Receipt[] = [
  { n: 1204, slot: "a24-03-do-san", action: "Sort ruleset v7 accepted", decision: "APPROVE", evidenceHash: "7d10be44af931c…", priorHash: "3f77ac0b21de95…", by: OPERATOR, ts: "2026-09-10T09:47:12Z" },
  { n: 1203, slot: "a24-06-joong-gun", action: "Rotate signing key (deferred)", decision: "DENY", evidenceHash: "3f77ac0b21de95…", priorHash: "c204ba9e6f1730…", by: OPERATOR, ts: "2026-09-10T09:22:40Z" },
  { n: 1202, slot: "a24-14-choong-jang", action: "Cutover rehearsal window", decision: "APPROVE", evidenceHash: "c204ba9e6f1730…", priorHash: "5be0d1339c7a64…", by: OPERATOR, ts: "2026-09-10T08:58:03Z" },
  { n: 1201, slot: "a24-19-yon-gae", action: "Open TN3270 session", decision: "DENY", evidenceHash: "5be0d1339c7a64…", priorHash: "91ee47c0da5b18…", by: OPERATOR, ts: "2026-09-10T08:31:55Z" },
  { n: 1200, slot: "a24-03-do-san", action: "Eradicate 4,102 records", decision: "APPROVE", evidenceHash: "91ee47c0da5b18…", priorHash: "6a08fd3e11c472…", by: OPERATOR, ts: "2026-09-09T17:12:09Z" },
  { n: 1199, slot: "a24-12-ge-baek", action: "Parity harness baseline", decision: "APPROVE", evidenceHash: "6a08fd3e11c472…", priorHash: "b83c15997ea260…", by: OPERATOR, ts: "2026-09-09T16:40:27Z" },
  { n: 1198, slot: "a24-16-sam-il", action: "Data residency exception", decision: "TIMEOUT", evidenceHash: "b83c15997ea260…", priorHash: "2df6c8410b9e37…", by: OPERATOR, ts: "2026-09-09T15:05:00Z" },
  { n: 1197, slot: "a24-01-chon-ji", action: "OT surface read-only sweep", decision: "APPROVE", evidenceHash: "2df6c8410b9e37…", priorHash: "e1a0c47b9f2d66…", by: OPERATOR, ts: "2026-09-09T14:21:48Z" },
];

export const SORT = [
  { name: "good", count: "812,440", pct: 78 },
  { name: "bad", count: "12,880", pct: 9 },
  { name: "messy", count: "38,910", pct: 22 },
  { name: "work-data", count: "104,220", pct: 34 },
  { name: "new", count: "9,006", pct: 6 },
] as const satisfies readonly { name: Bucket; count: string; pct: number }[];

export const STAGES = [
  { name: "Scout contact", note: "Read-only discovery of the inherited estate", state: "running", color: "#39FF14" },
  { name: "Ingest", note: "Fixed-width and copybook decode", state: "running", color: "#39FF14" },
  { name: "Sort", note: "good · bad · messy · work-data · new", state: "review", color: "#FFD700" },
  { name: "Validate", note: "Rule set v7, source-of-truth reconciliation", state: "review", color: "#FFD700" },
  { name: "Transform", note: "Source-to-target mapping", state: "blocked on gate", color: "#FF69B4" },
  { name: "Eradication", note: "Only the bad bucket enters here", state: "gate open", color: "#FF69B4" },
] as const;

export const ERADICATION_STEPS = ["Sandbox", "Security audit", "Gate request", "Human signature", "One receipt", "Execution"] as const;

/** Default staged team for the demo run. */
export const DEFAULT_TEAM: readonly number[] = [1, 3, 23, 24];
