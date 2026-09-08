'use strict';

// Phase 5 backward-compat surface. Routes legacy rune_* callers to the v1
// implementations they have always used (kernel-backed auth via rune_bridge,
// v1 CSV writer via rune_table_writer) while exposing the new tkd-24 v2-aware
// table verifier under the legacy verifyRuneTable name.
//
// The underlying bridge/rune_*.js bodies are intentionally preserved:
//   - bridge/rune_bridge.runRuneAuthorize keeps spawning kernel/rune_authorize.bin
//     so the defense-tech "kernel in the auth path" posture is not weakened.
//   - bridge/rune_table_writer.writeRuneTable keeps writing v1 CSV via
//     kernel/rune_rotation.bin.
//   - tkd-24/pattern_table_verify auto-detects v1 (delegates to
//     bridge/rune_table_verify) and v2 (JSON).
//
// A single deprecation warning is emitted the first time ANY shim function
// is invoked per process; v1.1 removes the bridge/rune_*.js files entirely.

let WARNED = false;
function deprecationOnce() {
  if (WARNED) return;
  WARNED = true;
  console.warn(
    '[a-24 deprecation] bridge/rune_*.js is deprecated and will be removed ' +
    'in v1.1. Migrate to tkd-24/tenet_gate.js (see docs/A24_FOR_DEVELOPERS.md).'
  );
}

const legacyAuthorize = require('./rune_bridge');
const legacyWriter = require('./rune_table_writer');
const { verifyPatternTable } = require('../tkd-24/pattern_table_verify');

/**
 * Legacy authorization check.
 *
 * Accepts both the existing { callerRune, capabilityId, tablePath } shape and
 * the documented Phase 5 shape { callerRune, requestedCapability, tablePath }.
 * Delegates to bridge/rune_bridge.runRuneAuthorize, which spawns
 * kernel/rune_authorize.bin — kernel stays in the auth path.
 *
 * @param {{callerRune:any, capabilityId?:any, requestedCapability?:any, tablePath:string}} args
 * @returns {boolean}
 */
function runRuneAuthorize(args) {
  deprecationOnce();
  const a = args || {};
  const callerRune = a.callerRune;
  const capabilityId = a.capabilityId !== undefined ? a.capabilityId : a.requestedCapability;
  const tablePath = a.tablePath;
  return legacyAuthorize.runRuneAuthorize({ callerRune, capabilityId, tablePath });
}

/**
 * Legacy v1 CSV writer. Delegates to bridge/rune_table_writer.writeRuneTable.
 *
 * @param {{epochDayYYYYMMDD:(string|number), sotHash64:string}} args
 * @returns {{outPath:string, filename:string, rows:Array, sig:string, sigPath:string}}
 */
function writeRuneTable(args) {
  deprecationOnce();
  return legacyWriter.writeRuneTable(args);
}

/**
 * Verify a rotation table file. Auto-detects v1 (rune CSV) and v2 (pattern
 * JSON) by delegating to tkd-24/pattern_table_verify.verifyPatternTable.
 *
 * Return shape follows the v2-aware verifier: { ok, version, reason, mappings,
 * parsed }. Legacy callers that need the original v1-only return shape should
 * continue to require('./rune_table_verify') directly.
 *
 * @param {string} tablePath
 * @returns {{ok:boolean, version:?string, reason:string, mappings:?Array, parsed:?object}}
 */
function verifyRuneTable(tablePath) {
  deprecationOnce();
  return verifyPatternTable(tablePath);
}

module.exports = {
  runRuneAuthorize,
  writeRuneTable,
  verifyRuneTable
};
