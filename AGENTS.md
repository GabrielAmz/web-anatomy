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

A skill named `wa-page-create` installs to `.agents/skills/wa-page-create/SKILL.md` regardless of which agent loads it.

## How to invoke a skill

Just describe what you want. The agent matches your phrasing against the `description:` field in each `SKILL.md` and loads the right one.

```
"I want to build a pricing page for B2B fintech CFOs."
→ loads wa-page-create

"Create a persona variant of our homepage for healthcare buyers."
→ loads wa-persona-pages

"Help me set up Web Anatomy for my project."
→ loads wa-page-context
```

Or invoke by slug directly:

```
/wa-page-create
/wa-persona-pages
/wa-page-context
```

## Skill conventions

- **Prefix**: every page-level skill uses `wa-<verb>-<noun>` (e.g., `wa-page-create`, `wa-hero-revamp`, `wa-pricing-teardown`).
- **Strategic plays**: prefix `play-<strategy-slug>` (e.g., `play-persona-pages`, `play-roi-calculator`). These are ports of the Web Anatomy strategy library.
- **Foundation**: `wa-page-context` is the foundation. Every other skill loads it first. If `.agents/page-context.md` doesn't exist, the skill will prompt you to run `wa-page-context`.
- **Reference patterns**: every page-level skill includes at least one real-world reference — a named company doing this section well, with a URL.

## File layout in your project after install

```
your-project/
├── .agents/
│   ├── page-context.md           ← created on first run of wa-page-context
│   └── skills/
│       ├── wa-page-context/SKILL.md
│       ├── wa-page-create/
│       │   ├── SKILL.md
│       │   └── references/
│       │       ├── archetypes.md
│       │       └── section-patterns.md
│       └── wa-persona-pages/SKILL.md
└── (your code)
```

## Updating

```bash
npx skills update GabrielAmz/web-anatomy
```

Or re-run the install command — it's idempotent.
