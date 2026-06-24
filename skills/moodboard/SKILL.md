---
name: moodboard
description: |
  The page-level Moodboard in Web Anatomy. Build a section-by-section visual reference board for a whole page (homepage, landing page, money page): for every section, the current state captured large, the problems identified, a grid of benchmark screenshots with the practice each one shows, the discipline-tagged best practices, and the recommendation. Use when the user asks for a moodboard, a section-by-section reference board, a visual brief for a redesign, a design reference deck, a redesign inspiration board, "show me each section against competitors," "build a moodboard for my homepage," "what should each block look like," or a board to hand to design or import into Figma. The skill generates the content itself: it captures the live page section by section and pulls benchmarks from the Web Anatomy MCP. It does not depend on any external doc. How it differs from the neighbors: benchmark-compare scores one target against winners and labels each gap HIGH/MEDIUM/LOW (a verdict on one URL or section); moodboard composes the whole page, every section, as a visual board you build from, not a scored gap report. find-examples is a single-section swipe file; research-best-practices is a narrative report; improve-page is a grounded rework with copy-paste fixes. Writes report.md, report.html, and references/ under `.webanatomy/moodboard/`.
metadata:
  version: 0.1.0
---

# Moodboard

Assemble a section-by-section visual moodboard for a page. For every section the report shows the current state large, the problems identified beside it, a grid of benchmark screenshots each captioned with the practice it demonstrates, the best practices grouped by discipline, and the recommendation for the brand.

This is the **page altitude, visual-first** output of Web Anatomy. It generates its own content: it captures the live page section by section (the same on-page reading `audit-page` does) and pulls benchmarks per section from the MCP (the same retrieval `find-examples` does), then composes both into one scrollable board.

## How moodboard differs from the neighbors

Keep the routing clean. The closest neighbor is `benchmark-compare`, and they share the same MCP retrieval underneath, so the distinction matters.

- **`benchmark-compare`** takes **one** target (a URL, screenshot, or pasted section) and returns a **verdict**: a gap analysis where each gap is labeled `HIGH`, `MEDIUM`, or `LOW`. The screenshots are evidence for the gaps. Use it to answer "how far is this from the winners, and what is the biggest gap."
- **`moodboard`** takes the **whole page** and returns a **reference board**: every section in scroll order, the current state large beside the problems, and a grid of benchmark screenshots as the centerpiece. The screenshots are the point. Use it to answer "what should each block look like, as a brief I can hand to design or import into Figma." It does not score gaps.
- **`find-examples`** is one section's swipe file. **`research-best-practices`** is a narrative report. **`improve-page`** is a grounded rework with copy-paste fixes.

In short: benchmark-compare scores a gap on one target; moodboard composes the page-wide visual reference you build from.

## Output Behavior

Always write:

- `.webanatomy/moodboard/{page}-{YYYY-MM-DD}/report-data.json`
- `.webanatomy/moodboard/{page}-{YYYY-MM-DD}/report.html`
- `.webanatomy/moodboard/{page}-{YYYY-MM-DD}/report.md`
- `.webanatomy/moodboard/{page}-{YYYY-MM-DD}/references/`

The HTML report is the primary visual output. Chat is only a short summary and a pointer to the saved files. Do not dump the whole moodboard into chat.

If the environment cannot write files, explain the blocker and provide a compact inline version.

## Deterministic Report Renderer

When file access is available, do not hand-write the final HTML. Write the structured `report-data.json` first, then run the shared renderer from this skill pack:

```bash
node <skill-dir>/scripts/render-report.mjs --input=.webanatomy/moodboard/{page}-{YYYY-MM-DD}/report-data.json
```

Resolve `<skill-dir>` relative to this `SKILL.md`. The renderer validates the data, materializes every image into `references/` (downloads each `screenshotUrl`, copies each local `screenshotPath`), rewrites the JSON with `localImage` paths so the report is self-contained, and renders "screenshot unavailable" when an image cannot be fetched. Pass `--no-download` to skip materialization, `--force-download` to refetch.

Only fall back to hand-written HTML if the renderer cannot be run.

### report-data shape (schema `webanatomy.moodboard.v1`)

Top level:

- `title` (required), `summary` (required, used as the TL;DR)
- `sections` (required, non-empty array)
- optional `eyebrow`, `subtitle`, `brand` (labels the recommendation box, e.g. "Hiway"), `target` `{ name, url }`, `footer`

Each entry in `sections`:

