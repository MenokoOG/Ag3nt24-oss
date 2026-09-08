'use strict';

const BaseAgent = require('./base_agent');
const { PATTERNS } = require('../pattern_id');

const P = PATTERNS.SO_SAN;

class SoSanAgent extends BaseAgent {
  static get pattern() { return 'SO_SAN'; }
  static get capability() { return 'INCIDENT_RECOVERY'; }
  static get tenet() { return P.tenet; }
  static get duty() { return P.duty; }
  static get failure_mode() { return P.failure_mode; }
}

module.exports = SoSanAgent;
