'use strict';

const { PATTERNS, patternBySlot } = require('./pattern_id');
const { capabilityBySlot } = require('./pattern_capability');

function runeSlotToPattern(runeSlotNumber) {
  const p = patternBySlot(runeSlotNumber);
  return p ? p.name : null;
}

function patternToRuneSlot(patternKey) {
  const p = PATTERNS[patternKey];
  return p ? p.slot : null;
}

function runeCapToCapability(runeCapNumber) {
  const c = capabilityBySlot(runeCapNumber);
  return c ? c.name : null;
}

/**
 * Translate legacy v1 rune CSV contents into a v2-shaped object.
 * Unsigned: epoch_day, sot_hash, table_hash, and sig are null.
 * Migration tooling will populate and sign these in a later phase.
 *
 * @param {string} legacyTableContents
 * @returns {object} v2-shaped pattern table object (unsigned)
 */
function legacyTableToV2(legacyTableContents) {
  const normalized = String(legacyTableContents).replace(/\r\n/g, '\n');
  const lines = normalized.split('\n').map(s => s.trim()).filter(Boolean);
  const mappingLines = lines.filter(l => /^\d{2},\d{2}$/.test(l));
  if (mappingLines.length !== 24) {
    throw new Error(`Expected 24 mapping lines in legacy table, got ${mappingLines.length}`);
  }
  const mappings = mappingLines.map(l => {
    const [rune, cap] = l.split(',').map(Number);
    const pattern = patternBySlot(rune);
    const capability = capabilityBySlot(cap);
    if (!pattern) throw new Error(`No pattern for rune slot ${rune}`);
    if (!capability) throw new Error(`No capability for cap slot ${cap}`);
    return { slot: rune, pattern: pattern.name, capability: capability.name };
  });
  return {
    version: 'A24-PATTERN-TABLE-v2',
    epoch_day: null,
    sot_hash: null,
    mappings,
    table_hash: null,
    sig_alg: 'SHA256',
    sig: null
  };
}

module.exports = {
  runeSlotToPattern,
  patternToRuneSlot,
  runeCapToCapability,
  legacyTableToV2
};
