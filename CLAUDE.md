# CLAUDE.md — Web Anatomy

Claude Code-specific notes. The full cross-agent install instructions are in [AGENTS.md](AGENTS.md).

## Slash command shortcuts

After install, every skill is available as a slash command in Claude Code:

```
/wa-page-context
/wa-page-create
/wa-persona-pages
```

## First-run order

1. Run `/wa-page-context` once to capture product, ICP, and conversion goal. This writes `.agents/page-context.md`.
2. Then run any other skill — they all auto-load that context file.

## Skill discovery

Claude reads the `description:` field from each `SKILL.md` front matter when deciding which skill to activate. Web Anatomy descriptions are deliberately verbose (200-400 words) and pack in trigger phrases like "build me a landing page," "create a homepage," "this page isn't converting." That's intentional — the description IS the routing layer.

If the wrong skill activates, paste the slug explicitly: `Use /wa-page-create to build a pricing page for...`.

## Updating

```bash
npx skills update GabrielAmz/web-anatomy
```

Or pull manually:

```bash
cd .agents/web-anatomy && git pull
```

(If you installed via submodule.)
