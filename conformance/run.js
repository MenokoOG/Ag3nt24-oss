'use strict';

// Conformance gate for the Windows kernel port.
//
// The four COBOL gates ported as source, not as binaries — the carried .bin
// files are Linux ELF and cannot run on the Windows-only target. This suite is
// what proves the rebuilt gates reach the same verdicts the originals did.
// A changed verdict means the port is wrong and stops. Expectations are pinned
// in conformance/expected.json and derived by reading the COBOL; they are never
// adjusted to make a run pass.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const BIN_DIR = path.join(REPO_ROOT, 'kernel', 'bin');
const MANIFEST_PATH = path.join(BIN_DIR, 'BUILD-MANIFEST.json');

// Scenarios declare table paths relative to the repo root ('out/...') and those
// strings are handed to the COBOL gate verbatim inside a 256-char field, so the
// process cwd has to be the repo root for them to resolve.
process.chdir(REPO_ROOT);

// ---------------------------------------------------------------------------
// Preflight
//
// The built gates link against libcob and the C runtime DLLs that live beside
// cobc.exe, and Windows resolves those from PATH rather than from the gate's own
// directory. A gate that cannot start returns no verdict — and a missing verdict
// compared against a pinned one reads as "the port is wrong" when it is really
// "the runtime is not on PATH". That misdiagnosis is worth spending twenty lines
// to prevent, because this suite's whole job is to make a changed verdict mean
// something.
// ---------------------------------------------------------------------------

function preflight() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(
      'kernel/bin/BUILD-MANIFEST.json not found — the gates have not been built.\n' +
      'Run: npm run build:kernel'
    );
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

  if (manifest.runtimeDir && fs.existsSync(manifest.runtimeDir)) {
    const entries = (process.env.PATH || '').split(path.delimiter);
    const present = entries.some(
      e => e && path.resolve(e).toLowerCase() === path.resolve(manifest.runtimeDir).toLowerCase()
    );
    if (!present) {
      process.env.PATH = manifest.runtimeDir + path.delimiter + (process.env.PATH || '');
      console.log(`  PATH += ${manifest.runtimeDir}  (COBOL runtime, from build manifest)`);
    }
  }

  for (const gate of manifest.gates || []) {
    const exe = path.join(BIN_DIR, gate.output);
    if (!fs.existsSync(exe)) {
      throw new Error(`Gate missing: ${exe}\nRun: npm run build:kernel`);
    }
  }

  // Prove one gate actually starts before any verdict is read.
  const probe = path.join(BIN_DIR, 'tenet_gate.exe');
  const proc = spawnSync(probe, { input: ' '.repeat(89), encoding: 'utf8' });
  if (proc.error) {
    throw new Error(
      `The kernel gates will not start: ${proc.error.message}\n` +
      `This is a runtime-loading problem, not a verdict. Ensure ` +
      `${manifest.runtimeDir || 'the GnuCOBOL bin directory'} is on PATH and rebuild.`
    );
  }
  if (!String(proc.stdout || '').includes('DECISION=')) {
    throw new Error(
      'The kernel gates start but produce no DECISION line. Refusing to compare ' +
      'verdicts against a gate that is not speaking the output contract.\n' +
      `stdout: ${JSON.stringify(proc.stdout)}\nstderr: ${JSON.stringify(proc.stderr)}`
    );
  }

  console.log(`  kernel built with: ${(manifest.compiler || {}).version || 'unknown'}`);
  return manifest;
}

const { runTenetGate } = require('../bridge/cobol_bridge');
const { runRuneAuthorize } = require('../bridge/rune_bridge');
const { verifyRuneTable } = require('../bridge/rune_table_verify');
const { writeRuneTable } = require('../bridge/rune_table_writer');

const EXPECTED = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'expected.json'), 'utf8')
);

const SCENARIO_DIR = path.join(REPO_ROOT, 'prior-art', 'a24-v1', 'scenarios');
const SCENARIO_FILES = [
  'scenario_A_valid.js',
  'scenario_B_drift.js',
  'scenario_C_retry.js',
  'scenario_D_rotation.js',
  'scenario_E_tamper.js'
];

