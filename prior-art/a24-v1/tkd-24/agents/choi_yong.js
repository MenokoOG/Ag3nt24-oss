'use strict';

const BaseAgent = require('./base_agent');
const { PATTERNS } = require('../pattern_id');

const P = PATTERNS.CHOI_YONG;

class ChoiYongAgent extends BaseAgent {
  static get pattern() { return 'CHOI_YONG'; }
  static get capability() { return 'BETRAYAL_DETECTION'; }
  static get tenet() { return P.tenet; }
  static get duty() { return P.duty; }
  static get failure_mode() { return P.failure_mode; }
}

module.exports = ChoiYongAgent;
