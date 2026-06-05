# Audit Page — Scoring Method & Checklist

This is a self-contained, offline scoring rubric. The agent evaluates each item
against the page, then computes the scores with the formula below. No backend and
no benchmark data are required.

This score is **framework-relative** (how the page does against proven CRO
criteria). It is directional. The **benchmark-relative** score — how the page
compares to the real top-converting pages in its industry — is the `improve-page`
+ MCP upgrade, and is not computed here.

## Method (status_weighted, deterministic)

You do the judging. A script does the arithmetic. This split is what makes the
score reproducible: the same judgments always produce the same number, with no
LLM math drift.

### Step A — Judge each item with evidence

For all 49 items, assign a status and record where the verdict came from:

- **pass** — the page clearly satisfies the `pass_rule`. Multiplier `1.0`.
- **fail** — the page does not satisfy it. Multiplier `0.0`.
- **n/a** — the item genuinely does not apply to this page type (rare; do not use
  to dodge a hard call). Excluded from the math.

Every `pass`/`fail` item also records an **evidence source**, so the score is
auditable and reproducible rather than a guess:

- `dom` — decided from the extracted DOM (counts, presence, attributes). Most
  reliable. Prefer this whenever the item is countable (nav items, CTA repetition,
  footer sections, pricing link).
- `render` — decided from a real screenshot (visual items: hierarchy, contrast,
  above-the-fold layout).
- `text` — decided from the page copy (messaging and wording items).
- `inferred` — a reasoned read with no hard observation. Use sparingly. An item
  decided on `inferred` may NOT assert that an element is absent (honesty rule): if
  you cannot observe it, it is `n/a` or a `fail` with a stated assumption, never a
  confident "missing".

Be honest. A generous audit that inflates the score is useless. When in doubt
between pass and fail, fail and explain why in the section problem.

### Step B — Write the scorecard, then run the scorer

Write a `scorecard.json` (one object per item) next to the audit:

```json
{
  "schema": "webanatomy.scorecard.v1",
  "items": [
    { "id": "M1",  "status": "pass", "evidence_source": "text", "evidence_note": "hero names product and EU SaaS finance teams" },
    { "id": "V19", "status": "fail", "evidence_source": "dom",  "evidence_note": "9 top-level nav links, threshold is 4-7" }
  ]
}
```

All 49 ids must be present. `n/a` items may omit `evidence_source`. Then run the
shared scorer from this skill pack:

```bash
node <skill-dir>/scripts/score.mjs --input=.webanatomy/audit-page/{target}-{date}/scorecard.json
```

Resolve `<skill-dir>` relative to this skill. The script is the single source of
truth for the numbers: it holds the item weights and category weights, validates
the scorecard, excludes `n/a`, and writes `score.json` with the overall score, the
six category scores, pass/fail/na counts, the failed-item ids per category, and the
confidence figures below. Copy those values into `audit.json`. Only fall back to
hand-computing if node cannot run.

### The math the script applies (for reference, do not hand-compute when node runs)

- Category score = `round( Σ(weight × multiplier) / Σ(weight) × 100 )` over that
  category's evaluated (pass/fail) items only.
- Overall score = `round( Σ(category_score × category_weight) / Σ(category_weight) )`
  over categories with at least one evaluated item. Category weights:

  | Category | Weight | Why |
  |---|---|---|
  | Hero | 1.5 | Gates comprehension above the fold |
  | Value Proposition | 1.5 | Caps everything below it |
  | Trust & Credibility | 1.25 | Gates the decision |
  | Conversion | 1.25 | Gates the action |
  | Copywriting | 1.0 | Support |
  | Design & UX | 1.0 | Support |

- **Coverage** = `evaluated / 49` (how much of the rubric actually applied;
  the rest is `n/a`).
- **Evidence-backed** = `(dom + render count) / evaluated` (how much of the score
  rests on hard observation versus text or inference).
