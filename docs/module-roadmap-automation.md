# Section Roadmap automation · learnings and design

Status: design proposal v2 · 2026-06-12
Source case: Hiway "Roadmap Modules" Notion deliverable (inline DB "Nouveaux modules a creer", ~20 section pages, built semi-manually with the webanatomy MCP + Notion REST + headless browse).

Scope decision (v2): this operates at the **page level**, not the website level. The unit of analysis is one page (homepage, pricing page, persona page...). The skill identifies the sections that page has, compares its composition against benchmark pages of the same archetype and industry in the corpus, and recommends sections to **Revamp** (present but weak) or **Create** (absent on the page but present on strong industry pages).

## 1. The deliverable we are automating

One Notion page (or local HTML equivalent) containing:

1. **An inline database** · one row per section of the target page, with this exact schema (proven with a real client):
   - `Module` (title) · the section name
   - `Action` (select) · `Revamp` | `Create`
   - `Priority Level` (select) · `P0`..`P4`
   - `Impact` (select) · `High` | `Med` | `Low`
   - `Effort` (select) · `S` | `M` | `L`
   - `Goal` (multi-select) · `UX` | `SEO` | `Conversion`
   - `Current challenges` (rich_text) · one-line diagnosis
   - `Proposed Solutions` (rich_text) · one-line direction
   - `🔴 Module actuel` (files) · screenshot of the client's current section
   - `🟢 Benchmark` (files) · benchmark screenshots (public URLs)

2. **One report page per section**, with a fixed 5-part body:
   - H1: `🧩 {Section} · {Priority} · {Action} · {Goal}` + divider
   - `🔴 1. Etat actuel` · current-section screenshot + 1 factual bullet (real H1, CTAs, proof, visual) · for `Create` rows: "absent, present on X of Y benchmark pages"
   - `🟠 2. Probleme existant` · the gap, stated against the *verified* current state
   - `🟢 3. Benchmarks` · 3-4 annotated benchmark images, captions citing the concrete visible practice + clickable source URL
   - `✅ 4. Bonnes pratiques` · tagged bullets `[COPY]` `[DESIGN-UX]` `[VISUEL]` `[PREUVE]`, each citing the companies that show it
   - `🎯 5. Recos` · concrete moves for this client, one bullet per element (title, CTA, proof, visual)

This is effectively a **fleet version of improve-page**: same grounding logic, but run across every section of a page, with a corpus-derived composition baseline, a prioritization layer, and a Notion publishing target.

## 2. Learnings from doing it manually

### 2.1 The section set must come from the corpus, not from the user or the page alone

Two failure modes to avoid:
- Asking the user "which sections does your page need" produces opinion, not evidence.
- Reading only the target page tells you what exists, never what is missing.

The right baseline: **what do strong pages of the same archetype + industry + locale contain?** The corpus already links pages to their sections, so the expected-section set is computable: pull the top N benchmark pages for the archetype/industry, count section prevalence, and the result is the baseline ("8 of 10 top Fintech homepages have a how_it_works"). A section the target page lacks but most benchmark pages have is a `Create` candidate with evidence attached. Business-model filters still apply on top (Hiway skipped `integrations` · service business, no connectors) but as an exclusion step, not as the source of the list.

### 2.2 Never trust a prior audit's Revamp/Create labels · verify live

The single biggest quality issue: the source audit said `Create` for sections that already existed in good shape (hero already had dual CTA + 4.8/5 rating; FAQ was already an accordion; footer already siloed). Every section must be **verified in the rendered DOM** before its `Action` is set. This mirrors the audit-page hard rule ("never assert an element is missing from a screenshot") but at section granularity.

### 2.3 Section-precise capture is the hard part, and it has a recipe

Full-page screenshots are useless for a per-section DB. The working recipe (headless browser):

1. Load the apex/canonical host (gotcha: `www.hiway.fr` timed out, `hiway.fr` worked · always test both).
2. Wait for network idle (third-party embeds paint late), dismiss cookie overlays (Axeptio/OneTrust cover the hero).
3. Scroll the full page once to trigger lazy loading.
4. Locate the section: query the DOM for the section's heading text → walk up to the enclosing `section.<class>` → scroll it into view → element-scoped screenshot (`screenshot --selector`).
5. Name deterministically: `{section}_actuel_{client}.png`.

