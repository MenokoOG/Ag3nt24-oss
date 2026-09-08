'use strict';

const BaseAgent = require('./base_agent');
const { PATTERNS } = require('../pattern_id');

const P = PATTERNS.EUI_AM;

class EuiAmAgent extends BaseAgent {
  static get pattern() { return 'EUI_AM'; }
  static get capability() { return 'RESOURCE_INTEGRITY'; }
  static get tenet() { return P.tenet; }
  static get duty() { return P.duty; }
  static get failure_mode() { return P.failure_mode; }
}

module.exports = EuiAmAgent;
