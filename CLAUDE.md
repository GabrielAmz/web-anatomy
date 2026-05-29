# CLAUDE.md — Web Anatomy

Claude Code-specific notes. The full cross-agent install instructions are in [AGENTS.md](AGENTS.md).

## Slash command shortcuts

After install, every skill is available as a slash command in Claude Code:

```
/webanatomy-setup
/find-examples
/research-best-practices
/improve-page
/benchmark-compare
```

## First-run order

1. Run `/webanatomy-setup` once to capture product, ICP, industry, competitors, proof assets, and priority pages. This writes `.agents/webanatomy-context.md`.
2. Then run the benchmark-backed workflows: `/find-examples`, `/research-best-practices`, `/improve-page`, or `/benchmark-compare`.

## Visual Output

The benchmark workflows write visual reports under `.webanatomy/` with `report.md`, `report.html`, and a `references/` folder for screenshots. Prefer opening the HTML report for visual review; chat summaries should stay short.

## Skill discovery

Claude reads the `description:` field from each `SKILL.md` front matter when deciding which skill to activate. Web Anatomy descriptions are deliberately verbose (200-400 words) and pack in trigger phrases like "build me a landing page," "create a homepage," "this page isn't converting." That's intentional — the description IS the routing layer.

If the wrong skill activates, paste the slug explicitly: `Use /improve-page to audit this pricing page...`.

## Updating

```bash
npx skills update GabrielAmz/web-anatomy
```

Or pull manually:

```bash
cd .agents/web-anatomy && git pull
```

(If you installed via submodule.)
