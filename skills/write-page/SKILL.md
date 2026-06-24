---
name: write-page
description: |
  The Fix-altitude executor in Web Anatomy. Improve an existing landing page, homepage, pricing page, persona page, feature page, comparator page, or individual section using Web Anatomy benchmarks, or build a new page or section from a chosen structure and direction. Use when the user asks what can you do to improve my LP, what can you do to improve my landing page, improve my site, critique, audit, redesign brief, section improvement, CRO review, why is this page weak, compare my page to best practices, write the rework, apply the fixes, or build this page or section. Runs in improve mode (captures current reality, gaps it against benchmarks) or build mode (no current page; writes the sections from the chosen spec). Consumes a prior audit-page, research-best-practices, or find-examples handoff when present, and writes a report under `.webanatomy/write-page/`.
metadata:
  version: 0.5.1
---

# Write Page

Classify -> capture -> route -> benchmark -> write. The flagship Web Anatomy copy engine: it writes the grounded words for a page, whether reworking an existing one (improve) or building a new one (build).

This is the **Fix altitude** of Web Anatomy: it turns a direction into grounded, copy-paste changes anchored to real benchmark pages, not generic advice. It is the executor the other skills hand off to. For a new page, `build-page` assembles what this skill writes into a shareable wireframe.

## Two modes

This skill runs in one of two modes. Detect which from the request and the available inputs:

- **Improve mode (default).** An existing page or section. Capture its current reality, gap it against the benchmark, and write the fixes. This is the path when the user has a live URL, a screenshot, pasted copy, or a page in their codebase.
- **Build mode.** A new page or section that does not exist yet (the create lane). There is no current reality to capture and no gap to measure. Take the chosen structure (a user-picked section list, a `find-examples` structure, or a `research-best-practices` tier) as the build spec, and write the sections from scratch, grounded in the same benchmarks. Skip the current-reality capture (Step 2) and the gap-vs-current framing; everything else (benchmark grounding, copy/design shaping, the report) is the same. If no structure exists yet, resolve it first with the light outline below. After the copy is written, the natural next step is `build-page`, which assembles the structure + this copy into a shareable wireframe.

### Build-mode structure (the light outline)

The benchmark exposes section examples and page scores, but no page-level section list or order. So when build mode has no upstream structure, resolve one cheaply, do not over-build it:

1. **Pick one exemplar homepage.** Use `find-examples` / `search_pages` for the resolved industry and let the user pick the one whose layout they want to follow. That single exemplar carries the section order (read it off the screenshot) and later drives the design in `build-page`.
2. **Adopt its section order**, falling back to a sensible archetype default when unclear (hero -> problem -> value_proposition -> how_it_works -> features -> social proof / testimonial -> pricing -> faq -> cta).
3. **Confirm the section list with the user** (let them add, drop, reorder). That confirmed list is the build spec.

This is a short step, not a separate skill. Do not search the benchmark for "the winning structure"; it is not there.

Most of the steps below are written for improve mode. Where build mode differs, it is called out inline. The skill is the executor either way: it does not invent the direction, it executes the diagnosis or spec it is given.

## Output Behavior

Always write:

- `.webanatomy/write-page/{page-or-section}-{YYYY-MM-DD}/report.md`
- `.webanatomy/write-page/{page-or-section}-{YYYY-MM-DD}/report.html`
- `.webanatomy/write-page/{page-or-section}-{YYYY-MM-DD}/references/`

The HTML report is the primary visual output. Chat is only a short summary and pointer to the saved files.

If the user only wants a quick chat answer, keep the report shorter but still save the artifact when file access is available.

## Deterministic Report Renderer

When file access is available, do not hand-write the final HTML. Write structured report data first:

- `.webanatomy/write-page/{page-or-section}-{YYYY-MM-DD}/report-data.json`

Then run the shared renderer from this skill pack:

```bash
node <skill-dir>/scripts/render-report.mjs --input=.webanatomy/write-page/{page-or-section}-{YYYY-MM-DD}/report-data.json
```

Resolve `<skill-dir>` relative to this `SKILL.md`. The renderer validates the report data, downloads every `screenshotUrl` into `references/`, writes `report.md`, writes `report.html`, and renders "screenshot unavailable" when no screenshot exists.

Use this report-data shape (v2):

