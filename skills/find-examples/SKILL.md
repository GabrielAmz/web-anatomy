---
name: find-examples
description: |
  The Page-altitude benchmark scan in Web Anatomy. Pull the top-ranked WHOLE pages and section patterns in a market and show their structure, positioning, and copy insights, and when the user shares their own page, how it compares and what to steal. Use when the user asks to find examples, show references, get inspiration, find strong homepages, find strong sections, show SaaS pricing examples, show AI hero examples, find testimonial patterns, a swipe file, what top pages do, market patterns, competitive research, score this page vs benchmark, compare my URL to best-in-class pages, gap analysis against competitors, or how far are we from strong examples. For DEEP work on a single section (a tiered improvement ladder), use research-best-practices instead. When the user is building a new page, this is also where they pick one exemplar homepage whose structure and look the build will follow. Uses the Web Anatomy MCP search_pages and search_sections tools when available, keeps internal scores hidden, and writes a visual report under `.webanatomy/find-examples/`.
metadata:
  version: 0.5.0
---

# Find Examples

Pull the strongest real pages and sections in a market and hand back what to steal.

This is the **Page altitude** of Web Anatomy: the market view. What the best pages in an industry do (structure, positioning, proof, copy), and how the user's own page compares when they share it.

## Two modes

- **Discover (default).** The user wants inspiration or a swipe file. Retrieve, filter, group by pattern, and give them the best examples to open. No page of their own required.
- **Compare.** The user shares their URL, screenshot, or page and wants to see how it stacks up. Do everything Discover does, then add a light gap read: how their page compares to the benchmark winners, labeled HIGH/MEDIUM/LOW, plus what is already working. If a recent `audit-page` report exists for that target, use its findings to make the comparison specific; if not, keep it lighter and more general. This is the merged home of the old benchmark-compare.

Both modes stay lighter than `research-best-practices`, which goes deep on one section with a tiered ladder. This skill is the market scan; that one is the section deep-dive. For the grounded rework or the build, hand off to `write-page`.

**Building a new page?** This is where the user picks the exemplar. Surface the top homepages for the industry, let them choose ONE whose layout they want to follow, and hand off: its section order seeds the structure for `write-page` build mode, and the same exemplar drives the design in `build-page`. One pick, used twice (structure, then look). The benchmark has no stored page structure, so the exemplar's own section order is the source.

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

Use this report-data shape (v2):

- `title`: plain and descriptive (`{Topic} - benchmark examples`), no editorial framing
- optional `eyebrow`, `subtitle`, `target`
- `summary`: `string[]` of max 3 bullets (each max 140 chars) on what the examples show. The first bullet renders as the "TL;DR:" lead sentence of the blue callout under the title.
- `recommendations` used as **patterns** (set `recommendationsHeading: "Patterns"`): `{ "title": "...", "why": "...", "how": ["..."], "refIds": ["..."] }[]` - one entry per plain-English pattern. `title` is the pattern name; `why` (max 220 chars) is what makes it work; `how` is 1-5 adaptation bullets, each max 160 chars; `refIds` lists the example references showing it (their screenshots render inline; 2-3 render as options A/B/C). Skip `priority`/`kind`/`prompt`; this is a swipe file, not an audit.
- `references`: `{ "id": "...", "title": "...", "company": "...", "section": "...", "sourceUrl": "...", "screenshotUrl": "...", "caption": "...", "insight": "..." }[]` - `id` is a stable kebab-case slug; `insight` is the one-line what-to-notice, max 200 chars. References not claimed by a pattern render in an "All references" gallery at the bottom; for a flat ranked list, leave `recommendations` empty and let all references render in the gallery.
- `gapAnalysis` (**compare mode only**): `{ "dimension": "...", "current": "...", "strongPattern": "...", "gap": "HIGH|MEDIUM|LOW" }[]`, max 6 rows, `current` and `strongPattern` max 90 chars each. The light read of the user's page against the benchmark winners. Omit in discover mode.
- `currentSnapshot` (**compare mode only**): `{ "label": "...", "text": "..." }[]`, max 6 items, the user's current page facts; rendered collapsed at the bottom. Omit in discover mode.
- `working` (**compare mode only**): `string[]` of 2-4 bullets, what the user's page already does well. Omit in discover mode.
- optional `footer`
- set `ungrounded: true` only on explicit no-MCP runs

