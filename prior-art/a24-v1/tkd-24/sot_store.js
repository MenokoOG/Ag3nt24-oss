'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DEFAULT_PATH = path.resolve(__dirname, '..', 'out', 'sot_store.json');
const VERSION = 'A24-SOT-v1';

function ensureDir(p) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
}

function sha256Hex(input) {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

// Stable-sorted JSON for hash-stable SoT serialization.
function stableStringify(value) {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
  if (typeof value === 'object') {
    const keys = Object.keys(value).sort();
    return '{' + keys.map(k => JSON.stringify(k) + ':' + stableStringify(value[k])).join(',') + '}';
  }
  return JSON.stringify(value);
}

function defaultSot() {
  return { version: VERSION, state: {}, last_update: null };
}

function readSotFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.version) {
      return parsed;
    }
    return defaultSot();
  } catch (err) {
    return defaultSot();
  }
}

function makeSotStore(storePath) {
  const filePath = storePath || DEFAULT_PATH;

  function readSot() {
    return readSotFile(filePath);
  }

  function writeSot(sot) {
    ensureDir(filePath);
    fs.writeFileSync(filePath, JSON.stringify(sot, null, 2), 'utf8');
  }

  function sotHash() {
    const sot = readSot();
    return sha256Hex(stableStringify(sot));
  }

  function updateSot(decision_certificate, result) {
    const sot = readSot();
    const actionId = decision_certificate.action_id || 'unknown';
    const decisionId = decision_certificate.decision_id || 'unknown';
    sot.state[actionId] = {
      last_decision_id: decisionId,
      last_result: result || null,
      last_committed_at: new Date().toISOString()
    };
    sot.last_update = new Date().toISOString();
    writeSot(sot);
    return sha256Hex(stableStringify(sot));
  }

  return {
    path: filePath,
    readSot,
    writeSot,
    sotHash,
    updateSot
  };
}

module.exports = {
  makeSotStore,
  DEFAULT_PATH,
  VERSION
};
