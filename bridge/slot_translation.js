'use strict';

// ITF slot <-> rune number translation.
//
// ADR-0002 rules that the framework numbers the 24 in ITF syllabus order,
// Chon-Ji (01) through Tong-Il (24), and that slot numbers are what telemetry,
// cost attribution and receipts key on. The COBOL kernel numbers the same 24 in
// the v1.0.0 order (Eui-Am 1 through Dan-Gun 24) and its rotation tables and
// rune_authorize operate on those numbers. The two orders coincide in exactly
// one slot, Hwa-Rang at 8.
//
// ADR-0026 rules the resolution: the kernel stays byte-identical and a single
// pinned table translates at the bridge. This module is that table's only
// reader. An ITF slot goes in, a rune number comes out, and it goes back the
// other way when a rotation table is read. Capability numbers in a rotation
// table are v1 capability slots and translate through the same table, because
// capability n is owned by the pattern sitting in v1 slot n.
//
// The invariant is checked at load, not at call. A table that is not a
// bijection would silently route a request to the wrong pattern, and a wrong
// pattern that still returns ALLOW is the failure this whole boundary exists to
// prevent. Better to refuse to load.
//
// Node stdlib only.

const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, '..', 'conformance', 'registry.json');

let cached = null;

function fail(message) {
  throw new Error(
    `registry invariant violated (${path.relative(path.join(__dirname, '..'), REGISTRY_PATH)}): ${message}\n` +
    'ADR-0026 requires this table to be a bijection between ITF slots 1-24 and ' +
    'rune numbers 1-24. Refusing to translate against a table that is not one.'
  );
}

// ---------------------------------------------------------------------------
// Load and validate
// ---------------------------------------------------------------------------

function loadRegistry() {
  if (cached) return cached;

  let raw;
  try {
    raw = fs.readFileSync(REGISTRY_PATH, 'utf8');
  } catch (err) {
    throw new Error(`registry not readable at ${REGISTRY_PATH}: ${err.message}`);
  }

  let doc;
  try {
    doc = JSON.parse(raw);
  } catch (err) {
    fail(`not valid JSON: ${err.message}`);
  }

  if (doc.schema !== 'ag3nt24/registry/1') {
    fail(`unknown schema ${JSON.stringify(doc.schema)}, expected "ag3nt24/registry/1"`);
  }

  const entries = doc.entries;
  if (!Array.isArray(entries)) fail('entries is not an array');
  if (entries.length !== 24) fail(`${entries.length} entries, expected exactly 24`);

  const bySlot = new Map();
  const byRune = new Map();
  const keys = new Set();
  const patterns = new Set();

  for (const entry of entries) {
    const { slot, rune, key, pattern, domain } = entry;

    if (!Number.isInteger(slot) || slot < 1 || slot > 24) {
      fail(`slot ${JSON.stringify(slot)} is not an integer in 1..24`);
    }
    if (!Number.isInteger(rune) || rune < 1 || rune > 24) {
      fail(`slot ${slot}: rune ${JSON.stringify(rune)} is not an integer in 1..24`);
    }
    if (typeof key !== 'string' || key.length === 0) {
      fail(`slot ${slot}: key is missing or empty`);
    }
    if (typeof pattern !== 'string' || pattern.length === 0) {
      fail(`slot ${slot}: pattern is missing or empty`);
    }
    if (typeof domain !== 'string' || domain.length === 0) {
      fail(`slot ${slot}: domain is missing or empty`);
    }

    if (bySlot.has(slot)) fail(`slot ${slot} appears more than once`);
    if (byRune.has(rune)) {
      fail(`rune ${rune} claimed by both slot ${byRune.get(rune).slot} and slot ${slot}`);
    }
    if (keys.has(key)) fail(`key ${key} appears more than once`);
    if (patterns.has(pattern)) fail(`pattern ${pattern} appears more than once`);

    bySlot.set(slot, entry);
    byRune.set(rune, entry);
    keys.add(key);
    patterns.add(pattern);
  }

  // Contiguity. The size checks above make this near-redundant, and it is kept
  // because "24 distinct slots in 1..24" and "slots 1..24" are the same claim
  // only while both bounds hold, and a future edit could loosen one of them.
  for (let slot = 1; slot <= 24; slot += 1) {
    if (!bySlot.has(slot)) fail(`slot ${slot} is missing; slots must be 1..24 contiguous`);
  }
  for (let rune = 1; rune <= 24; rune += 1) {
    if (!byRune.has(rune)) fail(`rune ${rune} is unclaimed; runes must cover 1..24`);
  }

  cached = Object.freeze({
    schema: doc.schema,
    why: doc.why,
    derivedFrom: doc.derivedFrom,
    entries: Object.freeze(entries.slice().sort((a, b) => a.slot - b.slot)),
    bySlot,
    byRune
  });

  return cached;
}

// ---------------------------------------------------------------------------
// Translation
// ---------------------------------------------------------------------------

// ITF slot -> rune number. Call this on the way into the kernel.
function runeForSlot(slot) {
  const entry = loadRegistry().bySlot.get(slot);
  if (!entry) throw new Error(`no ITF slot ${JSON.stringify(slot)}; slots are 1..24`);
  return entry.rune;
}

// rune number -> ITF slot. Call this when reading a rotation table.
function slotForRune(rune) {
  const entry = loadRegistry().byRune.get(rune);
  if (!entry) throw new Error(`no rune ${JSON.stringify(rune)}; rune numbers are 1..24`);
  return entry.slot;
}

// The whole registry row for an ITF slot: pattern, key, domain, rune.
function patternForSlot(slot) {
  const entry = loadRegistry().bySlot.get(slot);
  if (!entry) throw new Error(`no ITF slot ${JSON.stringify(slot)}; slots are 1..24`);
  return entry;
}

// A capability number in a rotation table is a v1 capability slot, and
// capability n is owned by the pattern in v1 slot n. Same table, same lookup.
function slotForCapability(capability) {
  return slotForRune(capability);
}

function patternForCapability(capability) {
  return patternForSlot(slotForRune(capability));
}

module.exports = {
  loadRegistry,
  runeForSlot,
  slotForRune,
  patternForSlot,
  slotForCapability,
  patternForCapability
};
