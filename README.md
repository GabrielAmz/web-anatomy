# Web Anatomy

> Skills for your AI agent that ship landing pages that work. Built from the plays the best SaaS companies actually shipped, grounded in a scored benchmark library so every recommendation cites a real page instead of generic advice.

```
$ npx skills add GabrielAmz/web-anatomy
```

Installs the Web Anatomy skill pack for Claude Code, OpenAI Codex, Cursor, Windsurf, and any agent that supports the [Agent Skills](https://agentskills.io/) spec.

## What Web Anatomy is

Most AI agents rework a page from generic advice: add social proof, make the CTA stronger, tighten the headline. Web Anatomy gives the agent evidence instead. The skills read a page as a structure of known sections (hero, value proposition, trust, testimonial, pricing, FAQ, CTA), then ground every move in a benchmark library of real pages scored section by section.

The benchmark behind the skills (numbers to confirm before release):

- 3,500+ scored sections
- 500+ landing pages
- 290+ companies

The skills run standalone with built-in patterns. Connecting the hosted MCP (highly recommended) pulls the live benchmark data and real reference screenshots into every report. See [Live benchmark data](#live-benchmark-data-optional-highly-recommended).

## The four altitudes

Web Anatomy works at four zoom levels. The altitude matches the question being asked.

| Altitude | The question | Skill |
|---|---|---|
| **Strategy** | What should this page do, and what do the strongest pages in this market do? | `research-best-practices` |
| **Page** | How does the whole page stack up, and what should change first? | `audit-page`, `benchmark-compare` |
| **Section** | What does a strong hero, pricing table, or testimonial actually look like? | `find-examples` |
| **Fix** | Rework the page or section with grounded evidence and copy-paste changes. | `improve-page` |

Run `webanatomy-setup` once first. It captures product, ICP, industry, competitors, and proof assets into `.agents/webanatomy-context.md`, so every skill gives sharper, on-brand recommendations.

## The skills

| Skill | Altitude | What it does |
|---|---|---|
| `webanatomy-setup` | Foundation | Run once. Captures product, ICP, industry, competitors, proof assets, and priority pages into `.agents/webanatomy-context.md`. |
| `research-best-practices` | Strategy | The deep research report. Pulls benchmark examples and live references, then writes a durable report on what strong pages do and how to adapt it. |
| `audit-page` | Page | Scores the current page against a CRO rubric, diagnoses it section by section, and returns a prioritized fix list. Runs standalone, no MCP required. |
| `benchmark-compare` | Page | Compares a URL, screenshot, or pasted section against benchmark winners and labels each gap `HIGH`, `MEDIUM`, or `LOW`. |
| `find-examples` | Section | The fast benchmark lookup. Returns strong homepage or section examples grouped by repeatable pattern as a visual swipe file. |
| `improve-page` | Fix | The flagship rework. Captures current reality, classifies the page, routes to section benchmarks, and writes a grounded gap-analysis report with copy-paste fixes. |

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

## Live benchmark data (optional, highly recommended)

The skills work on their own, so install them and start immediately. Connecting the hosted Web Anatomy MCP is never mandatory, but highly recommended: it grounds every recommendation in live benchmark data and real reference examples instead of static guidance, which is where the skills are at their best. It needs a beta token and one config command per IDE:

**Sign in at https://www.webanatomy.ai/dashboard/mcp to get your token + per-IDE config.** You must be signed in, because the page generates your personal token there.

The skills use MCP tools such as `search_pages`, `get_page`, `search_sections`, and `get_section` when connected, and degrade gracefully to static guidance when not. Scores, thresholds, raw marker coordinates, and benchmark field names stay internal; user-facing reports translate them into plain-English patterns and gap labels.

## Why "Anatomy"

Most AI-agent skill packs frame pages as a job (CRO, copywriting, SEO). Web Anatomy frames them as a structure: hero, proof, problem, solution, pricing, FAQ, CTA. Every section has known patterns, known anti-patterns, and known reference companies.

Every Web Anatomy skill turns a page into parts: hero, proof, problem, solution, pricing, FAQ, CTA. Each part has known patterns, anti-patterns, and benchmark examples. The framework and the evidence travel together.

## Compatibility

- ✅ Claude Code
- ✅ OpenAI Codex
- ✅ Cursor
- ✅ Windsurf
- ✅ Any agent that reads `.agents/skills/<name>/SKILL.md` per the [Agent Skills spec](https://agentskills.io/specification.md)

## Install options

```bash
# Recommended: installs the whole pack to .agents/skills/
npx skills add GabrielAmz/web-anatomy

# Update later (or just re-run the command above, it's idempotent)
npx skills update GabrielAmz/web-anatomy

# Or clone and copy manually
git clone https://github.com/GabrielAmz/web-anatomy
cp -r web-anatomy/skills/* .agents/skills/
```

After install, start with `webanatomy-setup`. The benchmark-backed workflows degrade gracefully when MCP isn't connected, falling back to static/reference guidance, but they are at their best with live benchmark data, so connecting MCP is highly recommended.

## Repo layout

`skills/` holds the skill pack, the source of truth installed by `npx skills add`.

## Contributing

PRs welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the new-skill recipe: kebab-case, YAML front matter, clear workflow names, and body under 5K tokens.

## License

MIT. Use it, fork it, sell it, ship it.

---

Built by [Gabriel Amzallag](https://github.com/GabrielAmz). The Web Anatomy pack is a public extraction of the patterns powering a private landing-page benchmark and audit tool. The skills give you the framework; the [analyzer](#) gives you the data.
