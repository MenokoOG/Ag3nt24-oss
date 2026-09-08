'use strict';

const BaseAgent = require('./base_agent');
const { PATTERNS } = require('../pattern_id');

const P = PATTERNS.CHON_JI;

class ChonJiAgent extends BaseAgent {
  static get pattern() { return 'CHON_JI'; }
  static get capability() { return 'GENESIS_INITIALIZATION'; }
  static get tenet() { return P.tenet; }
  static get duty() { return P.duty; }
  static get failure_mode() { return P.failure_mode; }
}

module.exports = ChonJiAgent;