The renderer enforces the budgets and fails loudly with the exact overruns. When it fails, rewrite the content shorter; never pad, never bypass the renderer with hand-written HTML.

Only fall back to hand-written HTML if the renderer cannot be run.

## Inputs To Infer

Infer these from the request and `.agents/webanatomy-context.md` when available:

- scope: whole homepage/landing page inspiration vs individual section pattern
- page type: homepage for whole-page benchmark examples in v1
- section type: hero, pricing, testimonial, value_proposition, cta, features, trust, faq, integrations, use_cases
- industry: user's context first, then request/URL/page inference, then broad fallback
- locale: request/page language first, then default `en`
- intent: swipe file, redesign inspiration, competitor reference, or section pattern

If the request is for homepage or landing page examples, set scope to whole page and use `search_pages` first. If the section type is unclear for a section-level request, map aliases:

- "above the fold" -> hero
- "customer proof" -> testimonial or trust
- "plans" -> pricing
- "logos" -> trust
- "value prop" -> value_proposition
- "use case" -> use_cases
- "CTA band" -> cta

Ask one clarifying question only when the same request could map to different section types and the difference matters.

## Compare Mode (when the user shares their own page)

Trigger compare mode when the user gives a URL, screenshot, pasted copy, or local page and wants to know how it stacks up ("compare my page", "how far are we from the best", "gap analysis"). Discover mode runs first (find the market winners); then layer the comparison on top.

1. **Capture the user's page.** If a URL, fetch or browse it before comparing. Capture a screenshot to `references/current.png` when browser tools are available; if only text is fetched, note the screenshot is unavailable. Extract headline, CTA, proof, and visible structure into `currentSnapshot`. Do not compare against an imagined page.
2. **Reuse a prior audit if one exists.** Look for the most recent `.webanatomy/audit-page/{target}-*/audit.json` matching the page. If found, use its `recommendations` and `currentSnapshot` to make the gap read specific and aligned with the diagnosis, rather than re-judging from scratch. If none exists, keep the comparison lighter and more general.
3. **Compare on the dimensions that matter for the visible sections** (do not over-audit low-impact sections when the hero, pricing, or proof is the real gap):
   - Hero: category clarity, outcome specificity, CTA clarity, proof proximity, product visual, risk reduction, hierarchy
   - Pricing: plan distinction, preferred plan, billing toggle, trial/demo path, objection handling, enterprise path
   - Testimonial: named buyer, title/company, quantified outcome, before/after specificity, visual credibility
   - Trust: logo relevance, proof density, security/compliance, social-proof proximity
   - CTA: action specificity, motivation, risk reduction, prominence, next-step clarity
   - Features: benefit translation, product evidence, use-case grouping, scanability
   - FAQ: objection quality, answer specificity, docs links, pricing/migration/trust coverage
4. **Label each gap** `HIGH`, `MEDIUM`, or `LOW` and put the rows in `gapAnalysis`; capture 2-4 `working` bullets. Keep it a light read, not a full rework. For the grounded rework or build, hand to `write-page`.

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

Confirm the `webanatomy` MCP tools are available before searching. If connected, use live benchmark data. If not, tell the user up front ("Running without live benchmark data; using static guidance. Connect MCP for grounded results: https://docs.webanatomy.ai/quickstart"), then continue with a clearly labeled static fallback. Never surface this as an error or block the run.

Use the `webanatomy` MCP tools when available. Use `search_pages` for whole-homepage inspiration and `search_sections` for specific section patterns.

