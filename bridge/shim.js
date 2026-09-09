'use strict';

// HTTP shim for the kernel container.
//
// ADR-0023 makes the four COBOL gates the boundary ACL. ADR-0025 puts them in
// their own container and says the other containers reach them over HTTP. This
// file is that surface and nothing more: it formats a request into the fixed
// width records the gates expect, spawns the gate, and returns the verdict. It
// holds no state, writes no receipt, and makes no decision of its own. A
// receipt is HADES's job (ADR-0027); the kernel logs and returns.
//
// One rule shapes the whole interface. ADR-0026: a rune number never leaves the
// kernel bridge. Callers speak ITF slots, Chon-Ji 01 through Tong-Il 24, and the
// translation to and from the kernel's v1 numbering happens here, inside the
// bridge, using the pinned table checked at load by bridge/slot_translation.js.
// No response body in this file contains a rune number. A caller who receives
// one has found a bug.
//
// Node stdlib only.

const http = require('http');
const fs = require('fs');
const path = require('path');

const { runTenetGate } = require('./cobol_bridge');
const { runRuneAuthorize } = require('./rune_bridge');
const { verifyRuneTable } = require('./rune_table_verify');
const { writeRuneTable } = require('./rune_table_writer');
const { loadRegistry, runeForSlot, patternForSlot } = require('./slot_translation');

const REPO_ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(REPO_ROOT, 'kernel', 'bin', 'BUILD-MANIFEST.json');

const PORT = Number(process.env.KERNEL_PORT || 8024);
const HOST = process.env.KERNEL_HOST || '0.0.0.0';
const MAX_BODY = 64 * 1024;

// The gates resolve table paths relative to the repo root: the path string is
// handed to the COBOL verbatim inside a 256-character field.
process.chdir(REPO_ROOT);

// ---------------------------------------------------------------------------
// Startup checks
//
// The same reasoning as the conformance runner's preflight. A gate that cannot
// start returns no verdict, and a missing verdict read as a DENY is a lie about
// what the boundary decided. Better to refuse to serve.
// ---------------------------------------------------------------------------

function startupCheck() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(
      'kernel/bin/BUILD-MANIFEST.json not found — the gates have not been built. ' +
      'Run: npm run build:kernel'
    );
  }
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

  // On Windows the built gates resolve libcob from PATH rather than from their
  // own directory. Harmless elsewhere; the manifest records where it lives.
  if (manifest.runtimeDir && fs.existsSync(manifest.runtimeDir)) {
    const already = (process.env.PATH || '')
      .split(path.delimiter)
      .some(e => e && path.resolve(e).toLowerCase() === path.resolve(manifest.runtimeDir).toLowerCase());
    if (!already) {
      process.env.PATH = manifest.runtimeDir + path.delimiter + (process.env.PATH || '');
    }
  }

  for (const gate of manifest.gates || []) {
    const exe = path.join(REPO_ROOT, 'kernel', 'bin', gate.output);
    if (!fs.existsSync(exe)) throw new Error(`Gate missing: ${exe}`);
  }

  // Refuses to load unless the translation table is a bijection.
  loadRegistry();

  // Prove one gate actually speaks the output contract before serving.
  const probe = runTenetGate({
    actorId: 'startup-probe',
    actionId: 'probe',
    sourceDomain: 'kernel',
    targetDomain: 'kernel',
    hasContract: true,
    hasProvenance: true,
    provenanceMatch: true,
    retryCount: 0,
    maxRetries: 3,
    withinQuota: true,
    anomalyDetected: false
  });
  if (!probe.decision || probe.decision === 'D' && probe.reason === 'UNKNOWN') {
    throw new Error(
      'The gates start but produce no usable DECISION line. Refusing to serve ' +
      'verdicts from a gate that is not speaking the output contract.'
    );
  }

  return manifest;
}

const MANIFEST = startupCheck();

// ---------------------------------------------------------------------------
// Request helpers
// ---------------------------------------------------------------------------

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(Object.assign(new Error('request body too large'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(Object.assign(new Error(`body is not valid JSON: ${err.message}`), { status: 400 }));
      }
    });
    req.on('error', reject);
  });
}

function send(res, status, payload) {
  const body = JSON.stringify(payload, null, 2) + '\n';
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store'
  });
  res.end(body);
}

function bad(message) {
  return Object.assign(new Error(message), { status: 400 });
}

function requireSlot(value, field) {
  if (!Number.isInteger(value) || value < 1 || value > 24) {
    throw bad(`${field} must be an integer ITF slot in 1..24, got ${JSON.stringify(value)}`);
  }
  return value;
}

