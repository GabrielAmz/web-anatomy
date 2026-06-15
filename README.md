# Web Anatomy

> Benchmark-backed AI agent skills for improving landing pages. Classify the page, pull strong examples, and turn section anatomy into concrete fixes.

```
$ npx skills add GabrielAmz/web-anatomy
```

Installs the Web Anatomy skill pack for Claude Code, OpenAI Codex, Cursor, Windsurf, and any agent that supports the [Agent Skills](https://agentskills.io/) spec.

## What's in v0.2

Install the whole pack with one command — `npx skills add GabrielAmz/web-anatomy` — into any agent that reads the [Agent Skills](https://agentskills.io/) spec.

The benchmark-backed workflow skills are:

| Skill | What it does |
|---|---|
| `webanatomy-setup` | Run once. Captures product, ICP, industry, competitors, proof assets, and priority pages into `.agents/webanatomy-context.md`. |
| `find-examples` | Fast benchmark lookup. Returns strong homepage or section examples grouped by repeatable pattern. |
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

## Live benchmark data (optional)

The skills work on their own — install them and start immediately. To ground recommendations in live benchmark data, connect the hosted Web Anatomy MCP. It needs a beta token and one config command per IDE:

**Setup (token + per-IDE config) → https://webanatomy.ai/mcp-install**

The skills use MCP tools such as `search_pages`, `get_page`, `search_sections`, and `get_section` when connected, and degrade gracefully to static guidance when not. Scores, thresholds, raw marker coordinates, and benchmark field names stay internal; user-facing reports translate them into plain-English patterns and gap labels.

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

# Update later (or just re-run the command above — it's idempotent)
npx skills update GabrielAmz/web-anatomy

# Or clone and copy manually
git clone https://github.com/GabrielAmz/web-anatomy
cp -r web-anatomy/skills/* .agents/skills/
```

After install, start with `webanatomy-setup`. The benchmark-backed workflows degrade gracefully when MCP is unavailable and can use static/reference guidance until the server is live.

## Repo layout

`skills/` holds the skill pack — the source of truth installed by `npx skills add`.

## Contributing

PRs welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the new-skill recipe — kebab-case, YAML front matter, clear workflow names, and body under 5K tokens.

## License

MIT. Use it, fork it, sell it, ship it.

---

Built by [Gabriel Amzallag](https://github.com/GabrielAmz). The Web Anatomy pack is a public extraction of the patterns powering a private landing-page benchmark and audit tool — the skills give you the framework; the [analyzer](#) gives you the data.