const OUT_DIR = path.join(REPO_ROOT, 'out');

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function buildFixtures() {
  const { epochDays, sotHash64, tamper } = EXPECTED.fixtures;

  for (const epochDayYYYYMMDD of epochDays) {
    const written = writeRuneTable({ epochDayYYYYMMDD, sotHash64 });
    console.log(`  wrote ${path.relative(REPO_ROOT, written.outPath)}  sig ${written.sig}`);
  }

  const sourcePath = path.join(REPO_ROOT, tamper.sourceTable);
  const outputPath = path.join(REPO_ROOT, tamper.outputTable);

  // Mutate exactly one byte: the last character of the first mapping line.
  const raw = fs.readFileSync(sourcePath, 'utf8');
  const firstBreak = raw.indexOf('\n');
  if (firstBreak < 1) {
    throw new Error(`Cannot tamper ${tamper.sourceTable}: no first line found`);
  }
  const target = firstBreak - 1;
  const original = raw[target];
  const replacement = original === '0' ? '1' : '0';
  const tampered = raw.slice(0, target) + replacement + raw.slice(target + 1);

  if (tampered === raw) {
    throw new Error('Tamper produced an identical file');
  }

  fs.writeFileSync(outputPath, tampered, 'utf8');
  console.log(
    `  wrote ${path.relative(REPO_ROOT, outputPath)}  ` +
    `byte ${target} '${original}' -> '${replacement}'`
  );
}

// ---------------------------------------------------------------------------
// Step execution
// ---------------------------------------------------------------------------

// The carried scenarios A and D step 0 request a rune/capability pair that went
// stale when the placeholder rotation table was replaced with real kernel output
// at the v1.0.0 freeze. prior-art/a24-v1/ is the archive of record and is never
// edited, so the correction is applied here, declared in expected.json, and
// announced on every run — the divergence between the archive and what actually
// executes stays visible rather than becoming folklore.
function applyAuthCorrection(scenarioName, index, step) {
  const corrections =
    (EXPECTED.fixtures.authInputCorrections || {}).byScenarioStep || {};
  const key = `${scenarioName}/${index}`;
  const correction = corrections[key];

  if (!correction || !step.authInput) return step;

  const from = correction.from || {};
  const actual = step.authInput;
  for (const field of Object.keys(from)) {
    if (actual[field] !== from[field]) {
      throw new Error(
        `Correction for ${key} expects authInput.${field} = ${from[field]} in the ` +
        `archive but found ${actual[field]}. The archive changed under the ` +
        'correction; re-derive it rather than letting it apply blind.'
      );
    }
  }

  console.log(
    `  ${key}: authInput ` +
    `(rune ${from.callerRune}, capability ${from.capabilityId}) -> ` +
    `(rune ${correction.to.callerRune}, capability ${correction.to.capabilityId})`
  );

  return { ...step, authInput: { ...actual, ...correction.to } };
}

function executeStep(step) {
  const actual = { result: 'ALLOW' };
  let denied = false;

  if (step.tenetInput) {
    const gate = runTenetGate(step.tenetInput);
    actual.tenet = {
      decision: gate.decision,
      allow: gate.allow,
      reason: gate.reason
    };
    if (!gate.allow) denied = true;
  }

  if (step.verifyTable) {
    const verdict = verifyRuneTable(step.verifyTable);
    actual.tableVerify = {
      path: step.verifyTable,
      ok: verdict.ok,
      reason: verdict.reason
    };
    if (!verdict.ok) denied = true;
  }

  if (step.authInput) {
    const authorized = runRuneAuthorize(step.authInput);
    actual.auth = {
      callerRune: step.authInput.callerRune,
      capabilityId: step.authInput.capabilityId,
      authorized,
      // Convention declared by the archive itself — see the runner hint in
      // prior-art/a24-v1/scenarios/scenario_D_rotation.js.
      authReason: authorized ? null : 'NOT_AUTHORIZED_FOR_TODAY'
    };
    if (!authorized) denied = true;
  }

  actual.result = denied ? 'DENY' : 'ALLOW';
  return actual;
}

// ---------------------------------------------------------------------------
// Comparison
// ---------------------------------------------------------------------------

