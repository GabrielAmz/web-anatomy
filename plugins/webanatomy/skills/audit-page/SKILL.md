---
name: audit-page
description: |
  Audit the current state of a landing page, homepage, pricing page, feature page, or comparator page. Score it against a 49-point CRO rubric, diagnose it section by section, and return a PRIORITIZED list of what to fix first. Diagnosis and prioritization only, with no rewrites, no copy, and no benchmark data required. Use when the user asks to audit my page, what is wrong with my landing page, what should I fix first, review my homepage, critique this page, or shares a URL or a page in their codebase and wants direction before improving. Runs standalone with no MCP connection. Writes a handoff artifact that improve-page consumes so the grounded rewrite does not re-diagnose. For the grounded section rework use improve-page. To compare the page against the best in its industry use benchmark-compare. For real examples use find-examples.
metadata:
  version: 0.2.0
---

# Audit Page

Diagnose the current state of a page, section by section, and tell the user which
sections to revamp first and why. Apply a proven CRO framework as the lens, but
organize the audit by SECTION so the output routes straight into the fix.

You do NOT write copy, headlines, or rewrites here, and you do NOT need benchmark
data. Output is problem framing and prioritization: where conversion leaks and
what to fix first. This is the on-ramp. The grounded next step is where the real
edge is, so always end by handing off to it. There are two grounded paths and they
answer different questions, so Step 6 asks the user which one they want.

## Output Behavior

When file access is available, always write the orchestration handoff:

- `.webanatomy/audit-page/{page-or-section}-{YYYY-MM-DD}/scorecard.json` (your per-item judgments)
- `.webanatomy/audit-page/{page-or-section}-{YYYY-MM-DD}/score.json` (written by the scorer)
- `.webanatomy/audit-page/{page-or-section}-{YYYY-MM-DD}/audit.json`
- `.webanatomy/audit-page/{page-or-section}-{YYYY-MM-DD}/report.md`

`audit.json` is the machine handoff that improve-page reads so it does not
re-diagnose. The `score` block is copied verbatim from `score.json` (Step 3); do
not hand-edit those numbers. Use this exact shape:

```json
{
  "schema": "webanatomy.audit-page.v2",
  "target": "<url or page name>",
  "industry": "<resolved or inferred industry>",
  "locale": "en|fr",
  "score": {
    "overall": 0,
    "band": [0, 0],
    "coverage": 1,
    "evidenceBacked": 1,
    "evaluated": 49,
    "naCount": 0,
    "categoryScores": [
      { "category": "Hero", "score": 0, "passCount": 0, "failCount": 0, "naCount": 0, "failedItemIds": [] }
    ]
  },
  "currentSnapshot": [{ "label": "Headline", "text": "..." }],
  "recommendations": [
    {
      "section": "hero",
      "severity": "HIGH",
      "kind": "copy",
      "opportunity": "Lead the H1 with the outcome, not the product name",
      "why": "what it unlocks, tied to the real page",
      "failedItemIds": ["hero.outcome_focus"]
    }
  ],
  "pageLevel": [
    { "section": "page", "opportunity": "Fix the narrative order (pain then outcome then product)", "why": "..." }
  ],
  "sectorSpecific": [
    { "section": "contact", "opportunity": "Surface the capital-loss risk notice near the form", "why": "regulated finance; judgment, not the rubric" }
  ],
  "startHere": "hero",
  "notes": "industry inferred; capture method + confidence"
}
```

Note the split: the `score` block comes from the rubric and the scorer (Step 3,
facts). `recommendations` come from the free CRO audit (Step 4, judgment) and are
NOT derived from which rubric items failed. The optional `failedItemIds` on a
recommendation is a cross-reference only (so improve-page can target exact gaps),
not the source of the recommendation. Attach the rubric items a recommendation
relates to when there is a clean match; leave it off for judgment or sector moves
that the rubric does not cover.

`report.md` is the short human-readable version (the prioritized list below). Chat
is a one-line summary plus the start-here section.

## Two independent tracks (do not let one drive the other)

This skill produces two things by two different methods, and they must stay
dissociated:

1. **The score (facts / overview).** Run the rubric in `references/scoring.md` to
   get the overall score + category scorecard. This is the factual best-practices
   read whose job is to prove the page needs a revamp. Mechanical.
