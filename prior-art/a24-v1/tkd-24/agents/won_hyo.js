'use strict';

const BaseAgent = require('./base_agent');
const { PATTERNS } = require('../pattern_id');

const P = PATTERNS.WON_HYO;

class WonHyoAgent extends BaseAgent {
  static get pattern() { return 'WON_HYO'; }
  static get capability() { return 'REHABILITATION_DOCTRINE'; }
  static get tenet() { return P.tenet; }
  static get duty() { return P.duty; }
  static get failure_mode() { return P.failure_mode; }
}

module.exports = WonHyoAgent;