const COMPARED_FIELDS = {
  tenet: ['decision', 'allow', 'reason'],
  tableVerify: ['ok', 'reason'],
  auth: ['authorized', 'authReason']
};

function compare(expected, actual) {
  const mismatches = [];

  if (expected.result !== actual.result) {
    mismatches.push({
      field: 'result',
      expected: expected.result,
      actual: actual.result
    });
  }

  for (const [block, fields] of Object.entries(COMPARED_FIELDS)) {
    if (!expected[block]) continue;

    if (!actual[block]) {
      mismatches.push({
        field: block,
        expected: 'present',
        actual: 'absent — the step did not run this check'
      });
      continue;
    }

    for (const field of fields) {
      const e = expected[block][field];
      const a = actual[block][field];
      if (e !== a) {
        mismatches.push({
          field: `${block}.${field}`,
          expected: e,
          actual: a
        });
      }
    }
  }

  // A check the expectations never pinned is itself a drift signal.
  for (const block of Object.keys(COMPARED_FIELDS)) {
    if (actual[block] && !expected[block]) {
      mismatches.push({
        field: block,
        expected: 'not pinned in expected.json',
        actual: 'present'
      });
    }
  }

  return mismatches;
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

const SCENARIO_HEADERS = ['SCENARIO', 'STEP', 'CHECK', 'EXPECTED', 'ACTUAL', 'RESULT'];

function renderTable(rows, headers = SCENARIO_HEADERS) {
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map(r => String(r[i]).length))
  );

  const line = (cells, pad = ' ') =>
    cells.map((c, i) => String(c).padEnd(widths[i], pad)).join('  ');

  const out = [];
  out.push(line(headers));
  out.push(line(widths.map(w => ''.padEnd(w, '-')), '-'));
  for (const row of rows) out.push(line(row));
  return out.join('\n');
}

function describe(value) {
  if (value === null) return 'null';
  if (value === '') return "'' (spaces)";
  return String(value);
}

function checkRows(scenarioName, expected, actual, mismatches) {
  const failed = new Set(mismatches.map(m => m.field));
  const rows = [];
  const stepLabel = `${expected.index}: ${expected.name}`;

  const add = (check, e, a) => {
    rows.push([
      scenarioName,
      stepLabel,
      check,
      describe(e),
      describe(a),
      failed.has(check) ? 'FAIL' : 'PASS'
    ]);
  };

  if (expected.tenet) {
    add('tenet.decision', expected.tenet.decision, actual.tenet && actual.tenet.decision);
    add('tenet.reason', expected.tenet.reason, actual.tenet && actual.tenet.reason);
  }
  if (expected.tableVerify) {
    add('tableVerify.ok', expected.tableVerify.ok, actual.tableVerify && actual.tableVerify.ok);
    add('tableVerify.reason', expected.tableVerify.reason, actual.tableVerify && actual.tableVerify.reason);
  }
  if (expected.auth) {
    add('auth.authorized', expected.auth.authorized, actual.auth && actual.auth.authorized);
    add('auth.authReason', expected.auth.authReason, actual.auth && actual.auth.authReason);
  }
  add('result', expected.result, actual.result);

  return rows;
}

function reportMismatch(scenarioName, stepSpec, expected, actual, mismatches) {
  console.error('');
  console.error('='.repeat(78));
  console.error(`VERDICT CHANGED — ${scenarioName} step ${expected.index}: ${expected.name}`);
  console.error('='.repeat(78));
  console.error('');
  console.error('A changed verdict means the port is wrong. expected.json is not to be');
  console.error('adjusted to make this pass.');
  console.error('');
  console.error('Full input record for this step:');
  console.error(JSON.stringify(stepSpec, null, 2));
  console.error('');
  for (const m of mismatches) {
    console.error(`  ${m.field}`);
    console.error(`    expected: ${describe(m.expected)}`);
    console.error(`    actual:   ${describe(m.actual)}`);
  }
  console.error('');
  console.error('Full expected verdict:');
  console.error(JSON.stringify(expected, null, 2));
  console.error('');
  console.error('Full actual verdict:');
  console.error(JSON.stringify(actual, null, 2));
  if (expected.auth && mismatches.some(m => m.field.startsWith('auth'))) {
    console.error('');
    console.error('NOTE: this step\'s auth expectation is declared by the scenario, not');
    console.error('derived from the COBOL. See fixtures.OPEN_QUESTION in expected.json —');
    console.error('the rotation seed did not carry across with the scenarios.');
  }
}