- `title`: plain and descriptive, `{Company} {page archetype} - {kinds} opportunities` (for example "Weddink homepage - Copy and design opportunities"). No editorial or clever framing in the title; the insight belongs in the TL;DR.
- optional `eyebrow`, `subtitle`, `target`
- `summary`: `string[]` of max 3 bullets (each max 140 chars): the main gap, the strongest pattern, the start-here fix. No scene-setting paragraphs. The first bullet renders as the "TL;DR:" lead sentence of the blue callout; agent handoff happens through each recommendation's `prompt`, not a separate block.
- `recommendations`: `{ "title": "...", "why": "...", "how": ["..."], "refIds": ["..."], "priority": "HIGH|MEDIUM|LOW", "kind": "copy|design", "prompt": "..." }[]`
  - `why` is max 220 chars (2 lines). `how` is 3-5 imperative bullets, each max 160 chars.
  - `refIds` lists the ids of the references that ground this fix. The renderer shows their screenshots inline inside the recommendation card ("Inspired by"); 2-3 refIds render as options A/B/C.
  - `prompt` is a ready-to-paste agent prompt that applies the fix (one per recommendation). Write it self-contained: the page, the section, the move, and the constraints, so the user can paste it into their coding agent and the fix lands. The renderer collapses it behind a "Copy this prompt" toggle.
- `references`: `{ "id": "...", "title": "...", "company": "...", "section": "...", "sourceUrl": "...", "screenshotUrl": "...", "caption": "...", "insight": "..." }[]`
  - `id` is a stable kebab-case slug (`malt-testimonial`). `insight` is the one-line what-to-steal, max 200 chars. References not claimed by any recommendation render in a small "All references" gallery at the bottom.
- `working`: `string[]` of 2-4 bullets (each max 140 chars), what NOT to change.
- `gapAnalysis`: `{ "dimension": "...", "current": "...", "strongPattern": "...", "gap": "HIGH|MEDIUM|LOW" }[]`, max 6 rows, `current` and `strongPattern` max 90 chars each.
- `currentSnapshot`: `{ "label": "...", "text": "..." }[]`, max 6 items; rendered collapsed at the bottom as context, not content.
- optional `footer`
- optional `ungrounded: true` - only for explicit no-MCP runs; lifts the requirement that at least 3 recommendations carry `refIds`.

The renderer enforces the budgets and fails loudly with the exact overruns. When it fails, rewrite the content shorter; never pad, never bypass the renderer with hand-written HTML.

Only fall back to hand-written HTML if the renderer cannot be run.

## Step 0 - Check The MCP Connection

This workflow is benchmark-backed: without the Web Anatomy MCP it loses the real examples that make it worth running. Before anything else, verify the `webanatomy` MCP server is connected (call its health tool or check that its tools are listed).

If it is not connected, stop and tell the user plainly, and walk them through the setup:

> The Web Anatomy MCP is not connected, so this report would run without real benchmark examples and the quality drops a lot. To connect it (about 2 minutes): go to https://docs.webanatomy.ai/quickstart, create an account if you do not have one, request beta access, generate your token, then copy the ready-made config for your IDE. Or tell me to continue without benchmarks.

Offer to help apply the config once they have the token. Only continue without MCP if the user explicitly says so, and label the report as ungrounded in the TL;DR.

## Step 1 - Load Context

Read `.agents/webanatomy-context.md` if it exists. If it does not, continue with conservative assumptions. Offer `webanatomy-setup` as an optional preflight only when missing ICP, industry, competitors, conversion goal, or proof assets would materially change the recommendation. Do not block quick audits or URL-based feedback on setup.

## Step 1.5 - Use A Prior Report If One Exists (orchestration)

This skill is the executor: another Web Anatomy skill usually decided the direction first, and re-deriving it wastes the user's tokens and risks contradicting the earlier read. Before re-diagnosing, check for an upstream brief, in this order:

1. **An `audit-page` diagnosis** (improve mode) — the most common handoff. See below.
2. **A `research-best-practices` tiered report** — when the user picked a tier for a section ("apply Tier 2 to the hero"), treat the chosen tier's `how` bullets and its `refIds` as the brief: benchmark-ground and write exactly that tier, do not re-research the section. Reuse its `industry`/`locale`.
3. **A `find-examples` structure** (build mode) — when the user validated a page structure to build, treat the chosen structure as the section sequence to write, and benchmark each section.
4. **A user-chosen section list** (build mode, the create flow) — when the user picked the sections directly, treat that list (ordered per the light outline above) as the section sequence to write, and benchmark each section.

