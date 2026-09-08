'use strict';

const BaseAgent = require('./base_agent');
const { PATTERNS } = require('../pattern_id');

const P = PATTERNS.HWA_RANG;

class HwaRangAgent extends BaseAgent {
  static get pattern() { return 'HWA_RANG'; }
  static get capability() { return 'SWARM_COORDINATION'; }
  static get tenet() { return P.tenet; }
  static get duty() { return P.duty; }
  static get failure_mode() { return P.failure_mode; }
}

module.exports = HwaRangAgent;
