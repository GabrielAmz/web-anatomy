---
name: audit-page
description: |
  Audit the current state of a landing page, homepage, pricing page, feature page, or comparator page. Score it against a 49-point CRO rubric, diagnose it section by section, and return a PRIORITIZED list of what to fix first. Scoring, diagnosis, and prioritization only — no rewrites, no copy, no benchmark data required. Use when the user asks audit my page, what is wrong with my landing page, what should I fix first, review my homepage, critique this page, or shares a URL or the page in their codebase and wants direction before improving. Runs standalone with no MCP connection. Writes a handoff artifact that improve-page consumes so the grounded rewrite does not re-diagnose. For the grounded fix use improve-page. For real examples use find-examples.
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
  "prioritizedSections": [
    {
      "section_type": "hero",
      "severity": "P0",
      "failedWeight": 0,
      "failedItemIds": ["M1", "M14"],
      "problem": "what is wrong and why it costs conversion",
      "missingLevers": ["outcome promise", "risk reducer near CTA"]
    }
  ],
  "pageLevel": [
    { "problem": "global issue (e.g. weak visual hierarchy across the page)", "failedItemIds": ["V6"] }
  ],
  "startHere": "hero",
  "notes": "industry inferred from page copy; no context file present"
}
```

`report.md` is the short human-readable version (the prioritized list below). Chat
is a one-line summary plus the start-here section.

## The framework (page-cro), reorganized by section

The CRO lens is the page-cro framework — value proposition clarity, headline,
CTA, visual hierarchy, trust and social proof, objection handling, friction, in
that impact order. The difference here: you do not report by those dimensions
(that is a generic checklist any agent runs). You apply the relevant dimensions
WITHIN each section, because people rebuild a page section by section and because
a flagged section is the exact unit improve-page works on.

## Step 1 — Context (optional, do not block)

Check `.agents/webanatomy-context.md` for product, ICP, conversion goal,
industry, and locale. If missing, proceed from the URL, screenshot, or codebase
with conservative assumptions. Context makes the problem framing specific instead
of generic; use it when present, never require it.

## Step 2 — Get the page accurately (render it)

Render the page and capture a screenshot using whatever browser/screenshot
capability you have — a headless-browser tool, your agent's built-in browser, or
a vision-capable view of a provided screenshot. Do not audit raw HTML alone:
landing pages inject the form, the proof, and the layout via JS, so source-only
reading produces false "this is missing" findings (real failure mode: calling a
form absent when it loads dynamically). See what the visitor sees.

- Codebase mode: read the source AND render the running page if you can.
- URL mode: render + screenshot the URL.

**The screenshot gates the visual items.** The `V`-prefixed rubric items (visual
hierarchy, contrast, product visual, imagery, palette, above-the-fold layout, CTA
dominance) can only be judged from a render. The `M`-prefixed items (messaging,
copy, structure) can be judged from the page text. If you genuinely cannot render
the page, say so, score the `M` items, and mark the `V` items Not-evaluable in
Step 3.5 — do not guess them.

Capture headline, subheadline, CTA, proof, product visual, hierarchy, and visible
friction into `currentSnapshot`. Do not diagnose an imagined page.

## Step 3 — Diagnose each section (apply the framework within it)

Identify which sections are PRESENT, then diagnose each against the page-cro
dimensions that matter for it, phrased in plain language. Use these section types
verbatim (they match the benchmark library, which keeps the improve-page handoff
clean):

`hero` · `value_proposition` · `problem` · `how_it_works` · `features` ·
`trust` · `testimonial` · `pricing` · `pricing_table` · `comparison` · `faq` ·
`cta` · `contact` · `use_cases` · `integrations` · `about` · `resources` ·
`navbar` · `footer`

Per-section levers (the proven CRO checks for each):

- **hero** (value prop + headline + CTA + hierarchy): clear product category; a
  specific outcome promise, not a feature list; names who it is for;
  differentiates; primary CTA above the fold; some proof above the fold; a real
  product visual; a risk reducer near the CTA; clean H1 > H2 > CTA hierarchy.
- **cta**: one clear primary action; value-loaded copy ("Get my report", not
  "Submit"/"Learn more"); reassuring microcopy beside it; a soft secondary path
  for the undecided.
- **trust**: recognizable logos; quantified proof; faces where it humanizes;
  security/compliance badges where relevant; a guarantee or risk reversal; placed
  near CTAs and after claims.
- **problem**: names the specific pain the ICP feels; resonates; sets up the
  solution.
- **how_it_works**: a clear 3-5 step path; effort/duration per step; what the
  user provides; expectation-setting.
- **features**: each tied to a benefit or outcome; not a feature dump.
- **faq**: answers the real objections (price, risk, fit, time-to-value,
  switching, data use); placed before the final CTA.
- **pricing / pricing_table**: clear tiers; a recommended plan; included vs
  excluded; answers "which plan is right for me".
- **value_proposition**: a differentiated "why us" below the fold, not a restated
  hero.
- **testimonial**: specific, attributed, benefit-diverse; not a wall.
- **contact (forms)**: minimal fields; reassuring microcopy; consent/compliance
  where the sector requires it.

For each, record `section_type`, a `problem` (what is weak/missing AND why it
costs conversion, tied to the real page, framed with "The X…" not "Your X…"), the
`missingLevers`, and a `severity`. No replacement copy — if you start writing the
headline, stop, that is improve-page.

## Step 3.5 — Score the page

Read `references/scoring.md` and run the rubric: judge each of the 49 checklist
items Pass / Fail / Not-evaluable against the page. Score the `V`-prefixed (visual)
items only from the rendered screenshot; if you could not render the page, mark
every `V` item Not-evaluable (they are excluded from the math) and note "visual
items not assessed — no render", then score on the `M` items. Compute the weighted
category scores and the overall score with the formula there. Record `score`
(overall 0-100) and `categoryScores` (per category: score, passCount, failCount)
in `audit.json`.

Use the weak categories to inform prioritization in Step 4: a category scoring
low, with high-weight Fails, points at the sections that should be P0. The score
is framework-relative and directional. The benchmark-relative score (how the page
compares to real industry winners) is the improve-page + MCP upgrade, not computed
here. Show the score and plain-language findings only; never expose the weights or
the internal math.

## Step 4 — Prioritize (deterministic, from the rollup)

Use the section rollup index in `references/scoring.md`. For each section, sum the
weights of its FAILED items = that section's failed weight. Rank sections by
failed weight (heaviest first). That ranking is the priority order — it is
derived from the actual evaluation, not vibes.

- Break ties with conversion impact: above-the-fold path (`hero`, primary `cta`,
  form friction) outranks belief/objection (`trust`, `faq`, `problem`), which
  outranks supporting (`value_proposition`, `how_it_works`, `features`,
  `pricing`), which outranks polish (`testimonial`, `about`, `footer`).
- The `page` bucket (global items: hierarchy, contrast, scannability, narrative,
  content quality, mobile-global) is NOT a section. Surface its failures as
  separate page-level findings, not as one section's fault.

**Discipline (rule, not suggestion): at most one or two P0s.** Even if three
sections score badly, P0 is reserved for the one or two with the heaviest failed
weight on the conversion path. If everything is P0 you have not prioritized. Set
`startHere` to the single highest failed-weight section.

## Step 5 — Output

```
PAGE AUDIT — <url or page name>
Score: <overall>/100   ·   <one line on where conversion leaks most>

