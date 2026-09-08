'use strict';

const BaseAgent = require('./base_agent');
const { PATTERNS } = require('../pattern_id');

const P = PATTERNS.JOONG_GUN;

class JoongGunAgent extends BaseAgent {
  static get pattern() { return 'JOONG_GUN'; }
  static get capability() { return 'SURGICAL_INTERDICTION'; }
  static get tenet() { return P.tenet; }
  static get duty() { return P.duty; }
  static get failure_mode() { return P.failure_mode; }
}

module.exports = JoongGunAgent;
