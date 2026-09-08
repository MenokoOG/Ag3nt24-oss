'use strict';

const BaseAgent = require('./base_agent');
const { PATTERNS } = require('../pattern_id');

const P = PATTERNS.GE_BAEK;

class GeBaekAgent extends BaseAgent {
  static get pattern() { return 'GE_BAEK'; }
  static get capability() { return 'EXECUTION_DISCIPLINE'; }
  static get tenet() { return P.tenet; }
  static get duty() { return P.duty; }
  static get failure_mode() { return P.failure_mode; }

  evaluate(context) {
    this.lastContext = context || {};
    const params = this.lastContext.params;
    const isPlainObject = params !== null
      && typeof params === 'object'
      && !Array.isArray(params);
    if (!isPlainObject) {
      return this.makeVerdict('DENY', 'COMMAND_SEQUENCE_INVALID', {
        params_type: Array.isArray(params) ? 'array' : (params === null ? 'null' : typeof params)
      });
    }
    return this.makeVerdict('ALLOW', 'PHASE_3_STUB_DISCIPLINE_OK');
  }
}

module.exports = GeBaekAgent;
