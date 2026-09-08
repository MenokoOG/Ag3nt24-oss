'use strict';

const BaseAgent = require('./base_agent');
const { PATTERNS } = require('../pattern_id');

const P = PATTERNS.PO_EUN;

class PoEunAgent extends BaseAgent {
  static get pattern() { return 'PO_EUN'; }
  static get capability() { return 'CONTRACT_COMPLIANCE'; }
  static get tenet() { return P.tenet; }
  static get duty() { return P.duty; }
  static get failure_mode() { return P.failure_mode; }

  evaluate(context) {
    this.lastContext = context || {};
    const evidence = this.lastContext.evidence;
    const hasProvenance = evidence && typeof evidence === 'object' && 'provenance' in evidence;
    if (!hasProvenance) {
      return this.makeVerdict('HOLD', 'PROVENANCE_MISSING');
    }
    return this.makeVerdict('ALLOW', 'PHASE_3_STUB_PROVENANCE_PRESENT');
  }
}

module.exports = PoEunAgent;
