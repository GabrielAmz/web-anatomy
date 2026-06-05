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

// Canonical registry: [id, category, weight, mode]. This is the single source of
// truth for the rubric id set; scoring.md must stay in sync. Mode is text (judged
// from copy/DOM) or visual (needs a render); it gates which items go n/a with no
// render and does not affect the math.
const ITEMS = [
  // Hero
  ['hero.audience_clarity', 'Hero', 10, 'text'], ['hero.outcome_focus', 'Hero', 10, 'text'],
  ['hero.five_second_test', 'Hero', 10, 'visual'], ['hero.numeric_proof', 'Hero', 9, 'visual'],
  ['hero.differentiation', 'Hero', 9, 'text'], ['hero.risk_reducer', 'Hero', 8, 'visual'],
  ['hero.product_visual', 'Hero', 8, 'visual'],
  // Value Proposition
  ['value_prop.specific_promise', 'Value Proposition', 9, 'text'], ['value_prop.promise_alignment', 'Value Proposition', 8, 'text'],
  ['value_prop.evidence_backed', 'Value Proposition', 8, 'text'], ['value_prop.problem_clarity', 'Value Proposition', 8, 'text'],
  ['value_prop.message_simplicity', 'Value Proposition', 8, 'text'], ['value_prop.unlike_framing', 'Value Proposition', 7, 'text'],
  ['value_prop.feature_outcome', 'Value Proposition', 7, 'text'],
  // Copywriting
  ['copy.action_cta', 'Copywriting', 8, 'text'], ['copy.objection_handling', 'Copywriting', 8, 'text'],
  ['copy.narrative', 'Copywriting', 8, 'text'], ['copy.transformation', 'Copywriting', 7, 'text'],
  ['copy.benefit_headings', 'Copywriting', 7, 'text'], ['copy.plain_language', 'Copywriting', 7, 'text'],
  ['copy.consistent_cta', 'Copywriting', 6, 'text'], ['copy.secondary_cta', 'Copywriting', 5, 'text'],
  ['copy.you_centric', 'Copywriting', 5, 'text'],
  // Trust & Credibility
  ['trust.quantified_proof', 'Trust & Credibility', 8, 'text'], ['trust.customer_logos', 'Trust & Credibility', 7, 'visual'],
  ['trust.before_after_testimonial', 'Trust & Credibility', 7, 'text'], ['trust.content_quality', 'Trust & Credibility', 7, 'text'],
  ['trust.niche_testimonials', 'Trust & Credibility', 7, 'text'], ['trust.human_social_proof', 'Trust & Credibility', 6, 'visual'],
  ['trust.trust_badges', 'Trust & Credibility', 6, 'visual'], ['trust.policy_transparency', 'Trust & Credibility', 5, 'visual'],
  ['trust.linked_proof', 'Trust & Credibility', 5, 'text'],
  // Conversion
  ['conversion.pricing_visibility', 'Conversion', 8, 'text'], ['conversion.cta_dominance', 'Conversion', 7, 'visual'],
  ['conversion.cta_repetition', 'Conversion', 7, 'visual'], ['conversion.low_commitment_cta', 'Conversion', 7, 'text'],
  ['conversion.post_submit_clarity', 'Conversion', 6, 'text'], ['conversion.urgency', 'Conversion', 5, 'visual'],
  // Design & UX
  ['design.authentic_imagery', 'Design & UX', 8, 'visual'], ['design.visual_hierarchy', 'Design & UX', 8, 'visual'],
  ['design.color_contrast', 'Design & UX', 8, 'visual'], ['design.scannability', 'Design & UX', 7, 'visual'],
  ['design.nav_structure', 'Design & UX', 7, 'visual'], ['design.page_focus', 'Design & UX', 7, 'visual'],
  ['design.palette_consistency', 'Design & UX', 6, 'visual'], ['design.interactive_product', 'Design & UX', 6, 'visual'],
  ['design.faq', 'Design & UX', 6, 'visual'], ['design.visual_tone', 'Design & UX', 5, 'visual'],
  ['design.footer', 'Design & UX', 5, 'visual'],
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

const ITEM_MAP = new Map(ITEMS.map(([id, category, weight, mode]) => [id, { category, weight, mode }]));
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
