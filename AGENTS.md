# AGENTS.md — Web Anatomy

This file tells AI coding agents how to use the Web Anatomy skills pack. It works with any agent that reads `.agents/skills/` per the [Agent Skills spec](https://agentskills.io/specification.md).

## Install

```bash
npx skills add GabrielAmz/web-anatomy
```

This copies every skill in this repo into `.agents/skills/` in your project. The same files are read by:

- Claude Code
- OpenAI Codex
- Cursor
- Windsurf

A skill named `write-page` installs to `.agents/skills/write-page/SKILL.md` regardless of which agent loads it.

Connecting the hosted Web Anatomy MCP for live benchmark data is optional: sign in at https://www.webanatomy.ai/dashboard/mcp to get your token + per-IDE config. The skills run fully without it. To browse the benchmark itself, the public scored sections gallery is at https://www.webanatomy.ai/best-landing-pages/sections.

## How to invoke a skill

Just describe what you want. The agent matches your phrasing against the `description:` field in each `SKILL.md` and loads the right one.

```
"Improve this pricing page against strong B2B fintech examples."
→ loads write-page

"Show me strong SaaS pricing examples."
→ loads find-examples

"Research how top AI tools handle testimonial sections."
→ loads research-best-practices

"Build me a new pricing page."
→ loads find-examples (pick an exemplar) → write-page build mode (outline + copy)

"Assemble this into a wireframe I can share."
→ loads build-page

"Help me set up Web Anatomy for my project."
→ loads webanatomy-setup
```

Or invoke by slug directly:

```
/webanatomy-setup
/find-examples
/audit-page
/research-best-practices
/write-page
/build-page
```

## The two flows

Skills chain into two end-to-end flows, both ending in a shareable wireframe:

- **Improve an existing page:** `audit-page` (diagnose) → `write-page` (rewrite the weak sections) → `build-page` (optional: assemble the improved page as a wireframe, in your page's own look).
- **Create a new page:** `find-examples` (pick one exemplar homepage) → `write-page` build mode (a light outline adopts the exemplar's section order, then writes the copy) → `build-page` (assemble the wireframe in the exemplar's look).

`write-page` is the copy engine; `build-page` is the terminal assembler. The single chosen exemplar drives both structure (its section order) and design (its look). The benchmark stores no page structure, so the exemplar is the source.

## Skill Conventions

- **Workflow skills**: use clear verbs: `find-examples`, `audit-page`, `research-best-practices`, `write-page`, `build-page`.
- **Strategic plays**: prefix `play-<strategy-slug>` when those return, e.g. `play-roi-calculator`.
- **Foundation**: `webanatomy-setup` writes `.agents/webanatomy-context.md` (product, ICP, industry, locale, voice and tone, constraints).
- **House style**: the shared output canon (copy rules, severity and gap vocabularies, no exposed internals, honesty rules) lives once in `webanatomy-setup/references/house-style.md`. Every skill follows it; do not restate it per skill.
- **Benchmark evidence**: workflow skills use the Web Anatomy MCP when available. Use `search_pages` for whole-homepage inspiration and `search_sections` for section patterns. Keep internal scores, thresholds, raw marker coordinates, and field names hidden.
- **Visual reports**: `find-examples`, `audit-page`, `research-best-practices`, and `write-page` write `report.md`, `report.html`, and `references/` under `.webanatomy/`. `build-page` writes `wireframe.html` + `design-system.md`. Chat should summarize and point to the artifact, not dump it.

## File layout in your project after install

```
your-project/
├── .agents/
│   ├── webanatomy-context.md     ← created on first run of webanatomy-setup
│   └── skills/
│       ├── webanatomy-setup/SKILL.md
│       ├── find-examples/SKILL.md
│       ├── audit-page/SKILL.md
│       ├── research-best-practices/SKILL.md
│       ├── write-page/SKILL.md
│       └── build-page/SKILL.md
└── (your code)
```

## Updating

```bash
npx skills update GabrielAmz/web-anatomy
```

Or re-run the install command — it's idempotent.
