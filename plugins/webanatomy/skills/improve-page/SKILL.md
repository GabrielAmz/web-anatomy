---
name: improve-page
description: |
  Improve an existing landing page, homepage, pricing page, persona page, feature page, comparator page, or individual section using Web Anatomy benchmarks. Use when the user asks what can you do to improve my LP, what can you do to improve my landing page, improve my site, critique, audit, redesign brief, section improvement, CRO review, why is this page weak, compare my page to best practices, or create a Lazyweb-style improvement report. Classifies the page, captures current reality first, routes to the right archetype, searches benchmark examples, and writes a report under `.webanatomy/improve-page/`.
metadata:
  version: 0.2.0
---

# Improve Page

Classify -> capture -> route -> benchmark -> recommend. This is the flagship Web Anatomy improvement workflow.

## Output Behavior

Always write:

- `.webanatomy/improve-page/{page-or-section}-{YYYY-MM-DD}/report.md`
- `.webanatomy/improve-page/{page-or-section}-{YYYY-MM-DD}/report.html`
- `.webanatomy/improve-page/{page-or-section}-{YYYY-MM-DD}/references/`

The HTML report is the primary visual output. Chat is only a short summary and pointer to the saved files.

If the user only wants a quick chat answer, keep the report shorter but still save the artifact when file access is available.

## Deterministic Report Renderer

When file access is available, do not hand-write the final HTML. Write structured report data first:

- `.webanatomy/improve-page/{page-or-section}-{YYYY-MM-DD}/report-data.json`

Then run the shared renderer from this skill pack:

