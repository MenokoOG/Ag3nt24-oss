'use strict';

const BaseAgent = require('./base_agent');
const { PATTERNS } = require('../pattern_id');

const P = PATTERNS.TOI_GYE;

class ToiGyeAgent extends BaseAgent {
  static get pattern() { return 'TOI_GYE'; }
  static get capability() { return 'DOCTRINE_CUSTODY'; }
  static get tenet() { return P.tenet; }
  static get duty() { return P.duty; }
  static get failure_mode() { return P.failure_mode; }
}

module.exports = ToiGyeAgent;