In every case the brief comes from upstream; your job is to ground it and write the fix, not to re-pick the direction. The shared product truth is always `.agents/webanatomy-context.md` (Step 1); the report above only adds the per-task direction.

### When the brief is an audit-page diagnosis

Look for the most recent `.webanatomy/audit-page/{target}-*/audit.json` whose `target` matches the page in this request.

If a matching `audit.json` is found (schema `webanatomy.audit-page.v2`, or `v1`
from older audits; in `v1` the severities are P-levels, map P0/P1 to HIGH, P2 to
MEDIUM, P3 to LOW, and recommendations carry no `kind`, so classify each as `copy`
or `design` yourself):

- Reuse its `industry`, `locale`, `currentSnapshot`, the `score` block, `strengths` (populate the report's `working` block from these), and `recommendations` instead of re-capturing, re-classifying, and re-prioritizing. Skip Steps 2, 3, and 4. The audit's `score.overall` is the framework-relative baseline (facts); the `recommendations` are the free CRO read; your contribution is the benchmark-relative view (how the page compares to real winners) plus the grounded fix.
- Benchmark (Step 5) the sections the recommendations name, `startHere` first, then the remaining HIGH recommendations. Do not re-rank.
- The hero rule still applies: if no reused recommendation touches the hero, benchmark the hero anyway and either add a hero recommendation or a "What's working" line saying why the hero should not change.
- Treat each recommendation's `opportunity` as the brief: search and recommend against exactly that move. When a recommendation carries `failedItemIds`, use them to target the exact gap.
- Still capture a fresh current screenshot for the report when browser tools are available.
- Note in the report TL;DR: "Built on the audit-page diagnosis from {date}."

If no matching report is found, do not silently re-diagnose and run end to end. This skill is the **executor**, and the diagnosis is its prerequisite, not its job:

- **Improve mode (existing page): run `audit-page` on this target first**, then execute its diagnosis. audit-page captures and verifies the page in the DOM (forms, CTAs, sections), scores it, and prioritizes the fixes, producing `.webanatomy/audit-page/{target}-{date}/audit.json`. Load that handoff and continue as above (reuse its `currentSnapshot`/`industry`/`locale`/`recommendations`, skip Steps 2-4, go to Step 5). Do this without asking; the chain `setup -> audit -> improve` is the intended flow.
- **Build mode (new page): there is nothing to audit.** The brief is the chosen structure — a user-picked section list (the create flow), a `find-examples` structure, or a `research-best-practices` tier; skip the audit, go to Step 3 with that spec. If no structure exists yet, resolve it first with the light outline (see Two modes).
- **Foundation check:** if `.agents/webanatomy-context.md` is missing (Step 1), offer `webanatomy-setup` once before the audit, but do not block on it. Proceed with conservative assumptions if the user declines.
- **Only** fall back to a standalone re-diagnosis (Steps 2-4 inline) if `audit-page` genuinely cannot run and there is no upstream brief. When you do, say so in the report TL;DR.

## Step 2 - Capture Current Reality

(Skip if a prior audit was loaded in Step 1.5; reuse its `currentSnapshot`. **Skip entirely in build mode** — a page being created has no current reality; go to Step 3 with the chosen structure as the spec.)

If the user provides a URL, screenshot, pasted copy, or local page:

- **Render the live page, do not just text-fetch it.** Browse the URL in a real browser (or read the page source in the codebase) before making recommendations. A plain text fetch or a "reader" extraction silently drops interactive markup: forms, input fields, and iframe-embedded widgets vanish from the text, so the page's primary CTA can disappear from your input entirely. When you only have a text fetch, say so and treat the capture as incomplete rather than confident.
- capture or save a current screenshot when browser tools are available
- extract headline, subheadline, CTA, proof, product visual, visual hierarchy, and visible friction
- **extract forms and interactive elements: inputs, embedded or iframe forms, multi-step forms, and the fields they ask for.** On a lead-gen page the form is the primary conversion element, not a detail. Never write a gap analysis that critiques the page while ignoring its main CTA. If the page is form-first and the capture did not surface a form, treat that as a capture failure and re-inspect (render the DOM, scroll, expand) before concluding the form is absent.
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

**Hero rule:** for any page-level run, `hero` is always one of the benchmarked sections, regardless of ranking. The fold is where most of the conversion decision happens, and the report always takes a position on it: either a hero recommendation (any priority) or a line in "What's working" explaining why the hero should stay as it is. Never silent on the hero.

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
2. `.agents/webanatomy-context.md` Locale
3. page language after current-reality capture
4. French URL/copy/product context -> `fr`
5. fallback -> `en`

**Locale does not restrict the example pool.** The resolved locale drives the
language of the copy you write, never which benchmark examples you may use. The
value of an example is the component's logic (structure, hierarchy, proof
placement), not the words in it: an English example is a fully valid reference
for a French page. Search `en` (the largest pool) by default; when the page is
`fr`, also run the same search with `locale: fr` and merge, keeping the
strongest patterns regardless of language. Never drop a stronger example
because of its language.

