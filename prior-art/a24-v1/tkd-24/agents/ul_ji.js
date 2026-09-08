'use strict';

const BaseAgent = require('./base_agent');
const { PATTERNS } = require('../pattern_id');

const P = PATTERNS.UL_JI;

class UlJiAgent extends BaseAgent {
  static get pattern() { return 'UL_JI'; }
  static get capability() { return 'ASYMMETRIC_DEFENSE'; }
  static get tenet() { return P.tenet; }
  static get duty() { return P.duty; }
  static get failure_mode() { return P.failure_mode; }
}

module.exports = UlJiAgent;
