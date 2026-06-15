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

A skill named `improve-page` installs to `.agents/skills/improve-page/SKILL.md` regardless of which agent loads it.

`.mcp.example.json` documents the optional hosted MCP connection.

## How to invoke a skill

Just describe what you want. The agent matches your phrasing against the `description:` field in each `SKILL.md` and loads the right one.

```
"Improve this pricing page against strong B2B fintech examples."
→ loads improve-page

"Show me strong SaaS pricing examples."
→ loads find-examples

"Research how top AI tools handle testimonial sections."
→ loads research-best-practices

"Help me set up Web Anatomy for my project."
→ loads webanatomy-setup
```

Or invoke by slug directly:

```
/webanatomy-setup
/find-examples
/research-best-practices
/improve-page
/benchmark-compare
```

## Skill Conventions

- **Workflow skills**: use clear verbs: `find-examples`, `research-best-practices`, `improve-page`, `benchmark-compare`.
- **Strategic plays**: prefix `play-<strategy-slug>` when those return, e.g. `play-roi-calculator`.
- **Foundation**: `webanatomy-setup` writes `.agents/webanatomy-context.md` (product, ICP, industry, locale, voice and tone, constraints).
- **House style**: the shared output canon (copy rules, severity and gap vocabularies, no exposed internals, honesty rules) lives once in `webanatomy-setup/references/house-style.md`. Every skill follows it; do not restate it per skill.
- **Benchmark evidence**: workflow skills use the Web Anatomy MCP when available. Use `search_pages` for whole-homepage inspiration and `search_sections` for section patterns. Keep internal scores, thresholds, raw marker coordinates, and field names hidden.
- **Visual reports**: `find-examples`, `research-best-practices`, `improve-page`, and `benchmark-compare` write `report.md`, `report.html`, and `references/` under `.webanatomy/`. Chat should summarize and point to the report, not dump the whole artifact.

## File layout in your project after install

```
your-project/
├── .agents/
│   ├── webanatomy-context.md     ← created on first run of webanatomy-setup
│   └── skills/
│       ├── webanatomy-setup/SKILL.md
│       ├── find-examples/SKILL.md
│       ├── research-best-practices/SKILL.md
│       ├── improve-page/SKILL.md
│       └── benchmark-compare/SKILL.md
└── (your code)
```

## Updating

```bash
npx skills update GabrielAmz/web-anatomy
```

Or re-run the install command — it's idempotent.
