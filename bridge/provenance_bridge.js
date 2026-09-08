'use strict';

const { spawnSync } = require('child_process');
const path = require('path');

function pad(value, length) {
  return String(value).padEnd(length, ' ').slice(0, length);
}

function runProvenanceValidate(input) {
  const record =
    pad(input.signerId, 16) +
    pad(input.parentHash, 64) +
    pad(input.currentSotHash, 64) +
    pad(input.contentHash, 64);

  const binPath = path.resolve(
    __dirname,
    '..',
    'kernel',
    'bin',
    'provenance_validate.exe'
  );

  const proc = spawnSync(binPath, {
    input: record,
    encoding: 'utf8'
  });

  if (proc.error) throw proc.error;

  const lines = proc.stdout.trim().split('\n');

  let valid = false;
  let reason = '';

  for (const l of lines) {
    if (l === 'PROVENANCE=VALID') valid = true;
    if (l.startsWith('REASON=')) reason = l.substring(7);
  }

  return { valid, reason, rawOutput: lines };
}

module.exports = { runProvenanceValidate };