// ---------------------------------------------------------------------------
// Registry and translation — Phase 2, ADR-0026
//
// Phase 1 proved the rebuilt gates reach the same verdicts the originals did.
// That says nothing about whether the numbers handed to them mean what the
// caller thinks they mean. The kernel numbers the 24 in the v1.0.0 order and
// everything else in this framework numbers them in ITF syllabus order; the two
// coincide in exactly one slot, Hwa-Rang at 8. An off-by-one-order bug would
// route a request to the wrong pattern and still come back with a clean verdict.
// These two checks are what closes that gap.
//
// Print discipline, from ADR-0026: a rune number is a kernel-side identifier
// and nothing else. It appears only in the RUNE and CAP columns of the two
// tables below, which are the translation columns. No other line printed by
// this file contains one, failure lines included — a failure names ITF slots
// and pattern names, and says a rune mismatched without printing it. A reviewer
// who finds a rune number anywhere else has found a bug.
// ---------------------------------------------------------------------------

const {
  loadRegistry,
  slotForRune,
  patternForSlot
} = require('../bridge/slot_translation');

const REGISTRY_HEADERS = ['ITF', 'PATTERN', 'DOMAIN', 'RUNE', 'RESULT'];
const JOIN_HEADERS = [
  'RUNE', 'CAP', 'ITF', 'ACTOR PATTERN', 'ITF', 'HOLDS CAPABILITY OF', 'RESULT'
];

const pad2 = n => String(n).padStart(2, '0');

// The 24 slots, each row checked against the hand-derived pin.
function checkRegistry() {
  // Throws unless the table is 24 entries, slots 1..24 contiguous, runes a
  // bijection onto 1..24, no repeated key or pattern.
  const registry = loadRegistry();

  const pinned = (EXPECTED.registry || {}).slots;
  if (!Array.isArray(pinned) || pinned.length !== 24) {
    throw new Error(
      'expected.json has no registry.slots block with 24 rows. The registry is ' +
      'checked against a pin derived by hand from ADR-0002, ADR-0015 and ' +
      'ADR-0026, not against itself.'
    );
  }

  const rows = [];
  const failures = [];

  for (const want of pinned) {
    const got = registry.bySlot.get(want.slot);
    const reasons = [];

    if (!got) {
      reasons.push(`ITF slot ${pad2(want.slot)} is missing from the registry`);
    } else {
      if (got.pattern !== want.pattern) {
        reasons.push(`pattern is ${got.pattern}, pinned ${want.pattern}`);
      }
      if (got.key !== want.key) {
        reasons.push(`key is ${got.key}, pinned ${want.key}`);
      }
      if (got.domain !== want.domain) {
        reasons.push(`domain is ${JSON.stringify(got.domain)}, pinned ${JSON.stringify(want.domain)}`);
      }
      if (got.rune !== want.rune) {
        // Deliberately not printed. See the print discipline note above.
        reasons.push('the rune translation does not match the pinned ADR-0026 table');
      }
    }

    rows.push([
      pad2(want.slot),
      got ? got.pattern : '(missing)',
      got ? got.domain : '(missing)',
      got ? pad2(got.rune) : '--',
      reasons.length ? 'FAIL' : 'PASS'
    ]);

    if (reasons.length) failures.push({ slot: want.slot, pattern: want.pattern, reasons });
  }

  return { rows, failures };
}

