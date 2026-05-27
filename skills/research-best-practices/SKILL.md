---
name: research-best-practices
description: |
  Deep Web Anatomy research report for a page archetype, section type, industry, competitor set, or conversion problem. Use when the user asks for best practices, market patterns, what top pages do, competitive research, a design research report, pricing page research, hero best practices, testimonial research, or benchmark-backed recommendations before building. Produces durable files under `.webanatomy/research-best-practices/`.
metadata:
  version: 0.2.0
---

# Research Best Practices

Produce a benchmark-backed research artifact, not just chat. The goal is to answer: what strong pages do, why it works, and how the user should adapt it.

## Output Behavior

Always write:

- `.webanatomy/research-best-practices/{topic}-{YYYY-MM-DD}/report.md`
- `.webanatomy/research-best-practices/{topic}-{YYYY-MM-DD}/report.html`
- `.webanatomy/research-best-practices/{topic}-{YYYY-MM-DD}/references/`

The HTML report is the primary visual output. Chat is only a short summary and pointer to the saved files.

If the environment cannot write files, explain the blocker and provide the report inline.

## Deterministic Report Renderer

When file access is available, do not hand-write the final HTML. Write structured report data first:

- `.webanatomy/research-best-practices/{topic}-{YYYY-MM-DD}/report-data.json`

Then run the shared renderer from this skill pack:

```bash
node <skill-dir>/scripts/render-report.mjs --input=.webanatomy/research-best-practices/{topic}-{YYYY-MM-DD}/report-data.json
```

Resolve `<skill-dir>` relative to this `SKILL.md`. The renderer validates the report data, downloads every `screenshotUrl` into `references/`, writes `report.md`, writes `report.html`, and renders "screenshot unavailable" when no screenshot exists.

Use this report-data shape:

- `title`, `summary`, optional `eyebrow`, `subtitle`, `target`
- `references`: `{ "title": "...", "company": "...", "section": "...", "sourceUrl": "...", "screenshotUrl": "...", "caption": "...", "insight": "..." }[]`
- `recommendations`: `{ "title": "...", "why": "...", "how": "..." }[]`
- optional `currentSnapshot`, `gapAnalysis`, `weekActions`, `quarterActions`, `footer`

Only fall back to hand-written HTML if the renderer cannot be run.

## Workflow

1. **Load context** - Read `.agents/webanatomy-context.md` when present.
2. **Clarify scope** - Identify section type, page archetype, industry, platform, and target buyer.
3. **Resolve industry and locale** - Always set an industry and locale before search: context first, explicit request second, fetched URL/page inference third, broad category fourth, `SaaS`/`B2B` and `en` fallbacks last.
4. **Search benchmarks** - Use `search_sections` with 3-5 angles: exact section, adjacent section, same industry, broad market, competitor names if supported.
5. **Inspect evidence** - Use screenshot URLs, strengths, and marker summaries to determine what is actually visible.
6. **Supplement current web research** - If browse/WebFetch is available, capture recent public competitor examples. Label them as live web examples, not benchmark examples.
7. **Synthesize patterns** - Group by repeatable pattern, not by company rank.
8. **Write report and HTML** - Use relative image paths when references are downloaded.

## Screenshot Handling

For each selected benchmark result with `screenshot_url`:

1. Download it into `references/`.
2. Use a readable filename: `{company-slug}-{section-type}.png` or `.jpg`.
3. Reference it from `report.md` with a relative path.
4. Include it in `report.html` as a visual card with a caption.

For live web examples captured through browsing, save screenshots into the same `references/` folder and label them `[Web]`. Label benchmark screenshots `[Benchmark]`.

If a screenshot cannot be downloaded, keep the reference only if the visible/text evidence is strong. Say "screenshot unavailable" and include the source URL when present.

Never expose marker JSON. If marker data is present, translate it into plain-language composition notes.

## Industry Default

Do not ask for industry unless the report would be misleading without it. Infer it whenever possible.

Use this order:

1. `.agents/webanatomy-context.md` industry
2. explicit industry in the user request
3. fetched page clues if a URL or company is provided
4. inferred broad category: `Real Estate`, `Fintech`, `Healthcare`, `AI`, `Developer Tools`, `Ecommerce`, `Marketplace`, etc.
5. fallback: `SaaS` for software/product research, otherwise `B2B`

Do not infer industry from the domain name alone. If a URL is provided, fetch or browse the page first.

If the page sells services as an agency, studio, consultancy, collective, broker, or done-for-you provider, set primary industry to `Agency` even when it serves a vertical. Use the vertical as a secondary benchmark angle.

For French real-estate or property-investment product pages, default to `Real Estate`. For French agencies serving real estate, default to `Agency` first and `Real Estate` second.

Also resolve locale before search:

1. explicit locale in the request
2. page language when a URL or pasted copy is provided
3. French URL/copy/product context -> `fr`
4. fallback -> `en`

## Reference Quality Bar

Use fewer, better references. A reference belongs in the report only if it directly supports the pattern.

Skip examples when:

- the visible section does not match the recommendation
- the company is famous but the section is generic
- the screenshot is missing and the example needs visual proof
- the only rationale depends on hidden scores

## Report Shape

```markdown
# Web Anatomy Research: [Topic]

## TL;DR
[2-3 sentences with the practical answer.]

## Recommendations
1. **[Recommendation]** - [why, tied to benchmark evidence]
2. **[Recommendation]** - [why]
3. **[Recommendation]** - [why]

## What Strong [Section/Page] Examples Have In Common

### [Pattern Name]
[Explain the pattern.]

Seen in:
- [Company] - [what to notice]
- [Company] - [what to notice]

How to adapt it:
- [specific guidance]

## Anti-Patterns
- [anti-pattern and why it fails]

## Reference Gallery
[Screenshots or links with source labels.]

## Sources
- [Benchmark examples are cited inline]
- [Live web URLs]
```

## HTML Requirements

The HTML report should be self-contained with inline CSS, system fonts, readable line height, max width around 1000px, clean tables, image cards, and images referenced with relative paths. It should be pleasant to open directly in a browser from disk.

After saving, respond in chat with:

- the top 3 findings
- the report path
- any corpus, screenshot, or MCP limitations

## Guardrails

- Keep scores, thresholds, field names, raw marker coordinates, and ranking mechanics internal.
- Do not invent customer names, proof, or metrics.
- Separate benchmark evidence from interpretation.
- If the benchmark corpus is thin, say so and broaden deliberately.