2. **The recommendations (substance).** Do a free, expert CRO audit using
   `references/cro-audit.md` (the page-cro-equivalent lens) and your judgment.
   These are NOT derived from which rubric items failed — deriving recos from the
   checklist gives detailed-but-mediocre output. A free expert read gives sharper,
   higher-ROI recommendations.

Score one way, recommend another way. They meet only at output (Step 5): score on
top as the proof, recommendations below as the substance.

## Step 1 — Context (optional, do not block)

Check `.agents/webanatomy-context.md` for product, ICP, conversion goal,
industry, and locale. If missing, proceed from the URL, screenshot, or codebase
with conservative assumptions. Context makes the problem framing specific instead
of generic; use it when present, never require it.

## Step 2 — Get the page accurately (capture, then verify in the DOM)

Prefer a canonical server capture when available: if a `capture_page` MCP tool
exists, use it — it returns reliable desktop + mobile screenshots plus
DOM-extracted structure (headings, CTAs, form fields, sections). That is the
trustworthy path and it sidesteps the failure mode below.

If you must render it yourself (no capture service), follow this recipe exactly —
a single quick screenshot is NOT enough and will lie:

1. Navigate, then **wait for network idle** so JS/iframe embeds (forms, widgets,
   proof) finish loading. Landing-page forms are often third-party embeds
   (HubSpot, Calendly) that paint after first render.
2. **Dismiss cookie/consent overlays** (Axeptio, OneTrust, etc.) — they cover the
   hero and block both the screenshot and the form.
3. **Scroll the full page** to trigger lazy-loaded sections, then screenshot
   (above-the-fold and full-page).
4. **Verify presence/absence in the DOM, never from the screenshot alone.** Query
   the DOM for form fields (`input`/`select`/`textarea`), CTAs (buttons/links),
   and section anchors. A screenshot taken too early shows a form as "missing"
   when it is actually in the DOM — do not make that mistake.

**Hard rule: never assert an element is missing from a screenshot.** "No form",
"no CTA", "no FAQ" must be confirmed against the DOM (and after networkidle +
scroll). If you cannot verify in the DOM, say "could not verify" rather than
"missing".

**The render gates the visual items.** The `mode: visual` rubric items (hierarchy,
contrast, product visual, imagery, palette, above-the-fold layout, CTA dominance)
need a real render. The `mode: text` items (messaging, copy, structure) can be
judged from the page text/DOM. If you genuinely cannot render, score the `text`
items and mark the `visual` items `n/a` in Step 3 — do not guess them. The score's
coverage and band will then reflect that the visual half was not seen.

Capture headline, subheadline, CTA, proof, product visual, hierarchy, form fields,
and visible friction into `currentSnapshot`. Do not diagnose an imagined page.

## Step 3 — Score (the facts, the overview)

You judge the items; a script does the arithmetic. This keeps the score
reproducible. Read `references/scoring.md` and follow its Method:

1. Judge each of the 49 items `pass` / `fail` / `n/a`, and for every pass/fail
   record an `evidence_source` (`dom` / `render` / `text` / `inferred`) and a short
   `evidence_note`. Score the `mode: visual` items only from a render; if you could
   not render, mark them `n/a`, note it, and score the `mode: text` items from the
   text/DOM.
2. Write `scorecard.json` (all 49 items) next to the audit.
3. Run the deterministic scorer and copy its output into the `score` block of
   `audit.json`:

   ```bash
   node <skill-dir>/scripts/score.mjs --input=.webanatomy/audit-page/{page-or-section}-{YYYY-MM-DD}/scorecard.json
   ```

   Resolve `<skill-dir>` relative to this `SKILL.md`. The script owns the weights
   and the math (category weights, coverage, evidence-backed share, confidence
   band). Do not hand-compute when node is available; only fall back to the formula
   in `scoring.md` if node cannot run.

This is the ONLY thing the rubric produces: the overall score, the 6-category
scorecard, and the confidence figures, as the factual overview and the proof the
page needs a revamp. It does NOT generate the recommendations (Step 4 does,
separately). The score is framework-relative and directional, and its band and
coverage say how solid it is; the calibrated, benchmark-anchored view is the
improve-page + MCP upgrade. Never expose item IDs, weights, or thresholds; the
overall score, the scorecard, the band, and a one-line coverage note are fine.

## Step 4 — Recommend (free CRO audit, the substance)