- `name` (required) and optional `emoji`
- `meta`: `{ "label": "...", "kind": "p0" | "do" | "" }[]` rendered as chips (priority, action, effort, impact, goal). `kind` "p0" tints red, "do" tints accent.
- `current`: `{ "screenshotPath" | "screenshotUrl": "...", "caption": "...", "localImage"?: "..." }` shown large on the left
- `currentState`: one factual sentence describing the section as it is today
- `problems`: `string[]` the issues identified, shown beside the current screenshot
- `benchmarks`: `{ "company": "...", "sourceUrl": "...", "screenshotUrl" | "screenshotPath": "...", "caption": "...", "bestPractice": "..." }[]` rendered as a grid, each with the practice it shows below it
- `bestPractices`: `string[]`, each prefixed with a discipline tag in brackets, optionally ending in ` · sources`. Example: `"[COPY] Lead the H1 with a quantified outcome · Legalstart, Shine"`. Tags: `COPY`, `DESIGN-UX`, `VISUEL`, `PREUVE` (see references/moodboard-method.md).
- `recommendations`: `string[]` (or `{ title, text }[]`) the actions for the brand

Use `screenshotPath` for local current-state captures, `screenshotUrl` for hosted benchmark images. Both are materialized into `references/`.

## Step 1 - Resolve Page And Sections

Identify the page and the ordered list of sections to cover. Use the canonical section taxonomy from the house style (`hero`, `value_proposition`, `trust`, `testimonial`, `pricing`, `faq`, `cta`, plus `features`, `how_it_works`, `problem`, `use_cases`, `navbar`, `footer`, `about`). Order sections by where they appear on the page, or by priority when the user wants a worklist.

## Step 2 - Generate The Content (canonical path)

The skill produces the per-section content itself. Do not assume any external document exists. For each section, in order:

1. **Capture the current state.** Browse the live page and capture one screenshot per section. Confirm each section in the DOM after a full scroll before stating anything about it. Save captures locally and reference them with `screenshotPath`.
2. **Diagnose current + problems.** Write one factual `currentState` line and the `problems` for the section, framed as opportunities about the page (this is the same on-page reading `audit-page` performs). Never assert an element is missing from a screenshot alone; confirm in the DOM or write "could not verify".
3. **Pull benchmarks from the MCP.** Use the `webanatomy` MCP `search_sections` for the section type (industry and locale from `.agents/webanatomy-context.md`) to get benchmark examples, their screenshots, and their stealable moves. Each becomes a `benchmarks[]` entry: `screenshotUrl` + a `bestPractice` caption naming the visible practice. Confirm the MCP is available first; if not, say so and use a clearly labeled static fallback.
4. **Synthesize.** Roll the stealable moves into the discipline-tagged `bestPractices` (see references/moodboard-method.md), then write the `recommendations` for the brand.

Keep internal scores, thresholds, and marker coordinates hidden. Translate them into visible practices.

### Optional shortcut: import a prior audit

If a structured per-section audit already exists (an `audit-page` output, or an external doc such as a Notion module database), import it instead of re-diagnosing, to save work. Map: current state to `currentState` + `current`, problem to `problems`, benchmark images and captions to `benchmarks[].screenshotUrl` + `bestPractice`, the discipline list to `bestPractices`, the recos to `recommendations`. Carry the content faithfully; do not summarize it away. This is a convenience, not a requirement: the skill runs end to end without it.

## Step 3 - Screenshots

Every section needs one current-state image. Every benchmark needs one image. Use `screenshotPath` for local current captures and `screenshotUrl` for hosted benchmark images. The renderer materializes all of them into `references/` so the folder is portable and shareable as a link.

`references/` is renderer-owned. Save current-state captures **outside** it (a sibling `_captures/` dir, or the project's screenshots dir) and point `screenshotPath` there. Do not save captures into `references/`: the renderer copies sources into `references/` with its own `NN-slug` names, so a source kept inside would be duplicated. On each run the renderer clears its own `NN-` files first, so re-rendering after a section count or order change leaves no orphans.

## Step 4 - Render And Summarize

Run the renderer. Then respond in chat with: the page covered, the number of sections, the highest-priority section, and the report path. Keep it short.

## Guardrails

- Follow the shared house style in `webanatomy-setup/references/house-style.md`: no em-dashes, frame as "The X..." not "Your X...", frame problems as opportunities, never expose framework internals (no rubric ids, scores, thresholds, or marker coordinates), and match the Locale from `.agents/webanatomy-context.md` when present.
- Use `P0`/`P1`/`P2`/`P3` for ungrounded priority chips. Do not mix with the `HIGH`/`MEDIUM`/`LOW` gap scale.
- Never assert an element is missing from a screenshot alone. Confirm in the DOM after a full scroll, or write "could not verify".
- Do not promise conversion lifts. State the move and the reasoning.
- Keep benchmark captions to the visible practice, not internal scoring.
