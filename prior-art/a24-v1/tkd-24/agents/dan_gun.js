'use strict';

const BaseAgent = require('./base_agent');
const { PATTERNS } = require('../pattern_id');

const P = PATTERNS.DAN_GUN;

class DanGunAgent extends BaseAgent {
  static get pattern() { return 'DAN_GUN'; }
  static get capability() { return 'ROOT_IDENTITY'; }
  static get tenet() { return P.tenet; }
  static get duty() { return P.duty; }
  static get failure_mode() { return P.failure_mode; }

  evaluate(context) {
    this.lastContext = context || {};
    const actor = this.lastContext.actor;
    if (typeof actor !== 'string' || actor.length === 0 || /\s/.test(actor)) {
      return this.makeVerdict('DENY', 'ROOT_IDENTITY_INVALID', {
        actor_type: typeof actor,
        actor_empty: actor === '' || actor == null,
        has_whitespace: typeof actor === 'string' && /\s/.test(actor)
      });
    }
    return this.makeVerdict('ALLOW', 'PHASE_3_STUB_IDENTITY_OK');
  }
}

module.exports = DanGunAgent;