The same DOM walk doubles as the **section segmentation** pass: enumerate the page's top-level `section`/landmark elements in order, classify each against the taxonomy (by heading text, content signals, position), and you get the page's actual composition for free.

### 2.4 Benchmark retrieval is already solved by the MCP, with two twists

- `search_sections {section_type, industry, locale, min_score: 80, limit: 5}` per section works. For FR clients, search `fr` AND `en` and merge (the en pool is much larger; the component logic transfers).
- The corpus screenshots are **public supabase URLs** · they embed directly as `external` image blocks in Notion with zero upload work. Keep using them; only the client's own captures need real file upload.
- Caption quality matters more than image count: each caption must cite the concrete visible practice ("900 000 entrepreneurs + Trustpilot 4,5/5 under the CTA, des 0 EUR + frais, segmented dual CTA") + the live source URL.

### 2.5 The corpus is writable, and the loop matters

During the Hiway run the taxonomy itself was extended: `problem` and `resources` did not exist as section types in supabase, so we **added them** (rows created via REST `POST /v1/pages` against the corpus backend, 2026-06-12). That is the precedent for a standing contribution loop:

- When a run surfaces a section type, or a strong live example, that the corpus does not cover, write it back (new section type rows, new benchmark page/section entries with screenshot + source URL).
- The payoff compounds: the next run for any client in that industry can recommend those sections with corpus evidence instead of analyst memory. `problem` and `resources` are now recommendable forever because of one client engagement.
- This needs to be a deliberate, quality-gated step (not auto-ingest): the analyst confirms the example is benchmark-grade before it enters the corpus.

### 2.6 Prioritization was manual judgment · it should be a deterministic script

Impact, Effort and P0-P4 were assigned by hand. The repo already has the right pattern for this: audit-page's `score.mjs` (model judges inputs, script owns weights and arithmetic, output is reproducible). Prioritization should work the same way, with the corpus prevalence feeding the weight (see §4.3).

### 2.7 Notion publishing mechanics (all verified working)

- Create the inline DB under the parent page with the §1 schema, then one child page per row.
- **Client screenshots** (files property + body image): Notion native file-upload REST, 3 steps, `Notion-Version: 2022-06-28`:
  1. `POST /v1/file_uploads` `{"filename","content_type":"image/png"}` → `id` + upload URL (note: a newer API variant rejects filename/content_type in the body · then POST `{}` and let the multipart part carry the filename)
  2. `POST /v1/file_uploads/{id}/send` with `-F "file=@path;type=image/png"`
  3. Attach: `{"type":"file_upload","file_upload":{"id":...}}` in a files property or image block.
- **Benchmark images**: `{"type":"external","external":{"url": <supabase public url>}}` · no upload.
- The Notion MCP tool schema only advertises paragraph/bulleted_list_item, but the API behind it accepts `heading_1`, `heading_2`, `divider`, `image` · use real headings and dividers, not bold paragraphs.
- Do not use screenshot proxies (thum.io & co) · rejected by the client; native uploads or public corpus URLs only.

### 2.8 Cost profile

~20 sections took multiple working sessions. The two bottlenecks were (a) section-precise capture and (b) per-section benchmark curation + caption writing. Both parallelize cleanly per section once the composition map exists · this is a natural fan-out workload.

## 3. Gap analysis · pipeline stage vs current skill pack

| Stage | What it needs | Today in the repo | Gap |
|---|---|---|---|
| Composition baseline | Section prevalence across benchmark pages of the archetype/industry | `search_pages` returns page examples but not their section composition | MCP gap + new method |
| Map the target page | Segment one page into sections, DOM verify, capture, judge state, Revamp/Create | `audit-page` has the capture rules but no per-section artifact or composition diff | New skill |
| Prioritize | Ponderation: prevalence x conversion weight x state gap x effort → P0-P4 | Nothing (audit-page severities are per-finding, not per-section) | New deterministic script |
| Per-section report | Benchmarks + best practices + recos per section | `improve-page` / `benchmark-compare` do exactly this for ONE target | Fleet orchestration + the 5-part template |
| Publish | Notion DB + child pages (or local HTML index) | Renderers output local md/html only | New output adapter |
| Corpus write-back | Add missing section types / benchmark examples to supabase | Nothing (done by hand via REST for problem/resources) | New script + reference |

