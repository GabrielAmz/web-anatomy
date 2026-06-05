#!/usr/bin/env node
// Deterministic scorer for the audit-page rubric.
//
// The agent judges each of the 49 items and writes a scorecard.json
// (id, status, evidence_source, evidence_note). This script owns the arithmetic
// so the same judgments always produce the same numbers, with no LLM math drift.
//
// Usage:
//   node score.mjs --input=<path/to/scorecard.json> [--output=<path/to/score.json>]
//
// Writes score.json next to the input (or to --output) and prints the result JSON
// to stdout. Exits non-zero with a clear message on any validation problem.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

// id -> category. Item weights are intrinsic to each item (from the rubric).
const ITEMS = [
  // Hero
  ['M1', 'Hero', 10], ['M14', 'Hero', 10], ['V1', 'Hero', 10], ['V2', 'Hero', 9],
  ['M15', 'Hero', 9], ['V23', 'Hero', 8], ['V22', 'Hero', 8],
  // Value Proposition
  ['M2', 'Value Proposition', 9], ['M3', 'Value Proposition', 8], ['M4', 'Value Proposition', 8],
  ['M23', 'Value Proposition', 8], ['M37', 'Value Proposition', 8], ['M17', 'Value Proposition', 7],
  ['M35', 'Value Proposition', 7],
  // Copywriting
  ['M18', 'Copywriting', 8], ['M9', 'Copywriting', 8], ['M39', 'Copywriting', 8],
  ['M21', 'Copywriting', 7], ['M6', 'Copywriting', 7], ['M26', 'Copywriting', 7],
  ['M19', 'Copywriting', 6], ['M20', 'Copywriting', 5], ['M5', 'Copywriting', 5],
  // Trust & Credibility
  ['M8', 'Trust & Credibility', 8], ['V14', 'Trust & Credibility', 7], ['M22', 'Trust & Credibility', 7],
  ['M33', 'Trust & Credibility', 7], ['M41', 'Trust & Credibility', 7], ['V12', 'Trust & Credibility', 6],
  ['V15', 'Trust & Credibility', 6], ['V17', 'Trust & Credibility', 5], ['M34', 'Trust & Credibility', 5],
  // Conversion
  ['M36', 'Conversion', 8], ['V3', 'Conversion', 7], ['V13', 'Conversion', 7],
  ['M38', 'Conversion', 7], ['M32', 'Conversion', 6], ['V25', 'Conversion', 5],
  // Design & UX
  ['V4', 'Design & UX', 8], ['V6', 'Design & UX', 8], ['V9', 'Design & UX', 8],
  ['V5', 'Design & UX', 7], ['V19', 'Design & UX', 7], ['V24', 'Design & UX', 7],
  ['V7', 'Design & UX', 6], ['V16', 'Design & UX', 6], ['V20', 'Design & UX', 6],
  ['V8', 'Design & UX', 5], ['V21', 'Design & UX', 5],
];

const CATEGORY_WEIGHTS = {
  'Hero': 1.5,
  'Value Proposition': 1.5,
  'Trust & Credibility': 1.25,
  'Conversion': 1.25,
  'Copywriting': 1.0,
  'Design & UX': 1.0,
};

const CATEGORY_ORDER = ['Hero', 'Value Proposition', 'Copywriting', 'Trust & Credibility', 'Conversion', 'Design & UX'];

const ITEM_MAP = new Map(ITEMS.map(([id, category, weight]) => [id, { category, weight }]));
const VALID_STATUS = new Set(['pass', 'fail', 'n/a']);
const VALID_EVIDENCE = new Set(['dom', 'render', 'text', 'inferred']);

function fail(msg) {
  console.error(`score.mjs: ${msg}`);
  process.exit(1);
}

function getArg(name) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
}

function normalizeStatus(s) {
  const v = String(s || '').trim().toLowerCase();
  if (v === 'na' || v === 'not_evaluable' || v === 'not-evaluable' || v === 'n_a') return 'n/a';
  return v;
}

