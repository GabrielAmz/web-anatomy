---
name: audit-page
description: |
  Audit the current state of a landing page, homepage, pricing page, feature page, or comparator page. Score it against a 49-point CRO rubric, diagnose it section by section, and return a PRIORITIZED list of what to fix first. Diagnosis and prioritization only, with no rewrites, no copy, and no benchmark data required. Use when the user asks to audit my page, what is wrong with my landing page, what should I fix first, review my homepage, critique this page, or shares a URL or a page in their codebase and wants direction before improving. Runs standalone with no MCP connection. Writes a handoff artifact that improve-page consumes so the grounded rewrite does not re-diagnose. For the grounded fix use improve-page. For real examples use find-examples.
metadata:
  version: 0.1.0
---

# Audit Page

Diagnose the current state of a page, section by section, and tell the user which
sections to revamp first and why. Apply a proven CRO framework as the lens, but
organize the audit by SECTION so the output routes straight into the fix.

You do NOT write copy, headlines, or rewrites here, and you do NOT need benchmark
data. Output is problem framing and prioritization: where conversion leaks and
what to fix first. This is the on-ramp. The grounded rework (improve-page) is
where the real edge is, so always end by handing off to it.

## Output Behavior

When file access is available, always write the orchestration handoff:

- `.webanatomy/audit-page/{page-or-section}-{YYYY-MM-DD}/audit.json`
- `.webanatomy/audit-page/{page-or-section}-{YYYY-MM-DD}/report.md`

`audit.json` is the machine handoff that improve-page reads so it does not
re-diagnose. Use this exact shape:

```json
{
  "schema": "webanatomy.audit-page.v1",
  "target": "<url or page name>",
  "industry": "<resolved or inferred industry>",
  "locale": "en|fr",
  "score": 0,
  "categoryScores": [
    { "category": "Hero", "score": 0, "passCount": 0, "failCount": 0 }
  ],
  "currentSnapshot": [{ "label": "Headline", "text": "..." }],
  "recommendations": [
    {
      "section": "hero",
      "severity": "P0",
      "opportunity": "Lead the H1 with the outcome, not the product name",
      "why": "what it unlocks, tied to the real page"
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

Note the split: `score` + `categoryScores` come from the rubric (Step 3, facts).
`recommendations` come from the free CRO audit (Step 4, judgment) — they are NOT
keyed to rubric items.

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

**The render gates the visual items.** The `V`-prefixed rubric items (hierarchy,
contrast, product visual, imagery, palette, above-the-fold layout, CTA dominance)
need a real render. The `M`-prefixed items (messaging, copy, structure) can be
judged from the page text/DOM. If you genuinely cannot render, score the `M`
items and mark the `V` items Not-evaluable in Step 3 — do not guess them.

Capture headline, subheadline, CTA, proof, product visual, hierarchy, form fields,
and visible friction into `currentSnapshot`. Do not diagnose an imagined page.

## Step 3 — Score (the facts, the overview)

Read `references/scoring.md` and run the rubric: judge each of the 49 items Pass /
Fail / Not-evaluable. Score the `V` (visual) items only from a render; if you
could not render, mark them Not-evaluable (excluded from the math), note it, and
score the `M` items. Compute the weighted category scores and the overall score
with the formula there. Record `score` and `categoryScores` in `audit.json`.

This is the ONLY thing the rubric produces: the overall score + the 6-category
scorecard, as the factual overview and the proof the page needs a revamp. It does
NOT generate the recommendations (Step 4 does, separately). The score is
framework-relative and directional; the calibrated, benchmark-anchored view is the
improve-page + MCP upgrade. Never expose item IDs, weights, or thresholds.

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
- Prioritize by conversion impact — P0 (blocks comprehension/trust/conversion),
  P1, P2, P3 — not by the score. At most one or two P0s; name the single
  highest-leverage fix as `startHere`.
- Each is a concrete move tied to the real page, section-tagged, plain language
  (no item IDs). Frame as opportunities, not complaints.

Record the recommendations in `audit.json` under `recommendations` (each:
`section`, `severity`, the `opportunity` move, `why`), plus `pageLevel` and
`sectorSpecific`. These are the brief improve-page consumes.

## Step 5 — Output

The score and scorecard sit at the TOP as the overview — they give the read at a
glance and prove the page needs a revamp. They are the hook, not the substance.
The opportunities below are the substance.

```
PAGE AUDIT — <url or page name>
Score: <overall>/100   ·   <one line on where conversion leaks most>

