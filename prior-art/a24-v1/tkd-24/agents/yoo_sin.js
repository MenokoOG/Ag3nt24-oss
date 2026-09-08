'use strict';

const BaseAgent = require('./base_agent');
const { PATTERNS } = require('../pattern_id');

const P = PATTERNS.YOO_SIN;

class YooSinAgent extends BaseAgent {
  static get pattern() { return 'YOO_SIN'; }
  static get capability() { return 'THIRD_PARTY_TRUST'; }
  static get tenet() { return P.tenet; }
  static get duty() { return P.duty; }
  static get failure_mode() { return P.failure_mode; }
}

module.exports = YooSinAgent;
