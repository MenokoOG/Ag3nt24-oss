'use strict';

const BaseAgent = require('./base_agent');
const { PATTERNS } = require('../pattern_id');

const P = PATTERNS.CHOONG_JANG;

class ChoongJangAgent extends BaseAgent {
  static get pattern() { return 'CHOONG_JANG'; }
  static get capability() { return 'QUARANTINE'; }
  static get tenet() { return P.tenet; }
  static get duty() { return P.duty; }
  static get failure_mode() { return P.failure_mode; }
}

module.exports = ChoongJangAgent;