// The kernel's own day-20260112 rotation table, read back through the
// translation. Both columns are v1 numbers: the left is a rune, the right is a
// v1 capability slot, and capability n is owned by the pattern in v1 slot n.
function checkJoin() {
  const tablePath = path.join(OUT_DIR, 'rune_table_20260112.csv');
  const relative = path.relative(REPO_ROOT, tablePath);
  const text = fs.readFileSync(tablePath, 'utf8');

  const pairs = [];
  for (const raw of text.split(/\r?\n/)) {
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith('SIG,')) continue;
    const m = /^(\d{2}),(\d{2})$/.exec(trimmed);
    if (!m) throw new Error(`${relative}: cannot parse mapping line ${JSON.stringify(trimmed)}`);
    pairs.push([Number(m[1]), Number(m[2])]);
  }
  if (pairs.length !== 24) {
    throw new Error(`${relative}: expected 24 mapping lines, found ${pairs.length}`);
  }

  const pinned = (EXPECTED.registry || {}).joinDay20260112;
  if (!Array.isArray(pinned) || pinned.length !== 24) {
    throw new Error('expected.json has no registry.joinDay20260112 block with 24 rows');
  }

  const rows = [];
  const failures = [];
  const actorSlots = new Set();
  const capabilitySlots = new Set();

  pairs.forEach(([rune, capability], index) => {
    const actor = patternForSlot(slotForRune(rune));
    const owner = patternForSlot(slotForRune(capability));

    // A repeat on either side means the rotation table is not a permutation of
    // the 24, or the translation is not a bijection. Either way the resolved
    // table is meaningless and there is nothing to compare.
    if (actorSlots.has(actor.slot)) {
      throw new Error(
        `${relative}: ITF slot ${pad2(actor.slot)} ${actor.pattern} appears twice on the actor side`
      );
    }
    if (capabilitySlots.has(owner.slot)) {
      throw new Error(
        `${relative}: ITF slot ${pad2(owner.slot)} ${owner.pattern} appears twice on the capability side`
      );
    }
    actorSlots.add(actor.slot);
    capabilitySlots.add(owner.slot);

    const want = pinned[index];
    const reasons = [];

    if (want.rune !== rune || want.capability !== capability) {
      reasons.push('the regenerated rotation table row is not the pinned one');
    }
    if (want.actorSlot !== actor.slot || want.actorPattern !== actor.pattern) {
      reasons.push(
        `actor resolves to ITF slot ${pad2(actor.slot)} ${actor.pattern}, ` +
        `pinned ITF slot ${pad2(want.actorSlot)} ${want.actorPattern}`
      );
    }
    if (want.capabilitySlot !== owner.slot || want.capabilityPattern !== owner.pattern) {
      reasons.push(
        `capability resolves to ITF slot ${pad2(owner.slot)} ${owner.pattern}, ` +
        `pinned ITF slot ${pad2(want.capabilitySlot)} ${want.capabilityPattern}`
      );
    }

    rows.push([
      pad2(rune),
      pad2(capability),
      pad2(actor.slot),
      actor.pattern,
      pad2(owner.slot),
      owner.pattern,
      reasons.length ? 'FAIL' : 'PASS'
    ]);

    if (reasons.length) failures.push({ index, reasons });
  });

  if (actorSlots.size !== 24) {
    throw new Error(`${relative}: only ${actorSlots.size} distinct ITF slots on the actor side, expected 24`);
  }
  if (capabilitySlots.size !== 24) {
    throw new Error(`${relative}: only ${capabilitySlots.size} distinct ITF slots on the capability side, expected 24`);
  }

  return { rows, failures };
}

