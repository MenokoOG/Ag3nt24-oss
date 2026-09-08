'use strict';

const BaseAgent = require('./base_agent');
const { PATTERNS } = require('../pattern_id');

const P = PATTERNS.SE_JONG;

class SeJongAgent extends BaseAgent {
  static get pattern() { return 'SE_JONG'; }
  static get capability() { return 'CANONICAL_SCHEMA'; }
  static get tenet() { return P.tenet; }
  static get duty() { return P.duty; }
  static get failure_mode() { return P.failure_mode; }

  evaluate(context) {
    this.lastContext = context || {};
    const action = this.lastContext.action;
    const actor = this.lastContext.actor;
    if (typeof action !== 'string' || action.length === 0
        || typeof actor !== 'string' || actor.length === 0) {
      return this.makeVerdict('DENY', 'CANONICAL_SCHEMA_MISSING_FIELD', {
        action_present: typeof action === 'string' && action.length > 0,
        actor_present: typeof actor === 'string' && actor.length > 0
      });
    }
    return this.makeVerdict('ALLOW', 'PHASE_3_STUB_CANONICAL_OK');
  }
}

module.exports = SeJongAgent;