SCORECARD
Hero <n> · Value Proposition <n> · Copywriting <n> · Trust & Credibility <n>
Conversion <n> · Design & UX <n>

OPPORTUNITIES (priority order)

P0 — Critical
1. **[Critical] (<section>) <the move to make>.** <what it unlocks and why it matters, tied to what is actually on the page>
2. **[Critical] (<section>) <the move>.** <why>

P1 — High
3. **[High] (<section>) <the move>.** <why>

P2 — Medium
4. **[Medium] (<section>) <the move>.** <why>

START HERE → <the single highest-leverage section>
```

Write each finding as an OPPORTUNITY, not a complaint: the bold title is the move
to make (the gain), and the sentence after it is what that move unlocks, grounded
in what is actually on the page. Tag every item with its section in parentheses
(from the taxonomy), use the severity label (P0/P1/P2/P3), and order by the
rollup from Step 4. Cross-cutting `page` items appear under their severity tagged
`(page)`.

Include sector-specific opportunities even when they are NOT in the 53-item
rubric (e.g. a capital-loss risk notice + consent on a regulated finance page).
Tag them with the section and mark them as sector-specific so it is clear they
come from judgment, not the checklist.

The score, scorecard, and the prioritized opportunities are the deliverable.
State plainly that this score is directional and framework-based; the calibrated,
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

## Hard rules

- Section-first, never dimension-first.
- Diagnosis and prioritization only. No paste-ready copy.
- Force a priority gradient. At most one or two P0s.
- View the rendered page, never raw HTML, when auditing a URL.
- Use the taxonomy section types verbatim so the improve-page handoff is valid.
- Plain-language findings. Never surface internal field names, scores, or
  thresholds.
- No em-dashes. "The X…" framing, not "Your X…".
