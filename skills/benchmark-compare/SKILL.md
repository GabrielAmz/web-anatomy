---
name: benchmark-compare
description: |
  The Page-altitude gap check in Web Anatomy. Compare a live URL, screenshot, or pasted section against Web Anatomy benchmark examples and produce a gap analysis. Use when the user asks score this page vs benchmark, compare my URL to best-in-class pages, benchmark this hero, gap analysis against competitors, how far are we from strong examples, or what should we fix first. Uses public gap labels while keeping internal scores and raw benchmark mechanics hidden.
metadata:
  version: 0.2.0
---

# Benchmark Compare

Compare the user's current page against benchmark-backed patterns. This is more diagnostic than `find-examples` and more concise than `improve-page`.

This is the **Page altitude** of Web Anatomy, grounded: it measures the current page against the real benchmark winners and labels each gap so the user sees how far the page sits from the best in its market.

## Output Behavior

Write:

- `.webanatomy/benchmark-compare/{target}-{YYYY-MM-DD}/report.md`
- `.webanatomy/benchmark-compare/{target}-{YYYY-MM-DD}/report.html`
- `.webanatomy/benchmark-compare/{target}-{YYYY-MM-DD}/references/`

The HTML report is the primary visual output. Chat is only a short summary and pointer to the saved files.

If the user asks for a fast answer, still produce a concise saved report when possible.

## Deterministic Report Renderer

When file access is available, do not hand-write the final HTML. Write structured report data first:

- `.webanatomy/benchmark-compare/{target}-{YYYY-MM-DD}/report-data.json`

Then run the shared renderer from this skill pack:

```bash
node <skill-dir>/scripts/render-report.mjs --input=.webanatomy/benchmark-compare/{target}-{YYYY-MM-DD}/report-data.json
```

Resolve `<skill-dir>` relative to this `SKILL.md`. The renderer validates the report data, downloads every `screenshotUrl` into `references/`, writes `report.md`, writes `report.html`, and renders "screenshot unavailable" when no screenshot exists.

Use this report-data shape:

- `title`, `summary`, optional `eyebrow`, `subtitle`, `target`
- `currentSnapshot`: `{ "label": "...", "text": "..." }[]`
- `references`: `{ "title": "...", "company": "...", "section": "...", "sourceUrl": "...", "screenshotUrl": "...", "caption": "...", "insight": "..." }[]`
- `recommendations`: `{ "title": "...", "why": "...", "how": "..." }[]`
- `gapAnalysis`: `{ "dimension": "...", "current": "...", "strongPattern": "...", "gap": "HIGH|MEDIUM|LOW" }[]`
- optional `weekActions`, `quarterActions`, `footer`

Only fall back to hand-written HTML if the renderer cannot be run.

## Workflow

1. **Capture target** - URL, screenshot, pasted copy, or local page. If a URL is provided, fetch or browse it before classifying. Capture a screenshot when possible.
2. **Classify** - Determine page archetype and visible section types.
3. **Resolve industry and locale** - Always set an industry and locale before benchmark search: context first, explicit request second, URL/page inference third, broad category fourth, `SaaS`/`B2B` and `en` fallbacks last.
4. **Select benchmark set** - For whole homepage/landing-page targets, search page examples first with `search_pages`; then search 3-5 benchmark examples per priority section with `search_sections`.
5. **Compare dimensions** - Use the audit method in `references/audit-method.md`.
6. **Prioritize gaps** - Label gaps `HIGH`, `MEDIUM`, or `LOW`.
7. **Recommend next actions** - Give fixes in priority order.

## MCP Retrieval

Confirm the `webanatomy` MCP tools are available before searching. If connected, use live benchmark data. If not, tell the user up front ("Running without live benchmark data; using static guidance. Connect MCP for grounded results: https://www.webanatomy.ai/dashboard/mcp"), then continue with a clearly labeled static fallback. Never surface this as an error or block the run.

Use `search_pages` for whole homepage or landing-page comparisons. It returns public-safe page examples with `analysis_bullets`, `strengths`, `stealable_moves`, `source_url`, and `screenshot_url`. Use `search_sections` for priority section comparisons.

For whole-page comparison, call:

```json
{
  "industry": "<resolved primary industry>",
  "locale": "<resolved locale>",
  "min_score": 60,
  "limit": 5
}
```

