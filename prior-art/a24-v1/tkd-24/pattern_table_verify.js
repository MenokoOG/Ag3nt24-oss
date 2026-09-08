'use strict';

const fs = require('fs');
const crypto = require('crypto');

const { PATTERNS } = require('./pattern_id');
const { CAPABILITIES } = require('./pattern_capability');
const { canonicalMappingsJson, canonicalBodyJson, VERSION } = require('./pattern_table_writer');
const { verifyRuneTable } = require('../bridge/rune_table_verify');

const REASONS = Object.freeze({
  OK: 'OK',
  PARSE_FAILED: 'PARSE_FAILED',
  SIG_MISMATCH: 'SIG_MISMATCH',
  DOCTRINE_VIOLATION: 'DOCTRINE_VIOLATION',
  DUPLICATE_PATTERN: 'DUPLICATE_PATTERN',
  MISSING_PATTERN: 'MISSING_PATTERN',
  UNKNOWN_VERSION: 'UNKNOWN_VERSION'
});

function sha256Hex(input) {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

function fail(version, reason, mappings, parsed) {
  return {
    ok: false,
    version: version || null,
    reason,
    mappings: mappings || null,
    parsed: parsed || null
  };
}

function verifyV2(parsed) {
  if (!parsed || parsed.version !== VERSION) {
    return fail('v2', REASONS.UNKNOWN_VERSION, null, parsed);
  }
  if (!Array.isArray(parsed.mappings)) {
    return fail('v2', REASONS.PARSE_FAILED, null, parsed);
  }
  if (parsed.mappings.length !== 24) {
    return fail('v2', REASONS.MISSING_PATTERN, parsed.mappings, parsed);
  }

  const body = {
    version: parsed.version,
    epoch_day: parsed.epoch_day,
    sot_hash: parsed.sot_hash,
    mappings: parsed.mappings,
    table_hash: parsed.table_hash,
    sig_alg: parsed.sig_alg
  };
  const recomputedSig = sha256Hex(canonicalBodyJson(body));
  if (recomputedSig !== parsed.sig) {
    return fail('v2', REASONS.SIG_MISMATCH, parsed.mappings, parsed);
  }

  const recomputedTableHash = sha256Hex(canonicalMappingsJson(parsed.mappings));
  if (recomputedTableHash !== parsed.table_hash) {
    return fail('v2', REASONS.SIG_MISMATCH, parsed.mappings, parsed);
  }

  const seenPatterns = new Set();
  const seenSlots = new Set();
  for (const m of parsed.mappings) {
    if (!m || typeof m.slot !== 'number' || typeof m.pattern !== 'string' || typeof m.capability !== 'string') {
      return fail('v2', REASONS.PARSE_FAILED, parsed.mappings, parsed);
    }
    if (seenPatterns.has(m.pattern) || seenSlots.has(m.slot)) {
      return fail('v2', REASONS.DUPLICATE_PATTERN, parsed.mappings, parsed);
    }
    seenPatterns.add(m.pattern);
    seenSlots.add(m.slot);

    const patternEntry = PATTERNS[m.pattern];
    if (!patternEntry) {
      return fail('v2', REASONS.MISSING_PATTERN, parsed.mappings, parsed);
    }
    if (patternEntry.slot !== m.slot) {
      return fail('v2', REASONS.DOCTRINE_VIOLATION, parsed.mappings, parsed);
    }
    if (!CAPABILITIES[m.capability]) {
      return fail('v2', REASONS.DOCTRINE_VIOLATION, parsed.mappings, parsed);
    }
  }
  for (let s = 1; s <= 24; s++) {
    if (!seenSlots.has(s)) {
      return fail('v2', REASONS.MISSING_PATTERN, parsed.mappings, parsed);
    }
  }

  return {
    ok: true,
    version: 'v2',
    reason: REASONS.OK,
    mappings: parsed.mappings,
    parsed
  };
}

function verifyV1(tablePath) {
  const result = verifyRuneTable(tablePath);
  return {
    ok: !!result.ok,
    version: 'v1',
    reason: result.reason || (result.ok ? REASONS.OK : 'V1_FAILED'),
    mappings: result.mappings || null,
    parsed: result
  };
}

function verifyPatternTable(tablePath) {
  let raw;
  try {
    raw = fs.readFileSync(tablePath, 'utf8');
  } catch (err) {
    return fail(null, REASONS.PARSE_FAILED, null, null);
  }

  // Try v2 first: JSON.parse — on success, dispatch to v2 verifier; on failure fall through to v1.
  const trimmed = raw.trimStart();
  if (trimmed.startsWith('{')) {
    let parsedJson = null;
    try {
      parsedJson = JSON.parse(trimmed);
    } catch (err) {
      parsedJson = null;
    }
    if (parsedJson) {
      return verifyV2(parsedJson);
    }
  }

  return verifyV1(tablePath);
}

module.exports = {
  verifyPatternTable,
  REASONS
};
