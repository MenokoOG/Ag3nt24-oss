'use strict';

const BaseAgent = require('./base_agent');
const { PATTERNS } = require('../pattern_id');

const P = PATTERNS.JUCHE;

class JucheAgent extends BaseAgent {
  static get pattern() { return 'JUCHE'; }
  static get capability() { return 'AUTONOMY_BOUNDARY'; }
  static get tenet() { return P.tenet; }
  static get duty() { return P.duty; }
  static get failure_mode() { return P.failure_mode; }
}

module.exports = JucheAgent;
