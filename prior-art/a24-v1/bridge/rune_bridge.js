'use strict';

const { spawnSync } = require('child_process');
const path = require('path');
const { verifyRuneTable } = require('./rune_table_verify');

function pad2(n) {
  return String(n).padStart(2, '0');
}

function runRuneAuthorize({ callerRune, capabilityId, tablePath }) {
  // Fail-closed: table must be valid + signed + a true permutation
  const verdict = verifyRuneTable(tablePath);
  if (!verdict.ok) {
    // Deny rather than throwing: deterministic fail-closed behavior
    return false;
  }

  const record =
    pad2(callerRune) +
    pad2(capabilityId) +
    String(tablePath).padEnd(256, ' ').slice(0, 256);

  const binPath = path.resolve(__dirname, '..', 'kernel', 'rune_authorize.bin');

  const proc = spawnSync(binPath, { input: record, encoding: 'utf8' });
  if (proc.error) throw proc.error;

  const out = proc.stdout.trim();
  return out === 'AUTHORIZED=Y';
}

module.exports = { runRuneAuthorize };