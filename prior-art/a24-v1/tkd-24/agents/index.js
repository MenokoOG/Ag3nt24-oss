'use strict';

const { PATTERNS, allPatterns } = require('../pattern_id');
const { CAPABILITIES } = require('../pattern_capability');

const EUI_AM = require('./eui_am');
const YON_GAE = require('./yon_gae');
const UL_JI = require('./ul_ji');
const SE_JONG = require('./se_jong');
const DO_SAN = require('./do_san');
const YUL_GOK = require('./yul_gok');
const PO_EUN = require('./po_eun');
const HWA_RANG = require('./hwa_rang');
const JOONG_GUN = require('./joong_gun');
const CHOONG_JANG = require('./choong_jang');
const GE_BAEK = require('./ge_baek');
const TOI_GYE = require('./toi_gye');
const SO_SAN = require('./so_san');
const JUCHE = require('./juche');
const MOON_MOO = require('./moon_moo');
const KWANG_GAE = require('./kwang_gae');
const CHOI_YONG = require('./choi_yong');
const WON_HYO = require('./won_hyo');
const YOO_SIN = require('./yoo_sin');
const TONG_IL = require('./tong_il');
const CHOONG_MOO = require('./choong_moo');
const CHON_JI = require('./chon_ji');
const SAM_IL = require('./sam_il');
const DAN_GUN = require('./dan_gun');

const AGENT_CLASSES = Object.freeze({
  EUI_AM, YON_GAE, UL_JI, SE_JONG, DO_SAN, YUL_GOK,
  PO_EUN, HWA_RANG, JOONG_GUN, CHOONG_JANG, GE_BAEK, TOI_GYE,
  SO_SAN, JUCHE, MOON_MOO, KWANG_GAE, CHOI_YONG, WON_HYO,
  YOO_SIN, TONG_IL, CHOONG_MOO, CHON_JI, SAM_IL, DAN_GUN
});

const _instances = {};
for (const key of Object.keys(AGENT_CLASSES)) {
  _instances[key] = new AGENT_CLASSES[key]();
}
Object.freeze(_instances);

(function validateAtLoad() {
  const keys = Object.keys(AGENT_CLASSES);
  if (keys.length !== 24) {
    throw new Error(`Expected 24 agent classes, got ${keys.length}`);
  }
  for (const k of keys) {
    if (!PATTERNS[k]) {
      throw new Error(`Agent "${k}" has no matching doctrine pattern`);
    }
    if (AGENT_CLASSES[k].pattern !== k) {
      throw new Error(`Agent class for "${k}" reports pattern "${AGENT_CLASSES[k].pattern}"`);
    }
  }
  for (const patternKey of Object.keys(PATTERNS)) {
    if (!AGENT_CLASSES[patternKey]) {
      throw new Error(`Pattern "${patternKey}" has no agent module`);
    }
  }
  const claimedCaps = new Set(keys.map(k => AGENT_CLASSES[k].capability));
  if (claimedCaps.size !== 24) {
    throw new Error(`Agent capability claims are not unique (got ${claimedCaps.size} distinct)`);
  }
  for (const capKey of Object.keys(CAPABILITIES)) {
    if (!claimedCaps.has(capKey)) {
      throw new Error(`Capability "${capKey}" is not claimed by any agent`);
    }
  }
})();

function allAgents() {
  return allPatterns().map(p => _instances[p.name]);
}

function agentByPattern(patternKey) {
  const inst = _instances[patternKey];
  if (!inst) {
    throw new Error(`No agent for pattern "${patternKey}"`);
  }
  return inst;
}

function agentBySlot(slotNumber) {
  const p = allPatterns().find(p => p.slot === slotNumber);
  if (!p) {
    throw new Error(`No pattern at slot ${slotNumber}`);
  }
  return _instances[p.name];
}

module.exports = Object.assign({}, AGENT_CLASSES, {
  allAgents,
  agentByPattern,
  agentBySlot
});