SCORECARD
Hero <n> · Value Proposition <n> · Copywriting <n> · Trust & Credibility <n>
Conversion <n> · Design & UX <n>

OPPORTUNITIES (priority order)

P0 — Critical
- **[Critical] (<section>) <the move to make>.** <what it unlocks, tied to the real page>

P1 — High
- **[High] (<section>) <the move>.** <why>
- **[High] (<section>) <the move>.** <why>

P2 — Medium
- **[Medium] (<section>) <the move>.** <why>

PAGE-LEVEL
- **(page) <global move>.** <why>

SECTOR-SPECIFIC
- **(<section>) <move>.** <why> (judgment, not the rubric)

START HERE → <the single highest-leverage section>
```

Rules for the opportunity list:

- **One opportunity per distinct issue. Do NOT bundle.** A failing item is its own
  problem: "no outcome promise", "audience not named", "no risk reducer at the
  CTA", and "generic differentiation" are four separate opportunities, not one.
  A section with five weak items produces ~five opportunities. Be comprehensive —
  the audit's job is to surface every real gap, not a tidy summary.
- **Never show internal item IDs or category internals** (no `M1`, `V23`, raw
  weights, scores, thresholds) in this output. The reader sees plain-language
  opportunities.
- Write each as an OPPORTUNITY (the move + what it unlocks), not a complaint. Tag
  the section, use the severity label, order by conversion impact (Step 4). At
  most one or two P0s.
- Include sector-specific opportunities even when NOT in the rubric (e.g. a
  capital-loss risk notice on a regulated finance page), flagged as judgment.

State plainly that the score is directional and framework-based; the calibrated,
benchmark-anchored view (how the page compares to real industry winners) comes
from improve-page + the benchmark MCP.

No copy. No rewrites. The deliverable is "which section, why, in what order".

## Step 6 — Handoff to improve-page (orchestration)

After presenting the order, offer the grounded fix and hand off to improve-page,
which reads the `audit.json` you just wrote and skips re-diagnosis — it goes
straight to pulling real winners for the flagged sections and writing the
grounded rework. Say it like this:

> "The highest-leverage fix is the `<startHere>` section. Run improve-page next —
> it picks up this audit, pulls the top-converting real `<startHere>` sections in
> <industry>, and writes the grounded rework. That benchmark grounding is the
> difference between this audit and a generic CRO checklist."

## Hard rules (a recap; the reasoning is in the steps above)

These restate the load-bearing constraints so they are easy to find. Each one is
explained where it first appears, so treat them as a checklist, not new rules.

- Organize by section, not by dimension, so every finding routes straight into the
  fix (Step 5).
- Diagnose and prioritize only. No paste-ready copy or rewrites; the grounded
  rewrite is improve-page's job (Step 4).
- Keep a real priority gradient, at most one or two P0s, so "start here" actually
  points somewhere (Step 4).
- Audit the rendered page, not raw HTML, so the visual items reflect what a visitor
  sees (Step 2).
- Use the taxonomy section types verbatim, otherwise improve-page cannot match the
  handoff to its benchmark sections (Step 4).
- Keep findings in plain language; item IDs, weights, and thresholds are framework
  internals the reader does not need (Step 3).
- The findings copy avoids em-dashes and frames around "The X…", not "Your X…", to
  match house style.
