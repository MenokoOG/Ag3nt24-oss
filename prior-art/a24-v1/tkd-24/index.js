'use strict';

const patternId = require('./pattern_id');
const patternCapability = require('./pattern_capability');
const writer = require('./pattern_table_writer');
const verifier = require('./pattern_table_verify');
const envelope = require('./decision_envelope');
const alias = require('./rune_alias');
const agents = require('./agents');
const tenetGateModule = require('./tenet_gate');
const sotStoreModule = require('./sot_store');
const othalaLogModule = require('./othala_log');
const orchestratorModule = require('./ooda_orchestrator');

module.exports = {
  // public API (Phase 4)
  TenetGate: tenetGateModule.TenetGate,
  validateLicense: tenetGateModule.validateLicense,
  OodaOrchestrator: orchestratorModule.OodaOrchestrator,
  makeSotStore: sotStoreModule.makeSotStore,
  makeOthalaLog: othalaLogModule.makeOthalaLog,

  // agents (Phase 3) — 24 SOUL modules
  agents,
  BaseAgent: require('./agents/base_agent'),

  // pattern_id
  PATTERNS: patternId.PATTERNS,
  patternBySlot: patternId.patternBySlot,
  patternByName: patternId.patternByName,
  allPatterns: patternId.allPatterns,

  // pattern_capability
  CAPABILITIES: patternCapability.CAPABILITIES,
  CAPABILITIES_BY_SLOT: patternCapability.CAPABILITIES_BY_SLOT,
  capabilityByName: patternCapability.capabilityByName,
  capabilitiesByPattern: patternCapability.capabilitiesByPattern,
  allCapabilities: patternCapability.allCapabilities,
  capabilityBySlot: patternCapability.capabilityBySlot,

  // pattern_table_writer
  writePatternTable: writer.writePatternTable,
  PATTERN_TABLE_VERSION: writer.VERSION,

  // pattern_table_verify
  verifyPatternTable: verifier.verifyPatternTable,
  VERIFY_REASONS: verifier.REASONS,

  // decision_envelope
  DECISION_VERSION: envelope.VERSION,
  newEnvelope: envelope.newEnvelope,
  canonicalSerialize: envelope.canonicalSerialize,
  hashEnvelope: envelope.hashEnvelope,
  validateEnvelopeShape: envelope.validateEnvelopeShape,

  // rune_alias
  runeSlotToPattern: alias.runeSlotToPattern,
  patternToRuneSlot: alias.patternToRuneSlot,
  runeCapToCapability: alias.runeCapToCapability,
  legacyTableToV2: alias.legacyTableToV2
};
