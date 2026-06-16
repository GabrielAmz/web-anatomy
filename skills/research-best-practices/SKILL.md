---
name: research-best-practices
description: |
  The Section-altitude research report in Web Anatomy. Deep research on a single section the user already knows they want to work on, returned as a tiered improvement ladder (foundational, competitive, best-in-class) grounded in real benchmark sections. Use when the user asks for hero best practices, pricing section research, testimonial research, how to level up my CTA, what makes a strong FAQ, or section-level benchmark recommendations before building or reworking. For whole-page, market, industry, positioning, or competitor research, use find-examples instead. Produces durable files under `.webanatomy/research-best-practices/`.
metadata:
  version: 0.4.0
---

# Research Best Practices

Produce a benchmark-backed research artifact for ONE section, not just chat. The goal is to answer: for this section, what does strong look like, and what are the levels the user can climb to, each grounded in real benchmark sections.

This is the **Section altitude** of Web Anatomy: take a section the user already knows they want to work on and return a tiered improvement ladder. The user picks a tier; `improve-page` executes it.

**Scope guard.** This skill is for one section. If the request is about a whole page, a market, an industry, positioning, or competitors, that is `find-examples` (the Strategy altitude) — route there. If the user named a page but no section, ask which section to start with before researching. Confirm the single section first.

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
- `summary`: `string[]` of max 3 bullets (each max 140 chars): the section, where strong sits, and the tier you would start at. The first bullet renders as the "TL;DR:" lead sentence of the blue callout under the title.
- set `recommendationsHeading: "Improvement ladder"`.
- `recommendations`: `{ "title": "...", "why": "...", "how": ["..."], "refIds": ["..."], "priority": "HIGH|MEDIUM|LOW" }[]` - **the ladder: exactly three tier cards, ordered Tier 1 -> 2 -> 3, each building on the one below.** Title each `Tier N - {label}: {one-line gist}` with labels `Foundational`, `Competitive`, `Best-in-class`. `why` (max 220 chars) says what this tier unlocks over the tier below, tied to benchmark evidence ("3 of 5 references do X"). `how` is 1-5 imperative moves at that tier, each max 160 chars. `refIds` lists the benchmark sections that show the tier (screenshots render inline; 2-3 render as options A/B/C). `priority` is optional - use it for the conversion impact of reaching the tier, or omit. Optionally add a fourth card titled `Avoid` whose `how` lists the anti-patterns that keep this section stuck.
- `references`: `{ "id": "...", "title": "...", "company": "...", "section": "...", "sourceUrl": "...", "screenshotUrl": "...", "caption": "...", "insight": "..." }[]` - `id` is a stable kebab-case slug; `insight` is the one-line what-to-notice, max 200 chars. Label web-captured examples `[Web]` in the caption. References not claimed by any finding render in an "All references" gallery at the bottom.
- optional `gapAnalysis` (max 6 rows, cells max 90 chars), `currentSnapshot` (max 6 items, collapsed at the bottom), `working`, `footer`
- optional `ungrounded: true` - only for explicit no-MCP runs; lifts the floor of at least 3 findings carrying `refIds`

The renderer enforces the budgets and the grounding floor, and fails loudly with the exact overruns. When it fails, rewrite the content shorter; never pad, never bypass the renderer with hand-written HTML. Put anti-patterns in `recommendations` too (a finding whose `how` says what to avoid), and source notes in `footer`.

Only fall back to hand-written HTML if the renderer cannot be run.

## Workflow

1. **Load context** - Read `.agents/webanatomy-context.md` when present.
2. **Confirm the one section** - Apply the scope guard above. Identify the single `section_type` (hero, pricing, testimonial, cta, faq, features, trust, etc.), the industry, and the target buyer. If the request is page/market/industry/competitor, hand to `find-examples`.
3. **Resolve industry and locale** - Always set an industry and locale before search: context first, explicit request second, fetched URL/page inference third, broad category fourth, `SaaS`/`B2B` and `en` fallbacks last.
4. **Search the section** - Use `search_sections` for that one section type. Run 3-5 angles: exact section in the industry, adjacent industry, broad market. Pull enough strong examples to span the range from table-stakes to standout.
5. **Inspect evidence** - Use screenshot URLs, strengths, and marker summaries to determine what is actually visible in each example.
6. **Build the ladder** - Sort the patterns into three tiers: **Tier 1 Foundational** (the table stakes this section must have to not lose), **Tier 2 Competitive** (what good pages add to win the click), **Tier 3 Best-in-class** (what the top sections do that most do not). Each tier is grounded in real benchmark sections; each builds on the tier below.
7. **Supplement current web research** - If browse/WebFetch is available, capture recent public examples for a tier. Label them `[Web]`, not benchmark examples.
8. **Write report and HTML** - Use relative image paths when references are downloaded.

## MCP Retrieval

Confirm the `webanatomy` MCP tools are available before searching. If connected, use live benchmark data. If not, tell the user up front ("Running without live benchmark data; using static guidance. Connect MCP for grounded results: https://www.webanatomy.ai/dashboard/mcp"), then continue with a clearly labeled static fallback. Never surface this as an error or block the run.

This skill works at the section altitude, so `search_sections` is the primary call. Run it for the one section type, across a few angles, with a high quality floor so the ladder spans real range:

```json
{
  "section_type": "<section_type>",
  "industry": "<resolved primary industry>",
  "locale": "<resolved locale>",
  "min_score": 80,
  "limit": 8
}
```

Use `search_pages` only for light context (how this section sits inside a strong page); never make whole-page or market patterns the deliverable - that is `find-examples`. Use section result fields `strengths` and `pattern_notes` as section evidence. Keep scores, thresholds, raw summary IDs, and marker data internal.

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

1. **TL;DR** (`summary`) - the section, where strong sits, and the tier to start at, 3 bullets max.
2. **Improvement ladder** (`recommendations` with `recommendationsHeading: "Improvement ladder"`) - the three tier cards in order (Tier 1 -> 2 -> 3), each shown through its benchmark section screenshots inline, plus the optional `Avoid` card.
3. **All references** - examples no tier claimed render automatically in the gallery, with `[Web]`/benchmark labels in their captions.
4. **Sources and corpus limits** go in `footer`.

Each tier must build on the one below: Tier 2 assumes Tier 1 is done, Tier 3 assumes Tier 2. Do not repeat a Tier 1 move inside Tier 2. Write to be skimmed: every `why` is 2 lines max tied to evidence ("4 of 6 references do X"), every `how` is imperative bullets, one idea per sentence. No prevalence adjectives without a count.

After saving, respond in chat with:

- the three tiers in one line each, and which tier you would start at for this user
- the report path
- any corpus, screenshot, or MCP limitations
- offer the handoff: "Want `improve-page` to apply a tier to the section?"

## Guardrails

- Keep scores, thresholds, field names, raw marker coordinates, and ranking mechanics internal.
- Do not invent customer names, proof, or metrics.
- Separate benchmark evidence from interpretation.
- If the benchmark corpus is thin, say so and broaden deliberately.
- Follow the shared house style in `webanatomy-setup/references/house-style.md`: no em-dashes, "The X…" not "Your X…", and never expose framework internals. Match the Locale from `.agents/webanatomy-context.md` when present.