- **Confidence band** = `overall ± round((1 - evidenceBacked) × 10)`, clamped to
  0-100. A score built mostly on `inferred` reads gets a wider band, so the number
  is honest about its own softness (for example "64/100, band 58-70, no render").

Never expose raw weights, item ids, or this math to the end user. Show the overall
score, the category scorecard, and plain-language findings only. The band and a one
line note on coverage are fine to surface.

## Checklist (49 items, 6 categories)

Mobile is intentionally out of scope here: a desktop-context audit cannot reliably
judge mobile fold, tap targets, or readable text. Mobile is assessed by the full
pipeline (with a mobile screenshot), not this offline rubric.

### Hero
- **M1 — Product & Target Audience Clarity** (10): Hero contains both (1) product category or function AND (2) target audience or use case. Missing either = Fail. _e.g. "Billing automation for EU SaaS finance teams."_
- **M14 — Outcome / Capability Focus** (10): H1 or subhead contains a measurable result, time reference, or specific capability. Just a product name or category = Fail. _e.g. "Close your books 3x faster, without changing tools."_
- **V1 — 5-Second Top of Page Test** (10): Above the fold, visitor sees H1, key value prop, one main CTA, and one key visual without scrolling.
- **V2 — Hero Numeric Proof** (9): A specific number (users, ratings, revenue, time saved) OR a third-party review widget with visible rating is visible in the hero or nav above the fold. Logo without a visible numeric rating = Fail.
- **M15 — Specific Differentiation** (9): Hero explicitly states what makes it different ("built for X", "unlike Y", "the only Z"). Generic superlatives ("best", "fastest", "#1") alone = Fail.
- **V23 — Risk Reducer Near CTA** (8): A risk reducer (free trial, no credit card, cancel anytime, money-back) appears within ~100px of the hero CTA or directly below it.
- **V22 — Hero Product Visual** (8): Hero shows a real screenshot of the product UI or a device mockup of the actual product. Text-only/abstract/people-only/no-product = Fail.

### Value Proposition
- **M2 — Core Promise Specific** (9): Main promise includes at least one specific number or timeframe. Vague ("improve", "boost", "better") = Fail.
- **M3 — Alignment With Core Promise** (8): All H2 headings relate to the same core topic as the H1 promise.
- **M4 — Evidence-Backed Differentiators** (8): At least 2 differentiators, each with supporting detail (screenshot, stat, explanation). Claims without evidence = Fail.
- **M23 — Target Audience Problem Clarity** (8): Names 1-3 specific pains in the hero or first 2 sections. No problem mentioned = Fail.
- **M37 — Message Simplicity** (8): Hero conveys ONE primary message. Competing value props or >3 distinct benefits above the fold = Fail.
- **M17 — "Unlike" Framing** (7): Text directly names an alternative (competitor, "spreadsheets", "manual process") and why this is better.
- **M35 — Feature-to-Outcome Mapping** (7): At least 3 features paired with a stated benefit/result. Features without outcomes = Fail.

### Copywriting
- **M18 — Action-Oriented CTAs** (8): Primary CTA uses a specific action verb (Start, Get, Try, Book, Create). Generic ("Learn more", "Submit", "Click here") = Fail.
- **M9 — Objection Handling** (8): Page/FAQ addresses ≥2 of: price, setup time, security, integration, switching cost.
- **M39 — Persuasive Page Narrative** (8): Logical flow — names the problem first, shows the outcome, presents product as the bridge. Straight to features without pain = Fail.
- **M21 — Transformation Clarity** (7): A before/after with both states named, OR a testimonial naming a past problem AND a current result, OR a two-state visual. "Great product" with no past state = Fail.
- **M6 — Benefit-Driven Headings** (7): ≥half of H2 headings focus on benefits/results, not feature names.
- **M26 — Plain Language** (7): Hero and key sections use simple words, no unexplained acronyms/jargon.
- **M19 — Consistent CTA Copy** (6): All primary CTAs for the same action use identical wording. Different verbs = Fail.
- **M20 — Secondary / Passive CTA** (5): A lower-commitment CTA exists (demo video, docs, case study).
- **M5 — You-Centric Language** (5): Hero and key sections use "you/your", not "we/our".