## 4. Proposed architecture

Five additions. Reuse everything else (capture rules, MCP retrieval rules, house style, renderer philosophy).

### 4.1 Composition baseline · `expected-sections` from the corpus

For the target page's archetype + industry + locale:

1. `search_pages {industry, locale, min_score: 60, limit: 10}` → top benchmark pages.
2. For each, get its section composition (ideally one MCP call · see §4.6; fallback: `get_page` per uuid if it returns linked sections).
3. Compute prevalence per section type → `baseline.json`:

```json
{
  "schema": "webanatomy.baseline.v1",
  "archetype": "homepage",
  "industry": "Fintech",
  "locale": "fr",
  "pagesSampled": 10,
  "sections": [
    { "type": "hero",         "prevalence": 1.0 },
    { "type": "how_it_works", "prevalence": 0.8 },
    { "type": "problem",      "prevalence": 0.6 },
    { "type": "integrations", "prevalence": 0.5, "excluded": "service business, no connectors" }
  ]
}
```

Business-model exclusions are applied here, recorded with their reason (never silently dropped). Prevalence is the evidence string used in `Create` rows: "present on 8 of 10 benchmark pages".

### 4.2 New skill `map-sections` · page composition + state

Input: target page URL + `baseline.json`. One pass over the rendered page:

1. Segment the page into its ordered sections (DOM walk from §2.3) and classify each against the taxonomy.
2. Element-scoped screenshot per section → `.webanatomy/map-sections/{page}-{date}/captures/{section}.png`.
3. Judge `state` 0-3 (0 missing · 1 weak · 2 decent · 3 strong) against 3-5 type-specific checks (subset of the audit-page rubric per section type), with `evidence_note`.
4. Diff against the baseline: present-and-weak → `Revamp`; absent-but-prevalent → `Create` (with the prevalence evidence); present-and-strong → `keep`; present-but-rare-in-corpus → flag for the corpus write-back review (§4.5), it may be a differentiator worth ingesting.
5. Record the factual `currentSnapshot` bullet (real H1, CTAs, proof) · this becomes "Etat actuel" downstream.

Output: `composition.json` (one entry per section, both found and missing: `type`, `present`, `state`, `action`, `effort` S/M/L judged from the change scope, `challenge` one-liner, `capturePath`, `prevalence`, `evidence`). Hard rules carried over: never `Create` without DOM verification; never judge `state` from a too-early screenshot.

### 4.3 New script `scripts/prioritize.mjs` · deterministic ponderation

Same contract as `score.mjs`: the model supplies judged inputs (`composition.json` + `baseline.json`), the script owns the math. Sketch:

```
weight = roleWeight[type] x (0.5 + 0.5 x prevalence)   // conversion role x corpus evidence
opportunity = weight x (3 - state)                      // missing section: state 0
effortFactor = {S: 1.0, M: 0.75, L: 0.5}
score = opportunity x effortFactor[effort]
P0..P4 by score bands · impact = f(opportunity), ignores effort on purpose
```

`roleWeight` defaults (overridable): hero 10 · pricing 9 · cta 8 · testimonial/trust 8 · value_proposition 7 · how_it_works 6 · features 6 · faq 6 · comparison/use_cases/problem 5 · navbar 5 · about/contact 4 · footer 4 · resources 2.

Output `roadmap.json`: sections sorted by score, each with computed `priority`, `impact`, and the inputs that produced them (auditable). Thresholds live in the script, never exposed in reports. `keep` sections land in a "What's working" list instead of the roadmap.

### 4.4 New skill `section-roadmap` · the orchestrator

Steps:

