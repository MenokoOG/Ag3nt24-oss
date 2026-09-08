'use strict';

const BaseAgent = require('./base_agent');
const { PATTERNS } = require('../pattern_id');

const P = PATTERNS.YON_GAE;

class YonGaeAgent extends BaseAgent {
  static get pattern() { return 'YON_GAE'; }
  static get capability() { return 'BREACH_SUPPRESSION'; }
  static get tenet() { return P.tenet; }
  static get duty() { return P.duty; }
  static get failure_mode() { return P.failure_mode; }
}

module.exports = YonGaeAgent;
