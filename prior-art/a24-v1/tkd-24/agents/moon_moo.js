'use strict';

const BaseAgent = require('./base_agent');
const { PATTERNS } = require('../pattern_id');

const P = PATTERNS.MOON_MOO;

class MoonMooAgent extends BaseAgent {
  static get pattern() { return 'MOON_MOO'; }
  static get capability() { return 'PERIMETER_GUARD'; }
  static get tenet() { return P.tenet; }
  static get duty() { return P.duty; }
  static get failure_mode() { return P.failure_mode; }

  evaluate(context) {
    this.lastContext = context || {};
    const action = this.lastContext.action;
    const isExternal = typeof action === 'string' && action.startsWith('external_');
    const hasSignoff = this.lastContext.evidence
      && typeof this.lastContext.evidence === 'object'
      && Boolean(this.lastContext.evidence.signoff);
    if (isExternal && !hasSignoff) {
      return this.makeVerdict('DENY', 'PERIMETER_UNAUTHORIZED', {
        action,
        signoff_present: hasSignoff
      });
    }
    return this.makeVerdict('ALLOW', 'PHASE_3_STUB_PERIMETER_OK');
  }
}

module.exports = MoonMooAgent;
