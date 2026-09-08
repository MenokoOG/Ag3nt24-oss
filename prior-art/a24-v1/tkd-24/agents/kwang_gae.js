'use strict';

const BaseAgent = require('./base_agent');
const { PATTERNS } = require('../pattern_id');

const P = PATTERNS.KWANG_GAE;

class KwangGaeAgent extends BaseAgent {
  static get pattern() { return 'KWANG_GAE'; }
  static get capability() { return 'SOT_RECOVERY'; }
  static get tenet() { return P.tenet; }
  static get duty() { return P.duty; }
  static get failure_mode() { return P.failure_mode; }
}

module.exports = KwangGaeAgent;
