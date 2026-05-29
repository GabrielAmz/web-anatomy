# Web Anatomy

> Benchmark-backed AI agent skills for improving landing pages. Classify the page, pull strong examples, and turn section anatomy into concrete fixes.

```
$ npx skills add GabrielAmz/web-anatomy
```

Installs the Web Anatomy skill pack for Claude Code, OpenAI Codex, Cursor, Windsurf, and any agent that supports the [Agent Skills](https://agentskills.io/) spec.

## What's in v0.2

Web Anatomy now has two layers:

- **Skills-only install** with `npx skills add GabrielAmz/web-anatomy`
- **Plugin install** from this repo's marketplace files, bundling skills now and ready for a future MCP connection

The new benchmark-backed workflow skills are:

| Skill | What it does |
|---|---|
| `webanatomy-setup` | Run once. Captures product, ICP, industry, competitors, proof assets, and priority pages into `.agents/webanatomy-context.md`. |
| `find-examples` | Fast benchmark lookup. Returns strong section examples grouped by repeatable pattern. |
| `research-best-practices` | Deep research report. Pulls benchmark examples, live references when available, and writes `.webanatomy/research-best-practices/...`. |
| `improve-page` | Flagship improvement workflow. Captures current reality, classifies the page, routes to section benchmarks, and writes a gap-analysis report. |
| `benchmark-compare` | Concise URL or screenshot comparison against benchmark patterns with public `HIGH` / `MEDIUM` / `LOW` gap labels. |

## Visual Reports

Web Anatomy does not rely on chat to render screenshots. The output skills write local visual artifacts:

```txt
.webanatomy/
├── find-examples/
├── research-best-practices/
├── improve-page/
└── benchmark-compare/
    └── topic-date/
        ├── report.md
        ├── report.html
        └── references/
            ├── current.png
            └── company-section.png
```

The chat response should stay short: top findings, report path, and any screenshot or MCP limitations. `report.html` is the product experience.

## MCP Contract

The skills are MCP-aware, but v0.2 does not assume a public Web Anatomy MCP server exists yet.

For now, the repo includes `.mcp.example.json` as the future hosted-server contract:

```bash
export WEBANATOMY_MCP_TOKEN=...
```

Token lookup order:

1. `WEBANATOMY_MCP_TOKEN`
2. `~/.webanatomy/webanatomy_mcp_token`
3. `~/.codex/webanatomy_mcp_token`

The skills use MCP tools such as `search_sections` when available. Scores, thresholds, raw marker coordinates, and benchmark field names stay internal; user-facing reports translate them into plain-English patterns and gap labels.

When `https://webanatomy.com/mcp` is live, copy `.mcp.example.json` to `.mcp.json` and add `"mcpServers": "./.mcp.json"` back to `plugins/webanatomy/.codex-plugin/plugin.json`.

## What's coming (v1.0)

~30 skills across four categories:

- **Teardowns (8)** — full-page audits: `wa-landing-page-teardown`, `wa-pricing-page-teardown`, `wa-comparator-teardown`, `wa-persona-teardown`, `wa-signup-flow-teardown`, ...
- **Section revamps (9)** — single-section deep cuts: `wa-hero-revamp`, `wa-pricing-table-revamp`, `wa-feature-grid-revamp`, `wa-faq-revamp`, `wa-comparison-table-revamp`, ...
- **Page generation (4)** — `wa-page-create` (already in v0.1) + dedicated builders: `wa-comparator-page`, `wa-pricing-page`, `wa-use-case-page`
- **Strategic plays (~10)** — `play-best-x-category-pages`, `play-switching-motion`, `play-show-value-upfront`, `play-roi-calculator`, `play-self-segmenting-homepage`, `play-blurred-form-background`, `play-free-tools-ecosystem`, `play-community-templates`, `play-use-case-pages`, plus `play-persona-pages` in v0.1

See [VERSIONS.md](VERSIONS.md) for the roadmap.

## Why "Anatomy"

Most AI-agent skill packs frame pages as a job (CRO, copywriting, SEO). Web Anatomy frames them as a structure — hero, proof, problem, solution, pricing, FAQ, CTA. Every section has known patterns, known anti-patterns, and known reference companies.

Every Web Anatomy skill turns a page into parts: hero, proof, problem, solution, pricing, FAQ, CTA. Each part has known patterns, anti-patterns, and benchmark examples. The framework and the evidence travel together.

## Compatibility

- ✅ Claude Code
- ✅ OpenAI Codex
- ✅ Cursor
- ✅ Windsurf
- ✅ Any agent that reads `.agents/skills/<name>/SKILL.md` per the [Agent Skills spec](https://agentskills.io/specification.md)

## Install options

```bash
# Recommended — installs the whole pack to .agents/skills/
npx skills add GabrielAmz/web-anatomy

# Or clone and copy manually
git clone https://github.com/GabrielAmz/web-anatomy
cp -r web-anatomy/skills/* .agents/skills/

# Or git submodule (pull updates with one command)
git submodule add https://github.com/GabrielAmz/web-anatomy .agents/web-anatomy
```

After install, start with `webanatomy-setup`. The benchmark-backed workflows degrade gracefully when MCP is unavailable and can use static/reference guidance until the server is live.

## Plugin layout

```txt
web-anatomy/
├── .agents/plugins/marketplace.json
├── .claude-plugin/marketplace.json
├── .mcp.example.json
├── plugins/webanatomy/
│   ├── .codex-plugin/plugin.json
│   ├── .claude-plugin/plugin.json
│   ├── .mcp.example.json
│   ├── assets/
│   └── skills/
└── skills/
```

`skills/` is the source of truth. `plugins/webanatomy/skills/` mirrors it for marketplace/plugin installs.

## Contributing

PRs welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the new-skill recipe — kebab-case, YAML front matter, clear workflow names, and body under 5K tokens.

## License

MIT. Use it, fork it, sell it, ship it.

---

Built by [Gabriel Amzallag](https://github.com/GabrielAmz). The Web Anatomy pack is a public extraction of the patterns powering a private landing-page benchmark and audit tool — the skills give you the framework; the [analyzer](#) gives you the data.