// The gates read fixed-width records. A missing field would pad to spaces and
// silently become a different request, so every field is required explicitly.
function requireActionRecord(body) {
  const required = [
    'actorId', 'actionId', 'sourceDomain', 'targetDomain',
    'hasContract', 'hasProvenance', 'provenanceMatch',
    'retryCount', 'maxRetries', 'withinQuota', 'anomalyDetected'
  ];
  const missing = required.filter(f => body[f] === undefined);
  if (missing.length) {
    throw bad(
      `missing required field(s): ${missing.join(', ')}. The gate reads a ` +
      'fixed-width record and an omitted field becomes spaces, which is a ' +
      'different request than the one you meant to make.'
    );
  }
  for (const f of ['retryCount', 'maxRetries']) {
    if (!Number.isInteger(body[f]) || body[f] < 0 || body[f] > 99) {
      throw bad(`${f} must be an integer in 0..99, got ${JSON.stringify(body[f])}`);
    }
  }
  return body;
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

const routes = {
  'GET /health': async () => ({
    ok: true,
    service: 'ag3nt24-kernel',
    gates: (MANIFEST.gates || []).map(g => g.gate),
    // First line only. The full multi-line version string stays in the build
    // manifest; a health endpoint is not the place to ship a licence notice.
    compiler: ((MANIFEST.compiler || {}).version || '').split(/\r?\n/)[0] || null,
    platform: MANIFEST.platform || null
  }),

  // The 24 ITF slots. Deliberately no rune column: ADR-0026 keeps kernel
  // numbering inside the bridge, and this response crosses the boundary.
  'GET /registry': async () => ({
    schema: 'ag3nt24/registry/1',
    slots: loadRegistry().entries.map(e => ({
      slot: e.slot,
      pattern: e.pattern,
      key: e.key,
      domain: e.domain
    }))
  }),

  // tenet_gate. The five tenets, evaluated unconditionally; when several fail
  // the last one in source order owns the reported reason (ADR-0021).
  'POST /tenet': async body => {
    const verdict = runTenetGate(requireActionRecord(body));
    return {
      decision: verdict.decision,
      allow: verdict.allow,
      reason: verdict.reason
    };
  },

  // rune_authorize, spoken in ITF slots at both ends.
  //
  // "May the pattern in ITF slot `slot` exercise the capability owned by the
  // pattern in ITF slot `capabilitySlot`, on the day this table describes?"
  // Both slots translate to kernel numbering here and nowhere else.
  'POST /authorize': async body => {
    const slot = requireSlot(body.slot, 'slot');
    const capabilitySlot = requireSlot(body.capabilitySlot, 'capabilitySlot');
    if (typeof body.tablePath !== 'string' || !body.tablePath) {
      throw bad('tablePath is required and must be a string');
    }

    const authorized = runRuneAuthorize({
      callerRune: runeForSlot(slot),
      capabilityId: runeForSlot(capabilitySlot),
      tablePath: body.tablePath
    });

    const actor = patternForSlot(slot);
    const owner = patternForSlot(capabilitySlot);

    return {
      authorized,
      slot: actor.slot,
      pattern: actor.pattern,
      capabilitySlot: owner.slot,
      capabilityPattern: owner.pattern,
      tablePath: body.tablePath
    };
  },

  // rune_rotation table verification. Signature first, permutation second.
  'POST /verify-table': async body => {
    if (typeof body.tablePath !== 'string' || !body.tablePath) {
      throw bad('tablePath is required and must be a string');
    }
    const verdict = verifyRuneTable(body.tablePath);
    return { ok: verdict.ok, reason: verdict.reason, tablePath: body.tablePath };
  },

  // Generate a rotation table for an epoch day. The gate reads its epoch day as
  // input rather than from the clock, so this is reproducible on any day.
  'POST /rotation': async body => {
    if (!/^\d{8}$/.test(String(body.epochDay || ''))) {
      throw bad('epochDay is required and must be eight digits, e.g. "20260112"');
    }
    if (typeof body.sotHash64 !== 'string' || body.sotHash64.length !== 64) {
      throw bad('sotHash64 is required and must be a 64-character hash');
    }
    const written = writeRuneTable({
      epochDayYYYYMMDD: String(body.epochDay),
      sotHash64: body.sotHash64
    });
    return {
      epochDay: String(body.epochDay),
      tablePath: path.relative(REPO_ROOT, written.outPath).split(path.sep).join('/'),
      sig: written.sig
    };
  }
};

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'kernel'}`);
  const key = `${req.method} ${url.pathname}`;
  const handler = routes[key];

  if (!handler) {
    send(res, 404, { error: 'no such route', route: key, routes: Object.keys(routes) });
    return;
  }

  try {
    const body = req.method === 'POST' ? await readBody(req) : {};
    send(res, 200, await handler(body));
  } catch (err) {
    const status = err.status || 500;
    // The message is the caller's; the stack is not. A gate failure is an
    // operational fault, not a verdict, and must never read as a DENY.
    send(res, status, { error: err.message });
    if (status >= 500) console.error(`[kernel] ${key} failed: ${err.stack || err.message}`);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[kernel] ag3nt24 kernel shim listening on ${HOST}:${PORT}`);
  console.log(`[kernel] gates: ${(MANIFEST.gates || []).map(g => g.gate).join(', ')}`);
  console.log(`[kernel] compiler: ${((MANIFEST.compiler || {}).version || 'unknown').split('\n')[0]}`);
  console.log(`[kernel] platform: ${(MANIFEST.platform || {}).os}/${(MANIFEST.platform || {}).arch}`);
});

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    console.log(`[kernel] ${signal} — closing`);
    server.close(() => process.exit(0));
  });
}

module.exports = { server };
