'use strict';

const BaseAgent = require('./base_agent');
const { PATTERNS } = require('../pattern_id');

const P = PATTERNS.SAM_IL;

class SamIlAgent extends BaseAgent {
  static get pattern() { return 'SAM_IL'; }
  static get capability() { return 'RELEASE_MOBILIZATION'; }
  static get tenet() { return P.tenet; }
  static get duty() { return P.duty; }
  static get failure_mode() { return P.failure_mode; }
}

module.exports = SamIlAgent;