const inputPath = getArg('input');
if (!inputPath) fail('missing --input=<path to scorecard.json>');

let raw;
try {
  raw = JSON.parse(readFileSync(inputPath, 'utf8'));
} catch (e) {
  fail(`could not read or parse ${inputPath}: ${e.message}`);
}

const items = Array.isArray(raw?.items) ? raw.items : null;
if (!items) fail('scorecard must have an "items" array');

// Validate: every id known, all 49 present exactly once, statuses and evidence valid.
const seen = new Map();
for (const it of items) {
  const id = it?.id;
  if (!ITEM_MAP.has(id)) fail(`unknown item id "${id}" (not in the 49-item rubric)`);
  if (seen.has(id)) fail(`duplicate item id "${id}"`);
  const status = normalizeStatus(it.status);
  if (!VALID_STATUS.has(status)) fail(`item "${id}" has invalid status "${it.status}" (use pass | fail | n/a)`);
  if (status !== 'n/a') {
    const ev = String(it.evidence_source || '').trim().toLowerCase();
    if (!VALID_EVIDENCE.has(ev)) fail(`item "${id}" (${status}) needs evidence_source one of dom|render|text|inferred`);
  }
  seen.set(id, { ...it, status });
}
const missing = ITEMS.map(([id]) => id).filter((id) => !seen.has(id));
if (missing.length) fail(`scorecard is missing ${missing.length} item(s): ${missing.join(', ')}`);

// Compute per category.
const catAgg = new Map(CATEGORY_ORDER.map((c) => [c, { wSum: 0, wHit: 0, pass: 0, fail: 0, na: 0, failedIds: [] }]));
let evaluated = 0;
let evidenceHard = 0; // dom + render among evaluated

for (const [id, meta] of ITEM_MAP) {
  const rec = seen.get(id);
  const agg = catAgg.get(meta.category);
  const status = rec.status;
  if (status === 'n/a') { agg.na += 1; continue; }
  evaluated += 1;
  agg.wSum += meta.weight;
  if (status === 'pass') { agg.wHit += meta.weight; agg.pass += 1; }
  else { agg.fail += 1; agg.failedIds.push(id); }
  const ev = String(rec.evidence_source).toLowerCase();
  if (ev === 'dom' || ev === 'render') evidenceHard += 1;
}

const categoryScores = [];
let catWeightedSum = 0;
let catWeightTotal = 0;
for (const category of CATEGORY_ORDER) {
  const agg = catAgg.get(category);
  const evaluatedInCat = agg.pass + agg.fail;
  const score = evaluatedInCat > 0 ? Math.round((agg.wHit / agg.wSum) * 100) : null;
  categoryScores.push({
    category,
    score,
    passCount: agg.pass,
    failCount: agg.fail,
    naCount: agg.na,
    failedItemIds: agg.failedIds,
  });
  if (score !== null) {
    const w = CATEGORY_WEIGHTS[category];
    catWeightedSum += score * w;
    catWeightTotal += w;
  }
}

const overall = catWeightTotal > 0 ? Math.round(catWeightedSum / catWeightTotal) : null;
const coverage = Math.round((evaluated / ITEMS.length) * 100) / 100;
const evidenceBacked = evaluated > 0 ? Math.round((evidenceHard / evaluated) * 100) / 100 : 0;
const half = Math.round((1 - evidenceBacked) * 10);
const band = overall === null ? null : [Math.max(0, overall - half), Math.min(100, overall + half)];

const result = {
  schema: 'webanatomy.score.v1',
  overall,
  band,
  coverage,
  evidenceBacked,
  evaluated,
  naCount: ITEMS.length - evaluated,
  categoryScores,
};

const outputPath = getArg('output') || join(dirname(inputPath), 'score.json');
writeFileSync(outputPath, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
