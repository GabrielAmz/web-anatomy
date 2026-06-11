---
name: research-best-practices
description: |
  Deep Web Anatomy research report for a page archetype, section type, industry, competitor set, or conversion problem. Use when the user asks for best practices, market patterns, what top pages do, competitive research, a design research report, pricing page research, hero best practices, testimonial research, or benchmark-backed recommendations before building. Produces durable files under `.webanatomy/research-best-practices/`.
metadata:
  version: 0.3.0
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

Use this report-data shape (v2):

- `title`: plain and descriptive (`{Topic} - what strong pages do`), no editorial framing
- optional `eyebrow`, `subtitle`, `target`
- `summary`: `string[]` of max 3 bullets (each max 140 chars), the practical answer. The first bullet renders as the "TL;DR:" lead sentence of the blue callout under the title.
- `recommendations`: `{ "title": "...", "why": "...", "how": ["..."], "refIds": ["..."], "priority": "HIGH|MEDIUM|LOW" }[]` - the findings, ordered. `why` (max 220 chars) ties the finding to benchmark evidence; `how` is 1-5 adaptation bullets, each max 160 chars; `refIds` lists the references showing the pattern (their screenshots render inline as "Inspired by"; 2-3 render as options A/B/C). `kind` and `prompt` are optional.
- `references`: `{ "id": "...", "title": "...", "company": "...", "section": "...", "sourceUrl": "...", "screenshotUrl": "...", "caption": "...", "insight": "..." }[]` - `id` is a stable kebab-case slug; `insight` is the one-line what-to-notice, max 200 chars. Label web-captured examples `[Web]` in the caption. References not claimed by any finding render in an "All references" gallery at the bottom.
- optional `gapAnalysis` (max 6 rows, cells max 90 chars), `currentSnapshot` (max 6 items, collapsed at the bottom), `working`, `footer`
- optional `ungrounded: true` - only for explicit no-MCP runs; lifts the floor of at least 3 findings carrying `refIds`

The renderer enforces the budgets and the grounding floor, and fails loudly with the exact overruns. When it fails, rewrite the content shorter; never pad, never bypass the renderer with hand-written HTML. Put anti-patterns in `recommendations` too (a finding whose `how` says what to avoid), and source notes in `footer`.

Only fall back to hand-written HTML if the renderer cannot be run.

## Workflow

1. **Load context** - Read `.agents/webanatomy-context.md` when present.
2. **Clarify scope** - Identify section type, page archetype, industry, platform, and target buyer.
3. **Resolve industry and locale** - Always set an industry and locale before search: context first, explicit request second, fetched URL/page inference third, broad category fourth, `SaaS`/`B2B` and `en` fallbacks last.
4. **Search benchmarks** - Use `search_pages` for whole-homepage/page-archetype research and `search_sections` for section-specific patterns. Run 3-5 angles: exact scope, adjacent section, same industry, broad market, competitor names if supported.
5. **Inspect evidence** - Use screenshot URLs, strengths, and marker summaries to determine what is actually visible.
6. **Supplement current web research** - If browse/WebFetch is available, capture recent public competitor examples. Label them as live web examples, not benchmark examples.
7. **Synthesize patterns** - Group by repeatable pattern, not by company rank.
8. **Write report and HTML** - Use relative image paths when references are downloaded.

## MCP Retrieval

Use `search_pages` when the question is about homepage or whole landing-page inspiration: what top pages do, what structure or positioning they use, or what a user can steal from strong pages in an industry. Use `search_sections` when the question is about a specific section type such as hero, pricing, testimonial, FAQ, CTA, trust, or features.

For page research, call:

```json
{
  "industry": "<resolved primary industry>",
  "locale": "<resolved locale>",
  "min_score": 60,
  "limit": 8
}
```

For section research, call:

```json
{
  "section_type": "<section_type>",
  "industry": "<resolved primary industry>",
  "locale": "<resolved locale>",
  "min_score": 80,
  "limit": 8
}
```

Use page result fields `analysis_bullets`, `strengths`, and `stealable_moves` as qualitative evidence. Use section result fields `strengths` and `pattern_notes` as section evidence. Keep scores, thresholds, raw summary IDs, and marker data internal.

## Screenshot Handling

For each selected benchmark result with `screenshot_url`:

1. Download it into `references/`.
2. Use a readable filename: `{company-slug}-{section-type}.png` for section examples or `{company-slug}-homepage.png` for page examples.
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

Fill the v2 report-data shape and let the renderer produce both files. The report reads in this order:

1. **TL;DR** (`summary`) - the practical answer as the blue callout, 3 bullets max.
2. **Findings** (`recommendations`, heading via `recommendationsHeading`, for example "What strong pricing pages do") - numbered, strongest first, each pattern shown through its reference screenshots inline. Anti-patterns are findings too: name what fails and what to do instead.
3. **All references** - examples no finding claimed render automatically in the gallery, with `[Web]`/benchmark labels in their captions.
4. **Sources and corpus limits** go in `footer`.

Write to be skimmed: every `why` is 2 lines max tied to evidence ("4 of 6 references do X"), every `how` is imperative bullets, one idea per sentence. No prevalence adjectives without a count.

After saving, respond in chat with:

- the top 3 findings
- the report path
- any corpus, screenshot, or MCP limitations

## Guardrails

- Keep scores, thresholds, field names, raw marker coordinates, and ranking mechanics internal.
- Do not invent customer names, proof, or metrics.
- Separate benchmark evidence from interpretation.
- If the benchmark corpus is thin, say so and broaden deliberately.
- Follow the shared house style in `webanatomy-setup/references/house-style.md`: no em-dashes, "The X…" not "Your X…", and never expose framework internals. Match the Locale from `.agents/webanatomy-context.md` when present.