## Step 5 - Search Benchmarks

For whole homepage or landing-page work, first call `search_pages` once to collect full-page references for the resolved industry and locale:

```json
{
  "industry": "<resolved primary industry>",
  "locale": "<resolved locale>",
  "min_score": 60,
  "limit": 5
}
```

Use these page examples for overall positioning, proof strategy, page focus, and what strong companies in the category make visible. Then benchmark the priority sections. For each priority section, call `search_sections` with:

```json
{
  "section_type": "<section_type>",
  "industry": "<resolved primary industry>",
  "locale": "<resolved locale>",
  "min_score": 80,
  "limit": 5
}
```

Treat `min_score` as a preferred quality floor, not a hard promise. The MCP may relax internally to avoid thin result sets. Prioritize examples by relevance, visible evidence, and strongest available match.

If a secondary industry was inferred, run a second page search and/or section search with the secondary industry, then choose the examples that best match the user's business model.

**Grounding coverage:** run a `search_sections` call for every section a `design` recommendation touches, and always for the hero. At least 3 recommendations in the final report must carry references (`refIds`); the renderer rejects the report below that floor. A report where only the start-here fix shows examples reads as one good idea plus assertions. If the MCP is genuinely unavailable and the user said to continue, set `"ungrounded": true` in the report data and label it in the TL;DR.

Broaden only if results are thin. Use internal scores and criteria only for selection. Translate them into plain-English practices in the report.

**Build-mode call budget.** Build mode fires one `search_sections` per section, so a whole new page can mean many calls. The MCP rate-limits bursts (rapid calls return "Too many MCP requests"). Cap the benchmarked set at ~6-7 sections, space the calls (do not fire them all at once), and reuse one `search_pages` result for page-level positioning rather than re-querying. When a section returns `score_floor_relaxed: true` or too few results, broaden the industry or note the thin coverage in the report; do not silently present a weak example as a top one.

## Step 6 - Save Screenshots

For the current page:

- save the current screenshot as `references/current.png` when browser/screenshot tools are available
- if only text can be fetched, note that current screenshot is unavailable

For each selected benchmark result with `screenshot_url`:

1. Download it into `references/`.
2. Use a readable filename: `{company-slug}-{section-type}.png` for section examples or `{company-slug}-homepage.png` for page examples.
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

## Step 7.5 - Shape Each Fix By Its Kind

Every recommendation is typed `copy` or `design` (from the audit handoff, or
classify it yourself), and the type decides the deliverable:

- **`copy`** - the fix is wording. Read `references/copywriting-rules.md` and follow
  it: deliver 3-4 rewrite alternatives with genuinely different angles (outcome-led,
  pain-led, proof-led, category-led), never a single version, and strip the anti-AI
  tells it lists. Do this for the hero headline and for each content CTA the
  recommendation touches. The words come from the page, the context file, and the
  voice, not from the MCP - but the section still gets visual grounding: a hero copy
  fix carries 2-3 hero references in `refIds` showing what an audience-explicit,
  proof-backed fold looks like, so the reader sees the destination, not just the new
  words.
- **`design`** - the fix is structure, layout, hierarchy, or visual proof. Ground
  it in the benchmark: recommend the section pattern to follow with the reference
  screenshot and what makes it work.