For section comparison, call:

```json
{
  "section_type": "<section_type>",
  "industry": "<resolved primary industry>",
  "locale": "<resolved locale>",
  "min_score": 80,
  "limit": 5
}
```

Keep all scores, thresholds, raw summary IDs, field names, and marker data internal. Translate benchmark evidence into plain-English gap labels.

## Screenshot Handling

For the current page:

- save the current screenshot as `references/current.png` when browser/screenshot tools are available
- if only text can be fetched, note that current screenshot is unavailable

For each selected benchmark result with `screenshot_url`:

1. Download it into `references/`.
2. Use a readable filename: `{company-slug}-{section-type}.png` for section examples or `{company-slug}-homepage.png` for page examples.
3. Reference it from `report.md` with a relative path.
4. Include it in `report.html`.

If screenshot download fails, keep the example only if the evidence is strong. Label it as "screenshot unavailable" and include the source URL when present.

Do not expose marker JSON. Translate markers into plain-language composition notes.

## Industry Default

Do not leave industry blank. Infer it whenever possible.

Use this order:

1. `.agents/webanatomy-context.md` industry
2. explicit industry in the user request
3. fetched page clues if a URL or company is provided
4. inferred broad category: `Real Estate`, `Fintech`, `Healthcare`, `AI`, `Developer Tools`, `Ecommerce`, `Marketplace`, etc.
5. fallback: `SaaS` for software/product pages, otherwise `B2B`

Do not infer industry from the domain name alone. If a URL is provided, fetch or browse the page first.

If the page sells services as an agency, studio, consultancy, collective, broker, or done-for-you provider, set primary industry to `Agency` even when it serves a vertical. Use the vertical as a secondary benchmark angle.

For French real-estate or property-investment product pages, default to `Real Estate`. For French agencies serving real estate, default to `Agency` first and `Real Estate` second. Mention inferred industries in report notes.

Also resolve locale before search:

1. explicit locale in the request
2. page language when a URL or pasted copy is provided
3. French URL/copy/product context -> `fr`
4. fallback -> `en`

## Comparison Dimensions

Use dimensions that match the section:

- Hero: category clarity, outcome specificity, CTA clarity, proof proximity, product visual, risk reduction, hierarchy
- Pricing: plan distinction, preferred plan, annual/monthly toggle, trial/demo path, objections, enterprise path
- Testimonial: named buyer, title/company, quantified outcome, before/after specificity, visual credibility
- Trust: logo relevance, proof density, security/compliance, social proof proximity
- CTA: action specificity, motivation, risk reduction, visual prominence, next-step clarity
- Features: benefit translation, product evidence, use-case grouping, scanability
- FAQ: objection quality, answer specificity, docs links, pricing/migration/trust coverage

## Output Shape

```markdown
# Benchmark Compare: [Target]

## Verdict
[Plain-English summary. No internal score.]

![Current target](references/current.png)

## Priority Gaps

| Gap | Severity | Why It Matters | Fix |
|---|---|---|---|
| ... | HIGH | ... | ... |

## Best Benchmark Matches
![Benchmark match](references/company-section.png)
**[Company] [Section or Homepage]** - [what to notice]

![Benchmark match](references/company-section-2.png)
**[Company] [Section]** - [what to notice]

## Recommended Fix Order
1. [fix]
2. [fix]
3. [fix]

## Notes
[Assumptions, missing inputs, or corpus limits.]
```

Generate `report.html` alongside the Markdown. Use inline CSS, system fonts, a max-width around 1000px, image cards, clean tables, and relative image paths.

After saving, respond in chat with:

- the verdict
- the top 3 gaps
- the report path
- any screenshot, corpus, or MCP limitations

## Guardrails

- Never display internal numeric scores, thresholds, field names, or marker JSON.
- Do not say "best-in-class" unless benchmark evidence supports it.
- Do not over-audit low-impact sections when the hero, pricing, or proof is the real blocker.
- Say when the benchmark set is thin or only adjacent.
- Follow the shared house style in `webanatomy-setup/references/house-style.md`: no em-dashes, "The X…" not "Your X…", gap labels (HIGH/MEDIUM/LOW), and never expose framework internals. Match the Voice and tone and Locale from `.agents/webanatomy-context.md` when present.
