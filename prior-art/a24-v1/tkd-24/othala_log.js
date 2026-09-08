'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULT_PATH = path.resolve(__dirname, '..', 'out', 'othala.log');

function ensureDir(p) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
}

function safeReadLines(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return raw.split('\n').filter(l => l.trim().length > 0);
  } catch (err) {
    return [];
  }
}

function parseLine(line) {
  try {
    return JSON.parse(line);
  } catch (err) {
    return null;
  }
}

function loadEntries(filePath) {
  return safeReadLines(filePath).map(parseLine).filter(Boolean);
}

function makeOthalaLog(logPath) {
  const filePath = logPath || DEFAULT_PATH;

  function append(decision_certificate, result) {
    ensureDir(filePath);
    const entry = {
      committed_at: new Date().toISOString(),
      decision_certificate,
      result: result || null
    };
    fs.appendFileSync(filePath, JSON.stringify(entry) + '\n', 'utf8');
  }

  function hasDecisionId(decision_id) {
    if (!decision_id) return false;
    const entries = loadEntries(filePath);
    return entries.some(e => e.decision_certificate && e.decision_certificate.decision_id === decision_id);
  }

  function tail(n) {
    const entries = loadEntries(filePath);
    const count = Math.max(0, Number(n) || 0);
    return entries.slice(-count);
  }

  function searchByActor(actorId) {
    const entries = loadEntries(filePath);
    return entries.filter(e => {
      const dc = e.decision_certificate || {};
      return dc.action_id !== undefined && (dc.actor === actorId || dc.action_id === actorId);
    }).concat(entries.filter(e => {
      const dc = e.decision_certificate || {};
      return dc.actor === actorId;
    })).filter((e, i, arr) => arr.indexOf(e) === i);
  }

  function searchByAction(actionId) {
    const entries = loadEntries(filePath);
    return entries.filter(e => {
      const dc = e.decision_certificate || {};
      return dc.action_id === actionId;
    });
  }

  function allEntries() {
    return loadEntries(filePath);
  }

  return {
    path: filePath,
    append,
    hasDecisionId,
    tail,
    searchByActor,
    searchByAction,
    allEntries
  };
}

module.exports = {
  makeOthalaLog,
  DEFAULT_PATH
};