- **Cluster rule** - when several design findings hit the same section, do not list
  N micro-fixes. Present 2-3 relevant benchmark variations of that section as one
  recommendation: put their ids in `refIds` (the renderer shows them side by side as
  options A/B/C), give each a one-line what-to-steal in its reference `insight`, and
  make the prompt carry the choice: "Pick one direction: (A) Malt photo carousel,
  (B) Synthesia video cards, (C) Beamly four-photo grid", with one line per option on
  how to apply it. The variations live in the prompt, not just in the report.
- **Missing module rule** - when a fix requires an asset the user does not have yet
  (testimonials, customer logos, metrics, case studies), do not stop at "add
  testimonials". Give a short step-by-step plan to create the module: what to
  collect, from whom, in what format, and a tool when one genuinely helps (for
  example Senja or Testimonial.to for collecting testimonials). The value is in
  the how, not just the what.

## Step 8 - Write Report

Fill the v2 report-data shape and let the renderer produce both files. The report opens with a short strengths block, then the prioritized fixes (lead with what works so a pure-criticism read does not land badly on an owner attached to the page), and stays a reverse pyramid from there (what to do first, evidence beside the claim):

1. **TL;DR** (`summary`) - the blue callout right under the title. The first bullet renders as the "TL;DR:" lead sentence; bullets 2-3 follow as a short list. 3 bullets max.
2. **What's working** (`working`) - 2-4 things NOT to change, in a short block right under the TL;DR and above the fixes. Include the hero here when it needs no fix. Keep it tight: this is the cushion before the fixes, not the body of the report. When a prior audit supplied `strengths`, reuse them here.
3. **Recommendations** (`recommendations`) - numbered, priority order, recommendation #1 is the start-here pick. Each carries its own evidence via `refIds`; there is no separate "Benchmark Matches" section. Copy fixes carry their 3-4 angle alternatives inside `how`; design fixes carry their benchmark variations as options A/B/C.
4. **Gap analysis** (`gapAnalysis`) - max 6 rows.
5. **All references** - rendered automatically from references no recommendation claimed.
6. **Current reality** (`currentSnapshot`) - collapsed at the bottom, context not content.

### Style rules (apply to every field)

Write to be skimmed. The renderer enforces the budgets; these rules are how to live inside them:

- Every `why` is 2 lines max. Every `how` is 3-5 imperative bullets starting with a verb.
- One idea per sentence. If a sentence has two commas and an "and", split it or cut it.
- Banned openers: "The page reads as", "It's worth noting", "This is a great opportunity to", "In today's", restating the recommendation title inside the `why`.
- No prevalence adjectives without a count. "Most strong pages" needs "4 of 5 references".
- Index the why on evidence, not adjectives: point at the reference, not at "best practice".
- Cut throat-clearing and restatement. The title already says what the fix is; the `why` says only what it costs to not do it.

After saving, respond in chat with:

- the highest-impact fix
- 2-3 supporting benchmark patterns
- any screenshot, corpus, or MCP limitations

Then hand the user the report explicitly. Users do not know an HTML file exists or how to open it, so:

1. Say the visual report is ready and give the full path to `report.html`.
2. Offer to open it for them, and do it on yes: `open <path>` (macOS), `xdg-open <path>` (Linux), `start <path>` (Windows).
3. Propose the concrete next move so the report leads to action:
   - **Build mode (create flow):** default to `build-page` — "Want me to assemble this into a shareable wireframe?" It takes this copy + the structure + the chosen exemplar's look and produces the page you can show someone.
   - **Improve mode:** "Want me to implement the top fix?", "Want 3-4 copy alternatives for the [weakest section] with different angles?", or `build-page` to see the improved page assembled as a shareable wireframe (exemplar = the current page's own look). Default to implementing the top fix.

## Use The Audit Method

Read `references/audit-method.md` before writing the gap analysis.

## Guardrails

- Be specific about what to add, remove, rewrite, or move.
- Do not recommend copying a reference exactly. Adapt the pattern.
- Do not invent proof the user does not have.
- If the page cannot be inspected, say what input is missing and switch to a market-pattern report.
- Follow the shared house style in `webanatomy-setup/references/house-style.md` for the report and any rewritten copy: no em-dashes, "The X…" not "Your X…", gap labels (HIGH/MEDIUM/LOW) not P-levels, and never expose framework internals. When `.agents/webanatomy-context.md` records a Voice and tone or a Locale, write the rework copy in that voice and language. Always answer in the user's language (chat included): a French user or site means the whole exchange is in French.
