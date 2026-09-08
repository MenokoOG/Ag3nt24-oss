'use strict';

const crypto = require('crypto');

const { newEnvelope, hashEnvelope } = require('./decision_envelope');
const { PATTERNS } = require('./pattern_id');

// OODA phase order — locked to PATTERN_SOULS.md "OODA mapping" section.
const PHASE_CROSS_CUTTING = ['EUI_AM', 'YON_GAE', 'UL_JI', 'HWA_RANG', 'DAN_GUN'];
const PHASE_OBSERVE = ['SE_JONG', 'PO_EUN', 'CHON_JI'];
const PHASE_ORIENT = ['MOON_MOO', 'YOO_SIN', 'TOI_GYE', 'JUCHE'];
const PHASE_DECIDE = ['GE_BAEK', 'YUL_GOK', 'CHOI_YONG'];
const PHASE_ACT = ['SAM_IL', 'CHOONG_MOO'];
// Recovery patterns are NOT invoked inline; envelope marks rehab_recommended on deny.
const RECOVERY_PATTERNS = ['JOONG_GUN', 'CHOONG_JANG', 'SO_SAN', 'WON_HYO', 'KWANG_GAE'];

function sha256Hex(input) {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

function stableStringify(value) {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
  if (typeof value === 'object') {
    const keys = Object.keys(value).sort();
    return '{' + keys.map(k => JSON.stringify(k) + ':' + stableStringify(value[k])).join(',') + '}';
  }
  return JSON.stringify(value);
}

function isoDate() {
  return new Date().toISOString().slice(0, 10);
}

function nowIso() {
  return new Date().toISOString();
}

class OodaOrchestrator {
  constructor({ agents, kernelBridge, sotStore, othalaLog, invariants }) {
    if (!agents) throw new Error('OodaOrchestrator: agents required');
    if (!kernelBridge) throw new Error('OodaOrchestrator: kernelBridge required');
    if (!sotStore) throw new Error('OodaOrchestrator: sotStore required');
    if (!othalaLog) throw new Error('OodaOrchestrator: othalaLog required');
    if (!Array.isArray(invariants)) throw new Error('OodaOrchestrator: invariants must be array');

    this.agents = agents;
    this.kernelBridge = kernelBridge;
    this.sotStore = sotStore;
    this.othalaLog = othalaLog;
    this.invariants = invariants;
  }

  _kernelContextFrom(ctx) {
    const action = String(ctx.action || '');
    const actor = String(ctx.actor || '');
    const params = ctx.params || {};
    const evidence = ctx.evidence || {};
    const ulJiDeny = (ctx.prior_verdicts || []).some(v => v.verdict === 'DENY' && v.pattern === 'UL_JI');
    return {
      actorId: actor.slice(0, 16),
      actionId: action.slice(0, 32),
      sourceDomain: String(params.source_domain || 'USERLAND').slice(0, 16),
      targetDomain: String(params.target_domain || 'SOT_LEDGER').slice(0, 16),
      hasContract: !!evidence.contract,
      hasProvenance: !!evidence.provenance,
      provenanceMatch: !!evidence.provenance_match,
      retryCount: Number(params.retry_count) || 0,
      maxRetries: Number(params.max_retries) || 3,
      withinQuota: evidence.within_quota !== false,
      anomalyDetected: ulJiDeny
    };
  }

  _runAgent(patternKey, ctx, patternVerdicts) {
    const agent = this.agents.agentByPattern(patternKey);
    const v = agent.evaluate(ctx);
    patternVerdicts.push(v);
    ctx.prior_verdicts = patternVerdicts.slice();
    return v;
  }

  _runPhase(patterns, ctx, patternVerdicts) {
    for (const pat of patterns) {
      const v = this._runAgent(pat, ctx, patternVerdicts);
      if (v.verdict === 'DENY') {
        return { shortCircuit: { phase: 'gate', agent: pat, verdict: v } };
      }
    }
    return { shortCircuit: null };
  }

  _runKernel(ctx, patternVerdicts) {
    const kernelCtx = this._kernelContextFrom(ctx);
    const k = this.kernelBridge.runTenetGate(kernelCtx);
    const kernelEntry = {
      pattern: 'KERNEL',
      capability: 'DETERMINISTIC_FLOOR',
      verdict: k.allow ? 'ALLOW' : 'DENY',
      reason_code: 'KERNEL_' + k.decision,
      evidence_hash: sha256Hex(stableStringify(kernelCtx)),
      contributing_facts: {
        kernel_reason: k.reason,
        kernel_decision: k.decision,
        raw_output: k.rawOutput || null
      },
      agent_version: 'cobol-kernel-v1'
    };
    patternVerdicts.push(kernelEntry);
    ctx.prior_verdicts = patternVerdicts.slice();
    return kernelEntry;
  }

  _synthesizeReasonText(merged, patternVerdicts) {
    if (merged.verdict === 'ALLOW') {
      return 'Action allowed: all gates produced ALLOW; Tong-Il consensus merge confirmed.';
    }
    const denier = patternVerdicts.find(v =>
      v.verdict === merged.verdict
      && (v.pattern === merged.pattern || v.reason_code === merged.reason_code)
    );
    const patternDoctrine = denier && PATTERNS[denier.pattern];
    if (patternDoctrine) {
      return `Action ${merged.verdict.toLowerCase()}: ${denier.pattern} (${patternDoctrine.tenet}) — ${denier.reason_code}.`;
    }
    return `Action ${merged.verdict.toLowerCase()}: ${merged.reason_code}.`;
  }

  _synthesizeRemediation(merged, patternVerdicts) {
    if (merged.verdict === 'ALLOW') return 'No operator action required.';
    const denier = patternVerdicts.find(v =>
      v.verdict === merged.verdict
      && (v.pattern === merged.pattern || v.reason_code === merged.reason_code)
    );
    const patternDoctrine = denier && PATTERNS[denier.pattern];
    if (!patternDoctrine) return 'Review failed verdict and re-submit corrected action.';
    if (merged.verdict === 'HOLD') {
      return `Provide additional evidence to clear ${denier.pattern}; expected signal: ${patternDoctrine.failure_mode}`;
    }
    return `Address the failure mode of ${denier.pattern}: ${patternDoctrine.failure_mode}`;
  }

  run(context) {
    const ctx = Object.assign(
      { action: '', actor: '', params: {}, evidence: {} },
      context || {},
      { prior_verdicts: [] }
    );

    const patternVerdicts = [];

    // 1. Cross-cutting (except DO_SAN) — runs first so UL_JI is available to kernel.
    let stop = this._runPhase(PHASE_CROSS_CUTTING, ctx, patternVerdicts);
    let shortCircuit = stop.shortCircuit;

    // 2. Observe
    if (!shortCircuit) {
      stop = this._runPhase(PHASE_OBSERVE, ctx, patternVerdicts);
      shortCircuit = stop.shortCircuit;
    }

    // 3. Kernel (deterministic floor)
    let kernelEntry = null;
    if (!shortCircuit) {
      kernelEntry = this._runKernel(ctx, patternVerdicts);
      if (kernelEntry.verdict === 'DENY') {
        shortCircuit = { phase: 'kernel', agent: 'KERNEL', verdict: kernelEntry };
      }
    }

    // 4. Orient
    if (!shortCircuit) {
      stop = this._runPhase(PHASE_ORIENT, ctx, patternVerdicts);
      shortCircuit = stop.shortCircuit;
    }

    // 5. Decide (excluding Tong-Il)
    if (!shortCircuit) {
      stop = this._runPhase(PHASE_DECIDE, ctx, patternVerdicts);
      shortCircuit = stop.shortCircuit;
    }

    // 6. Tong-Il consensus merge — sees everything before it.
    let tongIlVerdict = null;
    if (!shortCircuit) {
      tongIlVerdict = this._runAgent('TONG_IL', ctx, patternVerdicts);
    }

    // 7. Act phase — only runs if Tong-Il ALLOWed; act denies can still flip to DENY.
    let actDeny = null;
    if (!shortCircuit && tongIlVerdict && tongIlVerdict.verdict === 'ALLOW') {
      for (const pat of PHASE_ACT) {
        const v = this._runAgent(pat, ctx, patternVerdicts);
        if (v.verdict === 'DENY') {
          actDeny = v;
          break;
        }
      }
    }

    // 8. DO_SAN decorator — runs last, in every flow.
    const doSan = this.agents.agentByPattern('DO_SAN');
    const doSanVerdict = doSan.evaluate(ctx);
    patternVerdicts.push(doSanVerdict);

    // Determine merged verdict.
    let merged;
    if (shortCircuit) {
      const sv = shortCircuit.verdict;
      merged = {
        pattern: sv.pattern || shortCircuit.agent,
        verdict: sv.verdict,
        reason_code: sv.reason_code,
        merged_at: nowIso()
      };
    } else if (actDeny) {
      merged = {
        pattern: actDeny.pattern,
        verdict: 'DENY',
        reason_code: actDeny.reason_code,
        merged_at: nowIso()
      };
    } else if (tongIlVerdict) {
      merged = {
        pattern: 'TONG_IL',
        verdict: tongIlVerdict.verdict,
        reason_code: tongIlVerdict.reason_code,
        merged_at: nowIso()
      };
    } else {
      // Defensive fallback (should not occur in normal flow).
      merged = { pattern: 'TONG_IL', verdict: 'DENY', reason_code: 'NO_MERGE', merged_at: nowIso() };
    }

    const reason_text = this._synthesizeReasonText(merged, patternVerdicts);
    const remediation = this._synthesizeRemediation(merged, patternVerdicts);

    // Envelope construction.
    const sotHash = this.sotStore.sotHash();
    const evidenceHash = sha256Hex(stableStringify(ctx.evidence || {}));
    const policyHash = sha256Hex(stableStringify(this.invariants));
    const tableHash = '0'.repeat(64); // Phase 5+ binds to the actual rotated table hash.
    const nonce = crypto.randomBytes(16).toString('base64');

    const lastEntry = this.othalaLog.tail(1)[0];
    const previous_decision_hash = lastEntry && lastEntry.decision_certificate
      ? hashEnvelope(lastEntry.decision_certificate)
      : null;

    const envelope = newEnvelope({
      epoch_day: isoDate(),
      action_id: String(ctx.action || ''),
      source_domain: String((ctx.params && ctx.params.source_domain) || 'USERLAND'),
      target_domain: String((ctx.params && ctx.params.target_domain) || 'SOT_LEDGER'),
      sot_hash: sotHash,
      evidence_hash: evidenceHash,
      policy_hash: policyHash,
      table_hash: tableHash,
      nonce,
      previous_decision_hash,
      pattern_verdicts: patternVerdicts,
      merged_verdict: merged
    });

    envelope.actor = String(ctx.actor || '');
    envelope.invariants_declared = this.invariants.slice();
    envelope.reason_text = reason_text;
    envelope.remediation = remediation;
    envelope.rehab_recommended = merged.verdict !== 'ALLOW';
    if (envelope.rehab_recommended) {
      envelope.rehab_targets = RECOVERY_PATTERNS.slice();
    }

    const allow = merged.verdict === 'ALLOW';

    const contributing_facts = {
      phase_results: {
        cross_cutting: PHASE_CROSS_CUTTING.map(p => patternVerdicts.find(v => v.pattern === p)).filter(Boolean).map(v => `${v.pattern}:${v.verdict}`),
        observe: PHASE_OBSERVE.map(p => patternVerdicts.find(v => v.pattern === p)).filter(Boolean).map(v => `${v.pattern}:${v.verdict}`),
        kernel: kernelEntry ? `KERNEL:${kernelEntry.verdict}` : 'KERNEL:skipped',
        orient: PHASE_ORIENT.map(p => patternVerdicts.find(v => v.pattern === p)).filter(Boolean).map(v => `${v.pattern}:${v.verdict}`),
        decide: PHASE_DECIDE.map(p => patternVerdicts.find(v => v.pattern === p)).filter(Boolean).map(v => `${v.pattern}:${v.verdict}`),
        tong_il: tongIlVerdict ? tongIlVerdict.verdict : 'skipped',
        act: PHASE_ACT.map(p => patternVerdicts.find(v => v.pattern === p)).filter(Boolean).map(v => `${v.pattern}:${v.verdict}`)
      },
      short_circuit: shortCircuit ? { phase: shortCircuit.phase, pattern: shortCircuit.agent } : null
    };

    return {
      allow,
      decision_certificate: envelope,
      reason_code: merged.reason_code,
      reason_text,
      contributing_facts
    };
  }
}

module.exports = {
  OodaOrchestrator,
  PHASE_CROSS_CUTTING,
  PHASE_OBSERVE,
  PHASE_ORIENT,
  PHASE_DECIDE,
  PHASE_ACT,
  RECOVERY_PATTERNS
};
