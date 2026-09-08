'use strict';

const BaseAgent = require('./base_agent');
const { PATTERNS } = require('../pattern_id');

const P = PATTERNS.DO_SAN;

class DoSanAgent extends BaseAgent {
  static get pattern() { return 'DO_SAN'; }
  static get capability() { return 'OPERATOR_READABILITY'; }
  static get tenet() { return P.tenet; }
  static get duty() { return P.duty; }
  static get failure_mode() { return P.failure_mode; }
}

module.exports = DoSanAgent;