For whole-page or homepage examples, start with:

```json
{
  "industry": "<resolved primary industry>",
  "locale": "<resolved locale>",
  "min_score": 60,
  "limit": 8
}
```

For section-level examples, start with:

```json
{
  "section_type": "<section_type>",
  "industry": "<resolved primary industry>",
  "locale": "<resolved locale>",
  "min_score": 80,
  "limit": 8
}
```

Treat `min_score` as a preferred quality floor, not a hard promise. The MCP may relax internally to avoid thin result sets. Keep the highest-priority examples first and choose final examples by relevance, visible evidence, and business-model fit.

If a secondary industry was inferred from page text, run a second search with the secondary industry and keep whichever examples best fit the business model.

If the result set is thin:

1. lower the internal floor,
2. drop industry,
3. for section searches, try a neighboring section type,
4. then use named static references only as fallback.

The tool may expose fields such as `score`, `criteria_hits`, marker coordinates, or raw scoring summaries. Use those internally to choose examples, but never expose them.

For page results, use `analysis_bullets`, `strengths`, and `stealable_moves` as plain-language evidence. For section results, use `strengths` and `pattern_notes`. There are no `how`/`why`/`evidence` sub-fields to read.

## Selection Rules

Pick 5-10 examples. Prefer:

- direct page-scope or section-type match
- same or adjacent industry
- named company and source URL present
- screenshot URL present
- strengths that clearly match the user's ask
- marker-backed examples when explaining visible composition

Do not include a screenshot or company just because it is famous. The example has to illustrate the pattern.

## Screenshot Handling

For each selected benchmark result with `screenshot_url`:

1. Download it into `references/`.
2. Use a readable filename: `{company-slug}-{section-type}.png` for sections or `{company-slug}-homepage.png` for page examples.
3. Reference it from `report.md` with a relative path.
4. Include it in `report.html`.

If download fails, keep the example only if the text evidence is strong. Label it as "screenshot unavailable" and include the source URL when present.

Do not expose marker JSON. If markers are available, translate them into visible composition notes.

## Report Output

Fill the v2 report-data shape and let the renderer produce both files. The report reads in this order:

1. **TL;DR** (`summary`) - the blue callout, 3 bullets max. In compare mode, the first bullet is the verdict (how the page sits vs the market).
2. **Patterns** (`recommendations` with `recommendationsHeading: "Patterns"`) - one numbered card per pattern, its example screenshots inline, adaptation steps as `how` bullets.
3. **Gap analysis** (`gapAnalysis`, compare mode only) - the user's page vs the strong pattern, labeled HIGH/MEDIUM/LOW.
4. **What's working** (`working`, compare mode only) - 2-4 things to preserve.
5. **All references** - the remaining examples render automatically in the gallery.
6. **Current reality** (`currentSnapshot`, compare mode only) - collapsed at the bottom.

When the user asks for a swipe file, group by pattern (one card per pattern, examples in `refIds`). When they ask for a flat ranked list, leave `recommendations` empty and let all references render in the gallery in rank order. In compare mode, always include the gap layer.

After saving, respond in chat with:

- the 2-3 strongest patterns (discover) or the verdict + top 3 gaps (compare)
- the report path
- any corpus or screenshot limitations
- in compare mode, offer the handoff: "Want `write-page` to turn the top gap into the grounded rework?"

## Guardrails

- Never show internal scores, thresholds, raw field names, or coordinate JSON.
- Do not claim conversion lifts unless the user supplied them.
- Translate benchmark mechanics into plain language. Example: `risk_reducer` becomes "risk is lowered before the click."
- If MCP is unavailable, say that benchmark search is unavailable and provide a static, clearly labeled fallback.
- Follow the shared house style in `webanatomy-setup/references/house-style.md`: no em-dashes, "The X…" not "Your X…", and never expose framework internals. Match the Locale from `.agents/webanatomy-context.md` when present.
