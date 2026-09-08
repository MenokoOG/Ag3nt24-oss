'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const { patternBySlot } = require('./pattern_id');
const { capabilityBySlot } = require('./pattern_capability');

const VERSION = 'A24-PATTERN-TABLE-v2';

function sha256Hex(input) {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

function normalizeHash64(hex) {
  const h = String(hex || '').trim();
  if (/^[0-9a-fA-F]{64}$/.test(h)) return h.toLowerCase();
  return '0'.repeat(64);
}

function epochToIso(yyyymmdd) {
  const s = String(yyyymmdd);
  if (!/^\d{8}$/.test(s)) {
    throw new Error(`epochDayYYYYMMDD must be 8 digits, got "${s}"`);
  }
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function atomicWriteFileUtf8(filePath, content) {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);
  const tmp = path.join(dir, `.${base}.${process.pid}.tmp`);
  fs.writeFileSync(tmp, content, 'utf8');
  fs.renameSync(tmp, filePath);
}

// Same I/O contract as bridge/rune_table_writer.js::runRuneRotation.
// Spawned directly from tkd-24/ to satisfy the Phase 2 constraint that
// bridge/rune_*.js stays untouched. The kernel binary is name-agnostic;
// translation to pattern/capability names happens in this module.
function runRuneRotation(epochDayYYYYMMDD, sotHash64) {
  const binPath = path.resolve(__dirname, '..', 'kernel', 'rune_rotation.bin');
  const seed = normalizeHash64(sotHash64);
  const input = `${epochDayYYYYMMDD}\n${seed}\n`;
  const proc = spawnSync(binPath, { input, encoding: 'utf8' });
  if (proc.error) throw proc.error;
  const stdout = (proc.stdout || '').replace(/\r\n/g, '\n');
  const lines = stdout.split('\n').map(s => s.trim()).filter(Boolean);
  const rows = [];
  for (const l of lines) {
    const m = l.match(/^RUNE=(\d+),CAPABILITY=(\d+)$/);
    if (!m) continue;
    rows.push({ rune: Number(m[1]), cap: Number(m[2]) });
  }
  if (rows.length !== 24) {
    throw new Error(
      `Expected 24 rune mappings from rune_rotation.bin, got ${rows.length}. Raw stdout: ${lines.join(' | ')}`
    );
  }
  return rows.sort((a, b) => a.rune - b.rune);
}

function canonicalMappingsJson(mappings) {
  // Compact, deterministic per-entry key order: slot, pattern, capability
  const parts = mappings.map(m => {
    return `{"slot":${m.slot},"pattern":${JSON.stringify(m.pattern)},"capability":${JSON.stringify(m.capability)}}`;
  });
  return `[${parts.join(',')}]`;
}

// Canonical doc body, sig field intentionally omitted.
// Top-level key order: version, epoch_day, sot_hash, mappings, table_hash, sig_alg.
function canonicalBodyJson(body) {
  return (
    '{' +
    `"version":${JSON.stringify(body.version)},` +
    `"epoch_day":${JSON.stringify(body.epoch_day)},` +
    `"sot_hash":${JSON.stringify(body.sot_hash)},` +
    `"mappings":${canonicalMappingsJson(body.mappings)},` +
    `"table_hash":${JSON.stringify(body.table_hash)},` +
    `"sig_alg":${JSON.stringify(body.sig_alg)}` +
    '}'
  );
}

function writePatternTable({ epochDayYYYYMMDD, sotHash64, outDir }) {
  const epochStr = String(epochDayYYYYMMDD);
  const epochIso = epochToIso(epochStr);
  const sot = normalizeHash64(sotHash64);

  const rows = runRuneRotation(epochStr, sot);

  const mappings = rows.map(({ rune, cap }) => {
    const pattern = patternBySlot(rune);
    const capability = capabilityBySlot(cap);
    if (!pattern) {
      throw new Error(`No pattern for rune slot ${rune}`);
    }
    if (!capability) {
      throw new Error(`No capability for cap slot ${cap}`);
    }
    return { slot: rune, pattern: pattern.name, capability: capability.name };
  });

  const tableHash = sha256Hex(canonicalMappingsJson(mappings));

  const body = {
    version: VERSION,
    epoch_day: epochIso,
    sot_hash: sot,
    mappings,
    table_hash: tableHash,
    sig_alg: 'SHA256'
  };

  const bodyJson = canonicalBodyJson(body);
  const sig = sha256Hex(bodyJson);

  // Insert "sig" before the closing brace, preserving canonical order
  const finalJson = bodyJson.slice(0, -1) + `,"sig":${JSON.stringify(sig)}}` + '\n';

  const resolvedOutDir = outDir
    ? path.resolve(outDir)
    : path.resolve(__dirname, '..', 'out');
  ensureDir(resolvedOutDir);

  const filename = `pattern_table_${epochStr}.json`;
  const outPath = path.join(resolvedOutDir, filename);
  atomicWriteFileUtf8(outPath, finalJson);

  return outPath;
}

module.exports = {
  writePatternTable,
  canonicalMappingsJson,
  canonicalBodyJson,
  VERSION
};