Now set the rubric aside and read the page as a CRO expert. Read
`references/cro-audit.md` and follow it: audit freely across value prop, headline,
CTA, hierarchy, trust, objections, friction — plus anything high-leverage the page
reveals (structure, message-match, sector compliance). Write the recommendations
from judgment, **NOT** from which rubric items failed. Deriving recos from the
checklist gives detailed-but-mediocre output; a free expert read gives sharper,
higher-ROI moves. The bar is a strong teardown (see the cro-audit lens), not a
checklist readout.

- One recommendation per distinct issue; do not bundle; be comprehensive.
- Prioritize by conversion impact — HIGH (blocks comprehension/trust/conversion),
  MEDIUM (meaningful lift), LOW (polish) — not by the score. At most two or three
  HIGHs; name the single highest-leverage fix as `startHere`.
- Type every recommendation by the kind of fix it needs: `copy` (wording, message,
  angle; the fix is rewrite alternatives, no benchmark data needed) or `design`
  (structure, layout, hierarchy, visual proof; the fix is grounded in benchmark
  sections via improve-page). This typing drives what the next skill delivers.
- Each is a concrete move tied to the real page, section-tagged, plain language
  (no item IDs). Frame as opportunities, not complaints.
- Write to be skimmed; improve-page renders these under hard budgets downstream.
  Keep each `opportunity` to one imperative line and each `why` to 2 lines max
  (under ~220 chars). One idea per sentence. Banned openers: "The page reads as",
  "It's worth noting", "This is a great opportunity to", restating the move inside
  the `why`.

Record the recommendations in `audit.json` under `recommendations` (each:
`section`, `severity`, `kind`, the `opportunity` move, `why`, and optional
`failedItemIds` when the move maps cleanly to rubric items), plus `pageLevel` and
`sectorSpecific`. These are the brief improve-page consumes.

## Step 5 — Output

The recommendations are the deliverable, so they sit at the TOP. The one-line
score is the hook; the detailed scorecard is supporting evidence and goes BELOW
the opportunities. Do not narrate the current state of the page: the reader knows
their page, they want the moves.

```
PAGE AUDIT — <url or page name>
Score: <overall>/100 (band <lo>-<hi>)   ·   <one line on where conversion leaks most>
<only when coverage < 1: "Scored on the copy and structure; visual items not evaluated (no render).">

OPPORTUNITIES (priority order)

HIGH
- **[Copy] (<section>) <the move to make>.** <what it unlocks, tied to the real page>
- **[Design] (<section>) <the move>.** <why>

MEDIUM
- **[Design] (<section>) <the move>.** <why>

LOW
- **[Copy] (<section>) <the move>.** <why>

PAGE-LEVEL
- **(page) <global move>.** <why>

SECTOR-SPECIFIC
- **(<section>) <move>.** <why> (judgment, not the rubric)

START HERE → <the single highest-leverage section>

SCORECARD
Hero <n> · Value Proposition <n> · Copywriting <n> · Trust & Credibility <n>
Conversion <n> · Design & UX <n>
```

The `[Copy]` / `[Design]` tag tells the user (and improve-page) what the fix will
look like: copy moves get 3-4 rewrite alternatives with different angles and need
no benchmark data; design moves get grounded in real benchmark sections, and when
several design findings cluster on one section, improve-page presents about 3
relevant benchmark variations of that section with why each works.

Rules for the opportunity list:

- **One opportunity per distinct issue. Do NOT bundle.** A failing item is its own
  problem: "no outcome promise", "audience not named", "no risk reducer at the
  CTA", and "generic differentiation" are four separate opportunities, not one.
  A section with five weak items produces ~five opportunities. Be comprehensive —
  the audit's job is to surface every real gap, not a tidy summary.
- **Never show internal item IDs or category internals** (no dotted ids like
  `hero.outcome_focus`, no raw weights, scores, thresholds) in this output. The
  reader sees plain-language opportunities.
- Write each as an OPPORTUNITY (the move + what it unlocks), not a complaint. Tag
  the section, the severity label, and the `[Copy]`/`[Design]` kind, order by
  conversion impact (Step 4). At most two or three HIGHs.
- Include sector-specific opportunities even when NOT in the rubric (e.g. a
  capital-loss risk notice on a regulated finance page), flagged as judgment.

