'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const agentsModule = require('./agents');
const kernelBridge = require('../bridge/cobol_bridge');
const { makeSotStore } = require('./sot_store');
const { makeOthalaLog } = require('./othala_log');
const { OodaOrchestrator } = require('./ooda_orchestrator');

// Phase 4 license stub. Real Ed25519-signed validation lands in Phase 6 (Gumroad).
// Returns valid even when the key is unreadable so dev workflows are unblocked.
function validateLicense(licenseKey) {
  let key = licenseKey || process.env.A24_LICENSE_KEY || null;
  if (!key) {
    const fallbackPath = path.join(os.homedir(), '.coil', 'a24.license');
    try {
      key = fs.readFileSync(fallbackPath, 'utf8').trim();
    } catch (err) {
      key = null;
    }
  }
  return {
    valid: true,
    tier: 'DEVELOPER',
    max_agents: 100,
    key_present: !!key
  };
}

class TenetGate {
  constructor(opts) {
    const o = opts || {};
    if (!Array.isArray(o.invariants)) {
      throw new Error('TenetGate: invariants array required');
    }

    this.invariants = o.invariants.slice();
    this.license = validateLicense(o.licenseKey);
    if (!this.license.valid) {
      throw new Error('TenetGate: license not valid');
    }

    this.sotStore = makeSotStore(o.sotStorePath);
    this.othalaLog = makeOthalaLog(o.othalaLogPath);

    this.orchestrator = new OodaOrchestrator({
      agents: agentsModule,
      kernelBridge,
      sotStore: this.sotStore,
      othalaLog: this.othalaLog,
      invariants: this.invariants
    });
  }

  evaluate(context) {
    return new Promise((resolve, reject) => {
      try {
        const result = this.orchestrator.run(context);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  commit(decision_certificate, result) {
    return new Promise((resolve, reject) => {
      try {
        if (!decision_certificate || !decision_certificate.decision_id) {
          throw new Error('TenetGate.commit: decision_certificate.decision_id required');
        }
        // Idempotent: skip if already committed.
        if (this.othalaLog.hasDecisionId(decision_certificate.decision_id)) {
          resolve({ committed: false, reason: 'ALREADY_COMMITTED' });
          return;
        }
        this.othalaLog.append(decision_certificate, result || null);
        this.sotStore.updateSot(decision_certificate, result || null);
        resolve({ committed: true });
      } catch (err) {
        reject(err);
      }
    });
  }

  denyHistory(opts) {
    const o = opts || {};
    const since = o.since ? new Date(o.since) : null;
    const limit = Number.isInteger(o.limit) && o.limit > 0 ? o.limit : null;
    const all = this.othalaLog.allEntries();
    let denied = all.filter(e => {
      const dc = e.decision_certificate || {};
      const mv = dc.merged_verdict || {};
      return mv.verdict && mv.verdict !== 'ALLOW';
    });
    if (since) {
      denied = denied.filter(e => {
        const t = new Date(e.committed_at);
        return !isNaN(t) && t >= since;
      });
    }
    if (limit !== null) {
      denied = denied.slice(-limit);
    }
    return denied;
  }
}

module.exports = {
  TenetGate,
  validateLicense
};
