'use strict';

const BaseAgent = require('./base_agent');
const { PATTERNS } = require('../pattern_id');

const P = PATTERNS.YUL_GOK;

class YulGokAgent extends BaseAgent {
  static get pattern() { return 'YUL_GOK'; }
  static get capability() { return 'STATIC_VERIFICATION'; }
  static get tenet() { return P.tenet; }
  static get duty() { return P.duty; }
  static get failure_mode() { return P.failure_mode; }
}

module.exports = YulGokAgent;