### Trust & Credibility
- **M8 — Quantified Outcome Proof** (8): At least one metric linking product usage to a concrete business result.
- **V14 — Customer Logos** (7): ≥3 customer/partner logos in the hero or first 2 sections.
- **M22 — User Evolution from Pain** (7): A testimonial mentioning both a before state and an after state. Generic praise = Fail.
- **M33 — Content Quality** (7): No spelling/grammar errors in H1/H2/CTA, no placeholder ("Lorem ipsum"). Any visible error = Fail.
- **M41 — Niche-Specific Testimonials** (7): A testimonial explicitly naming industry/role/use case matching the target audience.
- **V12 — Human Element in Social Proof** (6): Testimonials include a name AND ≥1 of role, company, location, or context. Anonymous = Fail.
- **V15 — Trust Badges & Security Signals** (6): ≥1 of review-site badge (G2/Capterra/TrustPilot), press logo, award, or security badge (SOC 2/GDPR/ISO).
- **V17 — Policy Transparency** (5): Footer or near forms has clear privacy/terms (and refund/SLA if relevant) links.
- **M34 — Linked Social Proof** (5): ≥1 testimonial links to a full case study or video testimonial.

### Conversion
- **M36 — Pricing Visibility** (8): Pricing is visible on page, or a clear link reaches it within one click.
- **V3 — CTA Dominance** (7): All primary CTAs for the main action share the same background color. Two equally prominent primary colors = Fail.
- **V13 — CTA Repetition** (7): Main CTA appears at least in hero, one mid-page block, and near the bottom.
- **M38 — Low-Commitment CTA Option** (7): ≥1 low-commitment CTA (watch demo, see docs, view case study) alongside the primary CTA.
- **M32 — Post-Submit Clarity** (6): Text in the hero/form area explains what happens next (timeline, next step). None = Fail.
- **V25 — Urgency or Scarcity Signal** (5): ≥1 urgency element (countdown, limited availability, time-sensitive offer, momentum). Evergreen non-pricing pages = Not evaluable; pricing pages = Fail.

### Design & UX
- **Note:** Design & UX items also cover Navigation, FAQ, and Footer.
- **V4 — Authentic Imagery** (8): Visuals show the real interface/context, not only generic stock photos.
- **V6 — Visual Hierarchy** (8): H1 visibly larger than H2, H2 larger than body, CTA buttons distinct in color/size.
- **V9 — Accessible Color Contrast** (8): H1, body, and CTA text have clearly readable contrast.
- **V5 — Scannability** (7): No text block exceeds ~5 lines without a subhead, bullets, or visual break.
- **V19 — Clear Navigation Structure** (7): Nav has 4-7 top-level items (dropdowns = 1) and a visible CTA button. >7 items or no CTA = Fail.
- **V24 — Page Focus** (7): One clear primary goal, ≤10 major sections. Competing goals or section overload = Fail.
- **V7 — Color Palette Consistency** (6): ≤4 distinct accent colors (excluding grayscale/photos).
- **V16 — Interactive Product Experience** (6): Product shown in action via video, interactive demo, or live preview.
- **V20 — FAQ Section** (6): An FAQ addressing 4-8 common questions about product, pricing, or setup.
- **V8 — Professional Visual Tone** (5): Icons share one style; no random emojis in headings/body.
- **V21 — Organized Footer** (5): Footer has ≥2 labeled link sections with 3+ links each.

This rubric produces ONLY the overall score + the 6-category scorecard — the
factual overview. It does not produce the recommendations. The recommendations
come from a separate, free CRO audit (`cro-audit.md`), prioritized by judgment,
not by which items here failed. Keep the two dissociated.
