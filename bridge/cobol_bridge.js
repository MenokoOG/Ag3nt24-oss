'use strict';

const { spawnSync } = require('child_process');
const path = require('path');

/**
 * Fixed-width record layout (must match COBOL PIC sizes exactly)
 *
 * ACTOR-ID            X(16)
 * ACTION-ID           X(32)
 * SOURCE-DOMAIN       X(16)
 * TARGET-DOMAIN       X(16)
 * HAS-CONTRACT        X
 * HAS-PROVENANCE      X
 * PROVENANCE-MATCH    X
 * RETRY-COUNT         99
 * MAX-RETRIES         99
 * WITHIN-QUOTA        X
 * ANOMALY-DETECTED    X
 */

function pad(value, length) {
  return String(value).padEnd(length, ' ').slice(0, length);
}

function formatActionRecord(ctx) {
  return (
    pad(ctx.actorId, 16) +
    pad(ctx.actionId, 32) +
    pad(ctx.sourceDomain, 16) +
    pad(ctx.targetDomain, 16) +
    pad(ctx.hasContract ? 'Y' : 'N', 1) +
    pad(ctx.hasProvenance ? 'Y' : 'N', 1) +
    pad(ctx.provenanceMatch ? 'Y' : 'N', 1) +
    pad(String(ctx.retryCount).padStart(2, '0'), 2) +
    pad(String(ctx.maxRetries).padStart(2, '0'), 2) +
    pad(ctx.withinQuota ? 'Y' : 'N', 1) +
    pad(ctx.anomalyDetected ? 'Y' : 'N', 1)
  );
}

function runTenetGate(ctx) {
  const record = formatActionRecord(ctx);

  const binPath = path.resolve(
    __dirname,
    '..',
    'kernel',
    'bin',
    'tenet_gate.exe'
  );

  const proc = spawnSync(binPath, {
    input: record,
    encoding: 'utf8'
  });

  if (proc.error) {
    throw proc.error;
  }

  const stdout = proc.stdout.trim().split('\n');

  let decision = 'D';
  let reason = 'UNKNOWN';

  for (const line of stdout) {
    if (line.startsWith('DECISION=')) {
      decision = line.split('=')[1].trim();
    }
    if (line.startsWith('REASON=')) {
      reason = line.substring(7).trim();
    }
  }

  return {
    allow: decision === 'A',
    decision,
    reason,
    rawOutput: stdout
  };
}

module.exports = {
  runTenetGate
};
