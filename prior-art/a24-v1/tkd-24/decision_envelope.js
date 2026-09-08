'use strict';

const crypto = require('crypto');

const VERSION = 'A24-DECISION-v1';
const STUB_SIGNATURE = 'PHASE_2_STUB';

function sha256Hex(input) {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

/**
 * @typedef {Object} PatternVerdict
 * @property {string} pattern
 * @property {string} capability
 * @property {string} verdict  ALLOW | DENY | ESCALATE
 * @property {string} reason_code
 * @property {string} evidence_hash
 */

/**
 * @typedef {Object} DecisionEnvelope
 * @property {string} version
 * @property {string} decision_id
 * @property {string} epoch_day
 * @property {string} action_id
 * @property {string} source_domain
 * @property {string} target_domain
 * @property {string} sot_hash
 * @property {string} evidence_hash
 * @property {string} policy_hash
 * @property {string} table_hash
 * @property {string} nonce
 * @property {?string} previous_decision_hash
 * @property {PatternVerdict[]} pattern_verdicts
 * @property {{pattern: string, verdict: string, merged_at: string}} merged_verdict
 * @property {{required: string, approved_by: string[], signatures: any[]}} human_authority
 * @property {{agent_id: string, signed_at: string, signature: string}} principal_agentic_witness
 */

/**
 * @param {Object} [seed]
 * @returns {DecisionEnvelope}
 */
function newEnvelope(seed) {
  const s = seed || {};
  return {
    version: VERSION,
    decision_id: s.decision_id || crypto.randomUUID(),
    epoch_day: s.epoch_day || '1970-01-01',
    action_id: s.action_id || '',
    source_domain: s.source_domain || '',
    target_domain: s.target_domain || '',
    sot_hash: s.sot_hash || '',
    evidence_hash: s.evidence_hash || '',
    policy_hash: s.policy_hash || '',
    table_hash: s.table_hash || '',
    nonce: s.nonce || crypto.randomBytes(16).toString('base64'),
    previous_decision_hash: s.previous_decision_hash === undefined ? null : s.previous_decision_hash,
    pattern_verdicts: Array.isArray(s.pattern_verdicts) ? s.pattern_verdicts.slice() : [],
    merged_verdict: s.merged_verdict || {
      pattern: 'TONG_IL',
      verdict: 'ALLOW',
      merged_at: s.merged_at || new Date(0).toISOString()
    },
    human_authority: s.human_authority || {
      required: 'TWO_OF_TWO',
      approved_by: ['CEO', 'CTO'],
      signatures: [
        { signer: 'CEO', signature: STUB_SIGNATURE },
        { signer: 'CTO', signature: STUB_SIGNATURE }
      ]
    },
    principal_agentic_witness: s.principal_agentic_witness || {
      agent_id: 'principal_agentic',
      signed_at: s.signed_at || new Date(0).toISOString(),
      signature: STUB_SIGNATURE
    }
  };
}

// Stable JSON serializer: sorted keys at every object depth. Produces hash-stable output.
function stableStringify(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    return '[' + value.map(stableStringify).join(',') + ']';
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value).sort();
    return '{' + keys.map(k => JSON.stringify(k) + ':' + stableStringify(value[k])).join(',') + '}';
  }
  return JSON.stringify(value);
}

function canonicalSerialize(env) {
  return Buffer.from(stableStringify(env), 'utf8');
}

function hashEnvelope(env) {
  return sha256Hex(canonicalSerialize(env).toString('utf8'));
}

function validateEnvelopeShape(env) {
  if (!env || typeof env !== 'object') return { ok: false, reason: 'NOT_OBJECT' };
  if (env.version !== VERSION) return { ok: false, reason: 'WRONG_VERSION' };

  const required = [
    'decision_id', 'epoch_day', 'action_id', 'source_domain', 'target_domain',
    'sot_hash', 'evidence_hash', 'policy_hash', 'table_hash', 'nonce',
    'previous_decision_hash',
    'pattern_verdicts', 'merged_verdict', 'human_authority', 'principal_agentic_witness'
  ];
  for (const k of required) {
    if (!(k in env)) return { ok: false, reason: `MISSING_FIELD:${k}` };
  }

  if (!Array.isArray(env.pattern_verdicts)) {
    return { ok: false, reason: 'PATTERN_VERDICTS_NOT_ARRAY' };
  }
  for (const v of env.pattern_verdicts) {
    if (!v || !v.pattern || !v.capability || !v.verdict) {
      return { ok: false, reason: 'PATTERN_VERDICT_SHAPE' };
    }
  }
  if (!env.merged_verdict || !env.merged_verdict.pattern || !env.merged_verdict.verdict) {
    return { ok: false, reason: 'MERGED_VERDICT_SHAPE' };
  }
  if (!env.human_authority || !Array.isArray(env.human_authority.approved_by)) {
    return { ok: false, reason: 'HUMAN_AUTHORITY_SHAPE' };
  }
  if (!env.principal_agentic_witness || !env.principal_agentic_witness.agent_id) {
    return { ok: false, reason: 'WITNESS_SHAPE' };
  }
  return { ok: true, reason: 'OK' };
}

module.exports = {
  VERSION,
  STUB_SIGNATURE,
  newEnvelope,
  canonicalSerialize,
  hashEnvelope,
  validateEnvelopeShape
};