State plainly that the score is directional and framework-based; the calibrated,
benchmark-anchored view (how the page compares to real industry winners) comes
from the grounded next step (benchmark-compare or improve-page) + the benchmark MCP.

No copy. No rewrites. The deliverable is "which section, why, in what order".

## Step 5.5 — Coherence check (before you output)

The score and the recommendations are produced by two independent tracks (Step 3
and Step 4 on purpose), so they can disagree. Before you output, re-read them
together and confirm they tell the same story. This is a quick self-review, not a
new analysis. Fix any mismatch silently; never show the reconciliation.

Check, and reconcile if any fails:

- **Score band vs priority mix.** A low overall score (under ~55) with no HIGH is
  incoherent: either the score is too harsh or you under-prioritized. A high
  overall score (~75+) while you list a true HIGH (a comprehension, trust, or
  conversion blocker) is also incoherent: a real blocker should pull the score
  down. Re-judge whichever track is wrong.
- **Weak categories vs where the HIGHs cluster.** The lowest-scoring categories
  should be where the highest-severity opportunities land. If your top HIGH is in
  the hero but the Hero category scored well, one of the two reads is off. Resolve it.
- **`startHere` consistency.** `startHere` must be the single highest-leverage fix,
  and it must appear as a HIGH. It cannot point at a section you scored as fine.
- **No internal contradictions.** A section cannot be both a listed strength and the
  top failure. A "missing X" finding cannot stand for an element you could not
  verify in the DOM (Step 2): downgrade it to "could not verify". A page-level move
  cannot contradict a section finding.

If the two tracks cannot be reconciled, trust the recommendations (the substance)
and adjust the score read, not the other way around.

## Step 6 — Handoff to the grounded next step (ask which)

The audit is the ungrounded on-ramp. The edge is grounding it in real benchmark
data, and there are two grounded paths. They answer different questions, so do not
choose for the user. Present both and ask which they want:

1. **See what the best in the market are doing (page and industry level).** This is
   `benchmark-compare`. It looks at the whole-page structure for the industry and
   shows how the top pages in the market handle the flagged areas, with gap labels
   and reference screenshots. Best when the user wants the market and structure
   picture before changing anything.
2. **Get the sections plus copy to follow (section level).** This is
   `improve-page`. It picks up this `audit.json`, skips re-diagnosis, pulls the
   top-converting real `<startHere>` sections in the industry, and writes the
   grounded rework the user can apply. Best when the user wants concrete sections
   and copy to follow now.

Ask it like this:

> "The highest-leverage fix is the `<startHere>` section. Two grounded next steps,
> which do you want? (a) benchmark-compare, to see how the best pages in
> <industry> are structured and handle this, the market view. (b) improve-page, to
> pull the top-converting real `<startHere>` sections in <industry> and get the
> rework and copy to follow. Either way the benchmark grounding is the difference
> between this audit and a generic CRO checklist."

If the user does not pick, default to `improve-page` on the `<startHere>` section:
the audit already named the section to fix and improve-page consumes this handoff
directly, so it is the most direct continuation.

## Hard rules (a recap; the reasoning is in the steps above)

These restate the load-bearing constraints so they are easy to find. Each one is
explained where it first appears, so treat them as a checklist, not new rules.

- Organize by section, not by dimension, so every finding routes straight into the
  fix (Step 5).
- Diagnose and prioritize only. No paste-ready copy or rewrites; the grounded
  rewrite is improve-page's job (Step 4).
- Keep a real priority gradient, at most two or three HIGHs, so "start here"
  actually points somewhere (Step 4).
- Type every recommendation `copy` or `design`, so the next skill knows whether to
  deliver rewrite alternatives or benchmark variations (Step 4).
- Audit the rendered page, not raw HTML, so the visual items reflect what a visitor
  sees (Step 2).
- Use the taxonomy section types verbatim, otherwise improve-page cannot match the
  handoff to its benchmark sections (Step 4).
- Keep findings in plain language; item IDs, weights, and thresholds are framework
  internals the reader does not need (Step 3).
- Reconcile the score and the recommendations before output, so they tell the same
  story (Step 5.5).
- Follow the shared house style for all written output: no em-dashes, "The X…" not
  "Your X…", the severity vocabulary, and never exposing framework internals. The
  canon is `webanatomy-setup/references/house-style.md`; this list is just the recap.
