'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

// IMPORTANT: keep this path local to bridge to avoid dependency injection drift
const { verifyRuneTable } = require('./rune_table_verify');

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function sha256Hex(inputUtf8) {
  return crypto.createHash('sha256').update(inputUtf8, 'utf8').digest('hex');
}

function normalizeHash64(hex) {
  const h = String(hex || '').trim();
  if (/^[0-9a-fA-F]{64}$/.test(h)) return h.toLowerCase();
  return '0'.repeat(64);
}

function atomicWriteFileUtf8(filePath, content) {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);
  const tmp = path.join(dir, `.${base}.${process.pid}.tmp`);
  fs.writeFileSync(tmp, content, 'utf8');
  fs.renameSync(tmp, filePath);
}

function runRuneRotation(epochDayYYYYMMDD, sotHash64) {
  const binPath = path.resolve(__dirname, '..', 'kernel', 'bin', 'rune_rotation.exe');
  const seed = normalizeHash64(sotHash64);

  // COBOL reads: epochDay (line1), seed hash (line2)
  const input = `${epochDayYYYYMMDD}\n${seed}\n`;

  const proc = spawnSync(binPath, { input, encoding: 'utf8' });
  if (proc.error) throw proc.error;

  const stdout = (proc.stdout || '').replace(/\r\n/g, '\n');
  const lines = stdout.split('\n').map(s => s.trim()).filter(Boolean);

  return lines;
}

function parseRotationLines(lines) {
  const rows = [];
  for (const l of lines) {
    const m = l.match(/^RUNE=(\d+),CAPABILITY=(\d+)$/);
    if (!m) continue;
    rows.push({ rune: Number(m[1]), cap: Number(m[2]) });
  }
  return rows;
}

function writeRuneTable({ epochDayYYYYMMDD, sotHash64 }) {
  const outDir = path.resolve(__dirname, '..', 'out');
  ensureDir(outDir);

  const filename = `rune_table_${epochDayYYYYMMDD}.csv`;
  const outPath = path.join(outDir, filename);

  const lines = runRuneRotation(epochDayYYYYMMDD, sotHash64);
  const rows = parseRotationLines(lines);

  if (rows.length !== 24) {
    throw new Error(
      `Expected 24 rune mappings, got ${rows.length}. Raw stdout: ${lines.join(' | ')}`
    );
  }

  // Canonical: 24 lines sorted by rune, each "RR,CC" with a trailing newline
  const mappingLines = rows
    .sort((a, b) => a.rune - b.rune)
    .map(r => `${String(r.rune).padStart(2, '0')},${String(r.cap).padStart(2, '0')}`);

  const canonicalMappings = mappingLines.join('\n') + '\n';
  const sig = sha256Hex(canonicalMappings);

  // Full file: mappings + SIG line + trailing newline
  const fileContent = canonicalMappings + `SIG,${sig}\n`;

  // Atomic publish prevents partial file states being observed by readers
  atomicWriteFileUtf8(outPath, fileContent);

  // Optional companion signature file (operational sanity, does not change verifier contract)
  const sigPath = outPath.replace(/\.csv$/i, '.sig');
  atomicWriteFileUtf8(sigPath, `${sig}\n`);

  // Fail-closed: verify immediately after write; if anything is wrong, do not proceed
  const verified = verifyRuneTable(outPath);
  if (!verified.ok) {
    throw new Error(`Post-write verification failed: ${verified.reason}`);
  }

  return { outPath, filename, rows, sig, sigPath };
}

module.exports = { writeRuneTable };
