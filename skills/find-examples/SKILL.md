---
name: find-examples
description: |
  Fast Web Anatomy benchmark lookup. Use when the user asks to find examples, show references, get inspiration, find strong sections, show SaaS pricing examples, show AI hero examples, find testimonial patterns, or provide a swipe file without a full research report. Uses the Web Anatomy MCP search_sections tool when available, keeps internal scores and raw benchmark fields hidden, and writes a lightweight visual swipe file under `.webanatomy/find-examples/`.
metadata:
  version: 0.2.0
---

# Find Examples

Find strong benchmark-backed references quickly. This skill is intentionally lighter than `research-best-practices`: retrieve, filter, group, and give the user the best examples to open.

## Output Behavior

Always create a lightweight visual artifact:

- `.webanatomy/find-examples/{topic}-{YYYY-MM-DD}/report.md`
- `.webanatomy/find-examples/{topic}-{YYYY-MM-DD}/report.html`
- `.webanatomy/find-examples/{topic}-{YYYY-MM-DD}/references/`

The chat response is only the summary and file pointer. Do not dump the whole swipe file into chat.

If the environment cannot write files, explain the blocker and provide a compact inline version.

## Deterministic Report Renderer

When file access is available, do not hand-write the final HTML. Write structured report data first:

- `.webanatomy/find-examples/{topic}-{YYYY-MM-DD}/report-data.json`

Then run the shared renderer from this skill pack:

```bash
node <skill-dir>/scripts/render-report.mjs --input=.webanatomy/find-examples/{topic}-{YYYY-MM-DD}/report-data.json
```

Resolve `<skill-dir>` relative to this `SKILL.md`. The renderer validates the report data, downloads every `screenshotUrl` into `references/`, writes `report.md`, writes `report.html`, and renders "screenshot unavailable" when no screenshot exists.

Use this report-data shape:

- `title`, `summary`, optional `eyebrow`, `subtitle`, `target`
- `references`: `{ "title": "...", "company": "...", "section": "...", "sourceUrl": "...", "screenshotUrl": "...", "caption": "...", "insight": "..." }[]`
- optional `recommendations`, `gapAnalysis`, `weekActions`, `quarterActions`, `footer`

Only fall back to hand-written HTML if the renderer cannot be run.

## Inputs To Infer

Infer these from the request and `.agents/webanatomy-context.md` when available:

- section type: hero, pricing, testimonial, value_proposition, cta, features, trust, faq, integrations, use_cases
- industry: user's context first, then request/URL/page inference, then broad fallback
- locale: request/page language first, then default `en`
- intent: swipe file, redesign inspiration, competitor reference, or section pattern

If the section type is unclear, map aliases:

- "above the fold" -> hero
- "customer proof" -> testimonial or trust
- "plans" -> pricing
- "logos" -> trust
- "value prop" -> value_proposition
- "use case" -> use_cases
- "CTA band" -> cta

Ask one clarifying question only when the same request could map to different section types and the difference matters.

## Industry Default

Always resolve an industry before searching. Do not leave industry blank.

Use this order:

1. `.agents/webanatomy-context.md` industry
2. explicit industry in the user request
3. fetched page clues if a URL or company is provided
4. inferred broad category: `Real Estate`, `Fintech`, `Healthcare`, `AI`, `Developer Tools`, `Ecommerce`, `Marketplace`, etc.
5. fallback: `SaaS` for software/product examples, otherwise `B2B`

Do not infer industry from the domain name alone. If a URL is provided, fetch or browse the page first.

If the page sells services as an agency, studio, consultancy, collective, broker, or done-for-you provider, set primary industry to `Agency` even when it serves a vertical. Use the vertical as a secondary benchmark angle.

For French real-estate or property-investment product pages, default to `Real Estate`. For French agencies serving real estate, default to `Agency` first and `Real Estate` second. If the industry is inferred, mention it in one sentence.

Also resolve locale before search:

1. explicit locale in the request
2. page language when a URL or pasted copy is provided
3. French URL/copy/product context -> `fr`
4. fallback -> `en`

## MCP Retrieval

Use the `webanatomy` MCP `search_sections` tool when available.

Start narrow:

```json
{
  "section_type": "<section_type>",
  "industry": "<resolved primary industry>",
  "locale": "<resolved locale>",
  "min_score": 80,
  "limit": 8
}
```

Treat `min_score: 80` as a preferred quality floor, not a hard promise. The MCP may relax internally to avoid thin result sets. Keep the highest-priority examples first and choose final examples by relevance, visible evidence, and business-model fit.

If a secondary industry was inferred from page text, run a second search with the secondary industry and keep whichever examples best fit the business model.

If the result set is thin:

1. lower the internal floor,
2. drop industry,
3. try a neighboring section type,
4. then use named static references only as fallback.

The tool may expose fields such as `score`, `criteria_hits`, or marker coordinates. Use those internally to choose examples, but never expose them.

## Selection Rules

Pick 5-10 examples. Prefer:

- direct section-type match
- same or adjacent industry
- named company and source URL present
- screenshot URL present
- strengths that clearly match the user's ask
- marker-backed examples when explaining visible composition

Do not include a screenshot or company just because it is famous. The example has to illustrate the pattern.

## Screenshot Handling

For each selected benchmark result with `screenshot_url`:

1. Download it into `references/`.
2. Use a readable filename: `{company-slug}-{section-type}.png` or `.jpg`.
3. Reference it from `report.md` with a relative path.
4. Include it in `report.html`.

If download fails, keep the example only if the text evidence is strong. Label it as "screenshot unavailable" and include the source URL when present.

Do not expose marker JSON. If markers are available, translate them into visible composition notes.

## Report Output

Write `report.md` in this shape:

```markdown
# Web Anatomy Examples: [Topic]

## TL;DR
[1-2 sentences on what the examples show.]

### Pattern: [Plain-English Pattern Name]
![Company section](references/company-section.png)
**[Company]** - [what to notice; why this is useful for the user]

![Company section](references/company-section-2.png)
**[Company]** - [what to notice]

### Pattern: [Pattern Name]
- ...

## How To Use These
1. [specific adaptation]
2. [specific adaptation]
3. [specific adaptation]
```

If the user asks for a swipe file, group by pattern instead of rank.

Generate `report.html` alongside the Markdown. Use inline CSS, system fonts, a max-width around 1000px, image cards, clear pattern headings, and relative image paths.

After saving, respond in chat with:

- the 2-3 strongest patterns
- the report path
- any corpus or screenshot limitations

## Guardrails

- Never show internal scores, thresholds, raw field names, or coordinate JSON.
- Do not claim conversion lifts unless the user supplied them.
- Translate benchmark mechanics into plain language. Example: `risk_reducer` becomes "risk is lowered before the click."
- If MCP is unavailable, say that benchmark search is unavailable and provide a static, clearly labeled fallback.
