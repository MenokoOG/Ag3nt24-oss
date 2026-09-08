'use strict';

const BaseAgent = require('./base_agent');
const { PATTERNS } = require('../pattern_id');

const P = PATTERNS.TONG_IL;

class TongIlAgent extends BaseAgent {
  static get pattern() { return 'TONG_IL'; }
  static get capability() { return 'CONSENSUS_MERGE'; }
  static get tenet() { return P.tenet; }
  static get duty() { return P.duty; }
  static get failure_mode() { return P.failure_mode; }

  evaluate(context) {
    this.lastContext = context || {};
    const priors = Array.isArray(this.lastContext.prior_verdicts)
      ? this.lastContext.prior_verdicts
      : [];
    const contributing_patterns = priors
      .map(v => (v && v.pattern) ? v.pattern : null)
      .filter(Boolean);
    const facts = { contributing_patterns, prior_count: priors.length };

    if (priors.some(v => v && v.verdict === 'DENY')) {
      return this.makeVerdict('DENY', 'CONSENSUS_DENY', facts);
    }
    if (priors.some(v => v && v.verdict === 'HOLD')) {
      return this.makeVerdict('HOLD', 'CONSENSUS_HOLD', facts);
    }
    return this.makeVerdict('ALLOW', 'CONSENSUS_OK', facts);
  }
}

module.exports = TongIlAgent;