function reportTranslationFailures(label, failures) {
  console.error('');
  console.error('='.repeat(78));
  console.error(`TRANSLATION CHANGED — ${label}`);
  console.error('='.repeat(78));
  console.error('');
  console.error('The pin in expected.json was derived by hand from ADR-0002, ADR-0015 and');
  console.error('ADR-0026. It is not to be adjusted to make this pass.');
  console.error('');
  for (const f of failures) {
    const where = f.pattern
      ? `ITF slot ${pad2(f.slot)} ${f.pattern}`
      : `row ${f.index + 1}`;
    console.error(`  ${where}`);
    for (const reason of f.reasons) console.error(`    ${reason}`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log('Ag3nt24 kernel conformance — Windows port');
  console.log('');
  console.log('Preflight:');
  preflight();
  console.log('');
  console.log('Building rune table fixtures:');
  buildFixtures();
  console.log('');

  console.log('');
  console.log('Applying declared fixture corrections:');

  const rows = [];
  const failures = [];
  let checksTotal = 0;
  let checksPassed = 0;

  for (const file of SCENARIO_FILES) {
    const scenario = require(path.join(SCENARIO_DIR, file));
    const expectedScenario = EXPECTED.scenarios[scenario.name];

    if (!expectedScenario) {
      throw new Error(`No expectations pinned for scenario ${scenario.name}`);
    }
    if (expectedScenario.steps.length !== scenario.steps.length) {
      throw new Error(
        `${scenario.name}: expected.json pins ${expectedScenario.steps.length} ` +
        `steps, the scenario declares ${scenario.steps.length}`
      );
    }

    scenario.steps.forEach((archiveStep, index) => {
      const expected = expectedScenario.steps[index];
      const stepSpec = applyAuthCorrection(scenario.name, index, archiveStep);
      const actual = executeStep(stepSpec);
      const mismatches = compare(expected, actual);

      const stepRows = checkRows(scenario.name, expected, actual, mismatches);
      rows.push(...stepRows);
      checksTotal += stepRows.length;
      checksPassed += stepRows.filter(r => r[5] === 'PASS').length;

      if (mismatches.length > 0) {
        failures.push({ scenario: scenario.name, expected, actual, mismatches, stepSpec });
      }
    });
  }

  console.log(renderTable(rows));
  console.log('');

  // --- Phase 2: registry and translation -----------------------------------

  console.log('Registry — 24 ITF slots (ADR-0002 order, ADR-0015 domains, ADR-0026 translation):');
  const registryResult = checkRegistry();
  console.log(renderTable(registryResult.rows, REGISTRY_HEADERS));
  console.log('');
  const registryTotal = registryResult.rows.length;
  const registryPassed = registryResult.rows.filter(r => r[r.length - 1] === 'PASS').length;
  checksTotal += registryTotal;
  checksPassed += registryPassed;

  console.log('Kernel rotation table, epoch day 20260112, resolved to ITF patterns:');
  const joinResult = checkJoin();
  console.log(renderTable(joinResult.rows, JOIN_HEADERS));
  console.log('');
  const joinTotal = joinResult.rows.length;
  const joinPassed = joinResult.rows.filter(r => r[r.length - 1] === 'PASS').length;
  checksTotal += joinTotal;
  checksPassed += joinPassed;

  const scenariosTotal = SCENARIO_FILES.length;
  const scenariosFailed = new Set(failures.map(f => f.scenario)).size;
  const scenariosMatched = scenariosTotal - scenariosFailed;

  for (const f of failures) {
    reportMismatch(f.scenario, f.stepSpec, f.expected, f.actual, f.mismatches);
  }
  if (registryResult.failures.length > 0) {
    reportTranslationFailures('registry, 24 ITF slots', registryResult.failures);
  }
  if (joinResult.failures.length > 0) {
    reportTranslationFailures('kernel rotation table for epoch day 20260112', joinResult.failures);
  }

  console.log(`checks:    ${checksPassed}/${checksTotal} match`);
  console.log(`scenarios: ${scenariosMatched}/${scenariosTotal} match`);
  console.log(`registry: ${registryPassed}/${registryTotal} match`);
  console.log(`join: ${joinPassed}/${joinTotal} match`);
  console.log('');
  console.log(`${scenariosMatched}/${scenariosTotal} match`);

  const translationFailed =
    registryResult.failures.length > 0 || joinResult.failures.length > 0;

  if (failures.length > 0) {
    console.log('');
    console.log('CONFORMANCE FAILED — the port does not reproduce the pinned verdicts.');
    process.exit(1);
  }
  if (translationFailed) {
    console.log('');
    console.log('CONFORMANCE FAILED — the translation does not reproduce the pinned slots.');
    process.exit(1);
  }

  console.log('');
  console.log('CONFORMANCE PASSED');
}

try {
  main();
} catch (err) {
  console.error('');
  console.error(`CONFORMANCE ERROR: ${err.message}`);
  if (err.code === 'ENOENT') {
    console.error('');
    console.error('If this names a kernel/bin/*.exe, the gates have not been built.');
    console.error('Run: npm run build:kernel');
  }
  process.exit(1);
}