0. MCP check (same gate as improve-page).
1. Resolve archetype/industry/locale (existing resolution rules). Build or load `baseline.json` (§4.1), then `composition.json` (§4.2, run `map-sections` if missing or stale).
2. Run `prioritize.mjs` → `roadmap.json`.
3. Per section (parallelizable, priority order): `search_sections` (locale + en merge), select 3-4 references with the caption-quality bar (§2.4), write the 5-part report content as structured data. Reuse improve-page's copy/design typing, cluster rule, missing-module rule, and writing budgets verbatim. For `Create` rows, the benchmarks ARE the spec: the recos describe the section to build, anchored on 2-3 corpus variations (options A/B/C).
4. Render. Two adapters from the same `roadmap-data.json`:
   - **Local (default)**: `index.html` (the DB as a sortable table, thumbnails, priority badges) + one `sections/{type}.html` per section. Extend the shared `render-report.mjs` pattern with a `scripts/render-roadmap.mjs`.
   - **Notion (optional)**: `scripts/publish-notion.mjs` + `references/notion-publishing.md` encoding §2.7 (DB creation, file-upload 3-step, external benchmark images, real heading/divider blocks). Token via env/MCP config; idempotent (update existing rows by Module title rather than duplicating).

`roadmap-data.json` per-section shape: `{ type, title, action, priority, impact, effort, goals[], challenge, solutions, capturePath, currentSnapshot, prevalence, problem, benchmarks: [{company, sourceUrl, screenshotUrl, caption}], practices: [{tag: "COPY|DESIGN-UX|VISUEL|PREUVE", text, companies[]}], recos: [string] }`.

### 4.5 Corpus write-back · `scripts/contribute-corpus.mjs` + reference

The standing loop from §2.5, quality-gated:

1. During a run, collect candidates: section types absent from the taxonomy (the `problem`/`resources` precedent), and live sections observed during capture that are benchmark-grade (strong pattern, clean screenshot, named company).
2. Present the candidates to the analyst with the evidence; nothing enters the corpus without explicit confirmation.
3. On confirmation, write to supabase via the REST path proven on 2026-06-12 (`POST /v1/pages` and the section endpoints), with screenshot upload to the public bucket and the standard metadata (company, section_type, industry, locale, source_url, strengths).
4. Log what was contributed in the run output, so the client report and the corpus stay traceable to each other.

Reference doc `references/corpus-contribution.md`: the REST endpoints, required metadata, screenshot bucket conventions, and the quality bar (visible pattern, named company, working source URL, no famous-but-generic entries).

### 4.6 MCP server wishlist (server-side)

- **`page_composition`** (page uuid or url → ordered list of its section types): the missing primitive for §4.1. Without it the baseline needs N `get_page` calls or manual reads.
- **`capture_section`** (url + section_type → element screenshot) would remove the local headless-browser dependency, the #1 bottleneck.
- **`ingest_section` / `ingest_page`** (authenticated write tools) so the §4.5 write-back stops depending on raw REST calls.
- Batch `search_sections` (multiple types in one call) to cut N round-trips to 1.
- `list_section_types` so runs never drift from the corpus taxonomy.

## 5. Rollout plan

1. **Phase 1 · prioritize + orchestrate (highest leverage, no new capture tech)**: `prioritize.mjs`, `section-roadmap` skill with the local HTML adapter, baseline built from `search_pages` + manual composition reads.
2. **Phase 2 · `map-sections`** with the shared section-capture reference, element-scoped screenshots, and the baseline diff.
3. **Phase 3 · Notion adapter** (`publish-notion.mjs` + publishing reference).
4. **Phase 4 · corpus write-back** (`contribute-corpus.mjs` + reference), plus the `page_composition` / `ingest_*` MCP tools if server work is on the table.
5. **Evals**: replay the Hiway homepage end-to-end as the fixture · the known-good Revamp/Create labels (including the traps where the audit said Create but the page was fine), the `problem`/`resources` corpus additions, and the published Notion structure are all ground truth we already have.

## 6. Open questions

- Site-wide chrome (navbar, footer) belongs to every page. Treat it as part of the page run that owns it (the homepage by convention) or as a separate `chrome` run? Recommend: include in the homepage run, skip silently in subsequent page runs unless flagged.
- Should `section-roadmap` accept an existing external audit as a *hint* source for challenges (clearly labeled, always DOM-verified before use)? The Hiway case says hints are useful but dangerous; if accepted, force re-verification.
- Prevalence sample quality: 10 benchmark pages is a thin sample for niche industry x locale combos. The baseline should report its sample size and fall back to the adjacent industry or `en` locale when thin, stating so.
- Effort judgment: keep it model-judged (S/M/L from change scope) or derive it (Create=L default, Revamp scales with state)? Recommend model-judged with the derivation as the default suggestion.