```bash
node <skill-dir>/scripts/render-report.mjs --input=.webanatomy/improve-page/{page-or-section}-{YYYY-MM-DD}/report-data.json
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

## Step 1 - Load Context

Read `.agents/webanatomy-context.md` if it exists. If it does not, continue with conservative assumptions. Offer `webanatomy-setup` as an optional preflight only when missing ICP, industry, competitors, conversion goal, or proof assets would materially change the recommendation. Do not block quick audits or URL-based feedback on setup.

## Step 1.5 - Use A Prior Audit If One Exists (orchestration)

Before re-diagnosing, check whether `audit-page` already diagnosed this target. Look for the most recent `.webanatomy/audit-page/{target}-*/audit.json` whose `target` matches the page in this request.

If a matching `audit.json` is found (schema `webanatomy.audit-page.v1`):

- Reuse its `industry`, `locale`, `currentSnapshot`, and `prioritizedSections` instead of re-capturing, re-classifying, and re-prioritizing. Skip Steps 2, 3, and 4.
- Benchmark (Step 5) the sections the audit flagged, `startHere` first, then the remaining P0/P1 sections. Do not re-rank.
- Treat each section's `missingLevers` as the brief: search and recommend against exactly those gaps.
- Still capture a fresh current screenshot for the report when browser tools are available.
- Note in the report TL;DR: "Built on the audit-page diagnosis from {date}."

If no matching audit is found, proceed with Steps 2-4 as normal. This skill must still run fully standalone when no prior audit exists.

## Step 2 - Capture Current Reality

(Skip if a prior audit was loaded in Step 1.5; reuse its `currentSnapshot`.)

If the user provides a URL, screenshot, pasted copy, or local page:

- fetch or browse the URL before making recommendations
- capture or save a current screenshot when browser tools are available
- extract headline, subheadline, CTA, proof, product visual, visual hierarchy, and visible friction
- extract category clues from page text: nav labels, hero headline, meta title, services, customer segments, and footer

Do not write a gap analysis against an imagined page.

## Step 3 - Classify

(Skip if a prior audit was loaded in Step 1.5; reuse its `prioritizedSections`.)

Classify both page archetype and section types.

Page archetypes:

- homepage
- landing page
- pricing page
- comparator page
- persona page
- use-case page
- feature page

Section aliases:

- above the fold -> hero
- plan cards -> pricing
- logos -> trust
- customer quotes -> testimonial
- value prop -> value_proposition
- FAQ accordion -> faq
- final banner -> cta

If the request is about a whole page, identify the 3-5 highest-impact sections to benchmark. Do not audit every section equally.

## Step 4 - Resolve Industry

(Skip if a prior audit was loaded in Step 1.5; reuse its `industry` and `locale`.)

Always resolve an industry before benchmark search. Do not leave industry blank.

Use this order:

1. `.agents/webanatomy-context.md` industry
2. explicit industry in the user request
3. fetched page clues after current-reality capture
4. inferred broad category from the product: `Real Estate`, `Fintech`, `Healthcare`, `AI`, `Developer Tools`, `Ecommerce`, `Marketplace`, etc.
5. fallback: `SaaS` for software/product pages, otherwise `B2B`

Do not infer industry from the domain name alone. If a URL is provided, fetch or browse the page first.

If the page sells services as an agency, studio, consultancy, collective, broker, or done-for-you provider, set primary industry to `Agency` even when it serves a vertical. Use the vertical as a secondary benchmark angle. Example: a real-estate marketing agency should search `Agency` first and `Real Estate` second.

For French real-estate or property-investment product pages, default to `Real Estate`. For French agencies serving real estate, default to `Agency` first and `Real Estate` second. If the industry is inferred, say so briefly in the report notes.

Also resolve locale before search:

1. explicit locale in the request
2. page language after current-reality capture
3. French URL/copy/product context -> `fr`
4. fallback -> `en`

## Step 5 - Search Benchmarks

For each priority section, call `search_sections` with:

```json
{
  "section_type": "<section_type>",
  "industry": "<resolved primary industry>",
  "locale": "<resolved locale>",
  "min_score": 80,
  "limit": 5
}
```

Treat `min_score: 80` as a preferred quality floor, not a hard promise. The MCP may relax internally to avoid thin result sets. Prioritize examples by relevance, visible evidence, and strongest available match.

If a secondary industry was inferred, run a second search with the same section type and locale using the secondary industry, then choose the examples that best match the user's business model.

Broaden only if results are thin. Use internal scores and criteria only for selection. Translate them into plain-English practices in the report.

## Step 6 - Save Screenshots

For the current page:

- save the current screenshot as `references/current.png` when browser/screenshot tools are available
- if only text can be fetched, note that current screenshot is unavailable

For each selected benchmark result with `screenshot_url`:

1. Download it into `references/`.
2. Use a readable filename: `{company-slug}-{section-type}.png` or `.jpg`.
3. Reference it from `report.md` with a relative path.
4. Include it in `report.html` next to the recommendation it supports.

If screenshot download fails, keep the example only if the evidence is strong. Label it as "screenshot unavailable" and include the source URL when present.

Do not expose marker JSON. Translate markers into visible composition notes such as "proof sits directly under the CTA" or "the product visual occupies the right half of the fold."

## Step 7 - Score Publicly, Not Internally

Use public gap labels only:

- `HIGH` - likely blocks comprehension, trust, or conversion
- `MEDIUM` - meaningful improvement opportunity
- `LOW` - polish or optional optimization

Never expose benchmark scores, angle counts, thresholds, or raw criteria fields.

## Step 8 - Write Report

Use this structure:

```markdown
# Web Anatomy Improvement: [Page/Section]

## TL;DR
[Main gap, strongest benchmark pattern, highest-priority fix.]

## Current Reality
[Neutral factual description of the current page or section.]
![Current page or section](references/current.png)

## Highest-Impact Fixes
1. **[Fix]** - [why it matters and how to implement]
2. **[Fix]** - [why]
3. **[Fix]** - [why]

## Benchmark Matches

### [Company] - [Section]
![Benchmark match](references/company-section.png)
[What to notice. Mention screenshot/source availability if useful.]

## Gap Analysis

| Dimension | Current | Strong Pattern | Gap |
|---|---|---|---|
| Category clarity | ... | ... | HIGH |

## Rewrite Or Layout Direction
[Concrete copy, proof, hierarchy, and visual changes.]

## What Is Already Working
[2-4 things to preserve.]
```

Generate `report.html` alongside the Markdown. Use inline CSS, system fonts, a max-width around 1000px, image cards for current state and benchmark matches, clean tables, and relative image paths.

After saving, respond in chat with:

- the highest-impact fix
- 2-3 supporting benchmark patterns
- the report path
- any screenshot, corpus, or MCP limitations

## Use The Audit Method

Read `references/audit-method.md` before writing the gap analysis.

## Guardrails

- Be specific about what to add, remove, rewrite, or move.
- Do not recommend copying a reference exactly. Adapt the pattern.
- Do not invent proof the user does not have.
- If the page cannot be inspected, say what input is missing and switch to a market-pattern report.
