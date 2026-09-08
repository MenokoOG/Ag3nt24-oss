'use strict';

const crypto = require('crypto');
const { PATTERNS } = require('../pattern_id');
const { CAPABILITIES } = require('../pattern_capability');

const AGENT_VERSION = 'phase-3-stub';
const VALID_VERDICTS = Object.freeze(['ALLOW', 'DENY', 'HOLD', 'OBSERVE']);

// Sorted-key JSON for hash-stable evidence hashing across runs.
function stableStringify(value) {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
  if (typeof value === 'object') {
    const keys = Object.keys(value).sort();
    return '{' + keys.map(k => JSON.stringify(k) + ':' + stableStringify(value[k])).join(',') + '}';
  }
  return JSON.stringify(value);
}

class BaseAgent {
  static get pattern() { throw new Error('BaseAgent.pattern: subclass must override'); }
  static get capability() { throw new Error('BaseAgent.capability: subclass must override'); }
  static get tenet() { throw new Error('BaseAgent.tenet: subclass must override'); }
  static get duty() { throw new Error('BaseAgent.duty: subclass must override'); }
  static get failure_mode() { throw new Error('BaseAgent.failure_mode: subclass must override'); }

  constructor() {
    const pat = this.constructor.pattern;
    const cap = this.constructor.capability;

    if (!PATTERNS[pat]) {
      throw new Error(`Agent pattern "${pat}" is not a doctrine pattern`);
    }
    if (!CAPABILITIES[cap]) {
      throw new Error(`Agent capability "${cap}" is not a doctrine capability`);
    }
    if (CAPABILITIES[cap].owning_pattern !== pat) {
      throw new Error(
        `Agent capability "${cap}" binds to pattern "${CAPABILITIES[cap].owning_pattern}", not "${pat}"`
      );
    }

    this.lastContext = null;
  }

  get pattern() { return this.constructor.pattern; }
  get capability() { return this.constructor.capability; }
  get tenet() { return this.constructor.tenet; }
  get duty() { return this.constructor.duty; }
  get failure_mode() { return this.constructor.failure_mode; }

  hashEvidence(evidence) {
    const payload = evidence == null ? {} : evidence;
    return crypto.createHash('sha256').update(stableStringify(payload), 'utf8').digest('hex');
  }

  makeVerdict(verdict, reason_code, contributing_facts = {}) {
    if (!VALID_VERDICTS.includes(verdict)) {
      throw new Error(`Invalid verdict "${verdict}". Must be one of ${VALID_VERDICTS.join(', ')}`);
    }
    const evidence = this.lastContext ? this.lastContext.evidence : {};
    return {
      pattern: this.pattern,
      capability: this.capability,
      verdict,
      reason_code,
      evidence_hash: this.hashEvidence(evidence),
      contributing_facts,
      agent_version: AGENT_VERSION
    };
  }

  // Default stub: ALLOW for any context. Subclasses with non-trivial duty override.
  evaluate(context) {
    this.lastContext = context || {};
    return this.makeVerdict('ALLOW', 'PHASE_3_STUB_DEFAULT_ALLOW');
  }
}

module.exports = BaseAgent;
module.exports.VALID_VERDICTS = VALID_VERDICTS;
module.exports.AGENT_VERSION = AGENT_VERSION;
