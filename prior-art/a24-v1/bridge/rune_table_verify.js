'use strict';

const fs = require('fs');
const crypto = require('crypto');

function sha256Hex(inputUtf8) {
  return crypto.createHash('sha256').update(inputUtf8, 'utf8').digest('hex');
}

function normalizeLineEndings(raw) {
  return raw.replace(/\r\n/g, '\n');
}

function stripTrailingEmpty(lines) {
  const out = lines.slice();
  while (out.length > 0 && out[out.length - 1] === '') out.pop();
  return out;
}

function isMappingLine(line) {
  return /^(\d{2}),(\d{2})$/.test(line);
}

function parseRuneTableFile(tablePath) {
  const raw = fs.readFileSync(tablePath, 'utf8');
  const normalized = normalizeLineEndings(raw);
  const lines = stripTrailingEmpty(normalized.split('\n'));

  // Special-case: 24 clean mapping lines with no SIG is a common “overwritten/truncated” signature.
  if (lines.length === 24 && lines.every(isMappingLine)) {
    return {
      ok: false,
      reason: 'TABLE_TRUNCATED_OR_MAPPINGS_ONLY',
      mappings: null,
      sigLine: null,
      contentForHash: null
    };
  }

  if (lines.length < 25) {
    return {
      ok: false,
      reason: `NO_SIGNATURE_LINE: expected 25 lines (24 mappings + SIG), got ${lines.length}`,
      mappings: null,
      sigLine: null,
      contentForHash: null
    };
  }

  const sigLine = lines[lines.length - 1];
  const mappingLines = lines.slice(0, lines.length - 1);

  const sigMatch = sigLine.match(/^SIG,([0-9a-f]{64})$/i);
  if (!sigMatch) {
    return {
      ok: false,
      reason: 'SIG_MISSING_OR_MALFORMED',
      mappings: null,
      sigLine,
      contentForHash: null
    };
  }

  const sigHex = sigMatch[1].toLowerCase();

  if (mappingLines.length !== 24) {
    return {
      ok: false,
      reason: `MAPPING_LINE_COUNT_INVALID: expected 24, got ${mappingLines.length}`,
      mappings: null,
      sigLine,
      contentForHash: null
    };
  }

  const mappings = [];
  for (const line of mappingLines) {
    const m = line.match(/^(\d{2}),(\d{2})$/);
    if (!m) {
      return {
        ok: false,
        reason: `MAPPING_LINE_MALFORMED: "${line}"`,
        mappings: null,
        sigLine,
        contentForHash: null
      };
    }
    mappings.push({ rune: Number(m[1]), cap: Number(m[2]) });
  }

  // Canonical hash input: the 24 mapping lines + trailing newline
  const contentForHash = mappingLines.join('\n') + '\n';
  const computed = sha256Hex(contentForHash);

  if (computed !== sigHex) {
    return {
      ok: false,
      reason: 'SIG_MISMATCH',
      mappings,
      sigLine,
      contentForHash
    };
  }

  return {
    ok: true,
    reason: 'OK',
    mappings,
    sigLine,
    contentForHash
  };
}

function verifyPermutation(mappings) {
  if (!Array.isArray(mappings) || mappings.length !== 24) {
    return { ok: false, reason: 'PERM_INVALID_MAPPING_COUNT' };
  }

  const runeSet = new Set();
  const capSet = new Set();

  for (const { rune, cap } of mappings) {
    if (!Number.isInteger(rune) || rune < 1 || rune > 24) {
      return { ok: false, reason: `PERM_RUNE_OUT_OF_RANGE:${rune}` };
    }
    if (!Number.isInteger(cap) || cap < 1 || cap > 24) {
      return { ok: false, reason: `PERM_CAP_OUT_OF_RANGE:${cap}` };
    }
    runeSet.add(rune);
    capSet.add(cap);
  }

  if (runeSet.size !== 24) return { ok: false, reason: 'PERM_RUNE_DUPLICATE_OR_MISSING' };
  if (capSet.size !== 24) return { ok: false, reason: 'PERM_CAP_DUPLICATE_OR_MISSING' };

  for (let i = 1; i <= 24; i++) {
    if (!runeSet.has(i)) return { ok: false, reason: `PERM_RUNE_MISSING:${i}` };
    if (!capSet.has(i)) return { ok: false, reason: `PERM_CAP_MISSING:${i}` };
  }

  return { ok: true, reason: 'OK' };
}

function verifyRuneTable(tablePath) {
  const parsed = parseRuneTableFile(tablePath);
  if (!parsed.ok) return parsed;

  const perm = verifyPermutation(parsed.mappings);
  if (!perm.ok) {
    return {
      ok: false,
      reason: perm.reason,
      mappings: parsed.mappings,
      sigLine: parsed.sigLine,
      contentForHash: parsed.contentForHash
    };
  }

  return parsed;
}

module.exports = {
  verifyRuneTable,
  parseRuneTableFile,
  verifyPermutation
};
