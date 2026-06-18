# Audit Page — Scoring Method & Checklist

This is a self-contained, offline scoring rubric. The agent evaluates each item
against the page, then computes the scores with the formula below. No backend and
no benchmark data are required.

This score is **framework-relative** (how the page does against proven CRO
criteria). It is directional. The **benchmark-relative** score — how the page
compares to the real top-converting pages in its industry — is the `write-page`
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
    { "id": "hero.audience_clarity", "status": "pass", "evidence_source": "text", "evidence_note": "hero names product and EU SaaS finance teams" },
    { "id": "design.nav_structure",  "status": "fail", "evidence_source": "dom",  "evidence_note": "9 top-level nav links, threshold is 4-7" }
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

Each item below is written as `category.slug` (its stable id, used verbatim in
`scorecard.json`), then its name, then `(weight, mode)`. Mode is `text` (judged
from the copy or DOM) or `visual` (needs a real render). When you cannot render,
the `visual` items are the ones marked `n/a`. The id set lives canonically in
`scripts/score.mjs`; these and the script must stay in sync.

### Hero
- **hero.audience_clarity** — Product & Target Audience Clarity (10, text): Hero contains both (1) product category or function AND (2) target audience or use case. Missing either = Fail. _e.g. "Billing automation for EU SaaS finance teams."_
- **hero.outcome_focus** — Outcome / Capability Focus (10, text): H1 or subhead contains a measurable result, time reference, or specific capability. Just a product name or category = Fail. _e.g. "Close your books 3x faster, without changing tools."_
- **hero.five_second_test** — 5-Second Top of Page Test (10, visual): Above the fold, visitor sees H1, key value prop, one main CTA, and one key visual without scrolling.
- **hero.numeric_proof** — Hero Numeric Proof (9, visual): A specific number (users, ratings, revenue, time saved) OR a third-party review widget with visible rating is visible in the hero or nav above the fold. Logo without a visible numeric rating = Fail.
- **hero.differentiation** — Specific Differentiation (9, text): Hero explicitly states what makes it different ("built for X", "unlike Y", "the only Z"). Generic superlatives ("best", "fastest", "#1") alone = Fail.
- **hero.risk_reducer** — Risk Reducer Near CTA (8, visual): A risk reducer (free trial, no credit card, cancel anytime, money-back) appears within ~100px of the hero CTA or directly below it.
- **hero.product_visual** — Hero Product Visual (8, visual): Hero shows a real screenshot of the product UI or a device mockup of the actual product. Text-only/abstract/people-only/no-product = Fail.

### Value Proposition
- **value_prop.specific_promise** — Core Promise Specific (9, text): Main promise includes at least one specific number or timeframe. Vague ("improve", "boost", "better") = Fail.
- **value_prop.promise_alignment** — Alignment With Core Promise (8, text): All H2 headings relate to the same core topic as the H1 promise.
- **value_prop.evidence_backed** — Evidence-Backed Differentiators (8, text): At least 2 differentiators, each with supporting detail (screenshot, stat, explanation). Claims without evidence = Fail.
- **value_prop.problem_clarity** — Target Audience Problem Clarity (8, text): Names 1-3 specific pains in the hero or first 2 sections. No problem mentioned = Fail.
- **value_prop.message_simplicity** — Message Simplicity (8, text): Hero conveys ONE primary message. Competing value props or >3 distinct benefits above the fold = Fail.
- **value_prop.unlike_framing** — "Unlike" Framing (7, text): Text directly names an alternative (competitor, "spreadsheets", "manual process") and why this is better.
- **value_prop.feature_outcome** — Feature-to-Outcome Mapping (7, text): At least 3 features paired with a stated benefit/result. Features without outcomes = Fail.

### Copywriting
- **copy.action_cta** — Action-Oriented CTAs (8, text): Primary CTA uses a specific action verb (Start, Get, Try, Book, Create). Generic ("Learn more", "Submit", "Click here") = Fail.
- **copy.objection_handling** — Objection Handling (8, text): Page/FAQ addresses ≥2 of: price, setup time, security, integration, switching cost.
- **copy.narrative** — Persuasive Page Narrative (8, text): Logical flow — names the problem first, shows the outcome, presents product as the bridge. Straight to features without pain = Fail.
- **copy.transformation** — Transformation Clarity (7, text): A before/after with both states named, OR a testimonial naming a past problem AND a current result, OR a two-state visual. "Great product" with no past state = Fail.
- **copy.benefit_headings** — Benefit-Driven Headings (7, text): ≥half of H2 headings focus on benefits/results, not feature names.
- **copy.plain_language** — Plain Language (7, text): Hero and key sections use simple words, no unexplained acronyms/jargon.
- **copy.consistent_cta** — Consistent CTA Copy (6, text): All primary CTAs for the same action use identical wording. Different verbs = Fail.
- **copy.secondary_cta** — Secondary / Passive CTA (5, text): A lower-commitment CTA exists (demo video, docs, case study).
- **copy.you_centric** — You-Centric Language (5, text): Hero and key sections use "you/your", not "we/our".

### Trust & Credibility
- **trust.quantified_proof** — Quantified Outcome Proof (8, text): At least one metric linking product usage to a concrete business result.
- **trust.customer_logos** — Customer Logos (7, visual): ≥3 customer/partner logos in the hero or first 2 sections.
- **trust.before_after_testimonial** — User Evolution from Pain (7, text): A testimonial mentioning both a before state and an after state. Generic praise = Fail.
- **trust.content_quality** — Content Quality (7, text): No spelling/grammar errors in H1/H2/CTA, no placeholder ("Lorem ipsum"). Any visible error = Fail.
- **trust.niche_testimonials** — Niche-Specific Testimonials (7, text): A testimonial explicitly naming industry/role/use case matching the target audience.
- **trust.human_social_proof** — Human Element in Social Proof (6, visual): Testimonials include a name AND ≥1 of role, company, location, or context. Anonymous = Fail.
- **trust.trust_badges** — Trust Badges & Security Signals (6, visual): ≥1 of review-site badge (G2/Capterra/TrustPilot), press logo, award, or security badge (SOC 2/GDPR/ISO).
- **trust.policy_transparency** — Policy Transparency (5, visual): Footer or near forms has clear privacy/terms (and refund/SLA if relevant) links.
- **trust.linked_proof** — Linked Social Proof (5, text): ≥1 testimonial links to a full case study or video testimonial.

### Conversion
- **conversion.pricing_visibility** — Pricing Visibility (8, text): Pricing is visible on page, or a clear link reaches it within one click.
- **conversion.cta_dominance** — CTA Dominance (7, visual): All primary CTAs for the main action share the same background color. Two equally prominent primary colors = Fail.
- **conversion.cta_repetition** — CTA Repetition (7, visual): Main CTA appears at least in hero, one mid-page block, and near the bottom.
- **conversion.low_commitment_cta** — Low-Commitment CTA Option (7, text): ≥1 low-commitment CTA (watch demo, see docs, view case study) alongside the primary CTA.
- **conversion.post_submit_clarity** — Post-Submit Clarity (6, text): Text in the hero/form area explains what happens next (timeline, next step). None = Fail.
- **conversion.urgency** — Urgency or Scarcity Signal (5, visual): ≥1 urgency element (countdown, limited availability, time-sensitive offer, momentum). Evergreen non-pricing pages = Not evaluable; pricing pages = Fail.

### Design & UX
- **Note:** Design & UX items also cover Navigation, FAQ, and Footer.
- **design.authentic_imagery** — Authentic Imagery (8, visual): Visuals show the real interface/context, not only generic stock photos.
- **design.visual_hierarchy** — Visual Hierarchy (8, visual): H1 visibly larger than H2, H2 larger than body, CTA buttons distinct in color/size.
- **design.color_contrast** — Accessible Color Contrast (8, visual): H1, body, and CTA text have clearly readable contrast.
- **design.scannability** — Scannability (7, visual): No text block exceeds ~5 lines without a subhead, bullets, or visual break.
- **design.nav_structure** — Clear Navigation Structure (7, visual): Nav has 4-7 top-level items (dropdowns = 1) and a visible CTA button. >7 items or no CTA = Fail.
- **design.page_focus** — Page Focus (7, visual): One clear primary goal, ≤10 major sections. Competing goals or section overload = Fail.
- **design.palette_consistency** — Color Palette Consistency (6, visual): ≤4 distinct accent colors (excluding grayscale/photos).
- **design.interactive_product** — Interactive Product Experience (6, visual): Product shown in action via video, interactive demo, or live preview.
- **design.faq** — FAQ Section (6, visual): An FAQ addressing 4-8 common questions about product, pricing, or setup.
- **design.visual_tone** — Professional Visual Tone (5, visual): Icons share one style; no random emojis in headings/body.
- **design.footer** — Organized Footer (5, visual): Footer has ≥2 labeled link sections with 3+ links each.

This rubric produces ONLY the overall score + the 6-category scorecard — the
factual overview. It does not produce the recommendations. The recommendations
come from a separate, free CRO audit (`cro-audit.md`), prioritized by judgment,
not by which items here failed. Keep the two dissociated.
