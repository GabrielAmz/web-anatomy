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
| **Page** | What do the strongest pages in this market do, and how does mine compare? | `find-examples` |
| **Audit** | How does my whole page stack up, and what should I change first? | `audit-page` |
| **Section** | How do I level up one section, from foundational to best-in-class? | `research-best-practices` |
| **Fix** | Write the grounded copy to rework a page or build a new one. | `write-page` |

After the copy is written, **`build-page`** assembles the structure + copy into a shareable wireframe with a coherent, single-exemplar design system. It is the terminal step on both branches (improve and create), so it sits above the altitudes rather than inside one.

Run `webanatomy-setup` once first. It captures product, ICP, industry, competitors, and proof assets into `.agents/webanatomy-context.md`, so every skill gives sharper, on-brand recommendations.

### Two flows

- **Improve an existing page:** `audit-page` (diagnose) -> `write-page` (rewrite the weak sections) -> `build-page` (optional: assemble the improved page as a shareable wireframe, in your page's own look).
- **Create a new page:** `find-examples` (pick one exemplar homepage) -> `write-page` build mode (a light outline adopts the exemplar's section order, then writes the copy) -> `build-page` (assemble the wireframe in the exemplar's look).

## The skills

| Skill | Altitude | What it does |
|---|---|---|
| `webanatomy-setup` | Foundation | Run once. Captures product, ICP, industry, competitors, proof assets, and priority pages into `.agents/webanatomy-context.md`. |
| `find-examples` | Page | The market scan. Pulls the top-ranked pages and sections in a market, shows what to steal, and when you share your page, labels how it compares. Absorbs the old `benchmark-compare`. |
| `audit-page` | Audit | Scores the current page against a CRO rubric, diagnoses it section by section, and returns a prioritized fix list. Runs standalone, no MCP required. |
| `research-best-practices` | Section | The section deep-dive. Takes one section and returns a tiered improvement ladder (foundational, competitive, best-in-class), each grounded in real benchmark sections. |
| `write-page` | Fix | The copy engine. Turns a diagnosis, a tier, or a chosen structure into grounded copy-paste sections; reworks an existing page or writes a new one. |
| `build-page` | Assemble | The terminal assembler. Takes a structure + its copy and lays them out as a shareable wireframe with a single-exemplar design system (a benchmark page for a new page, your own page when improving). |

## Visual Reports

Web Anatomy does not rely on chat to render screenshots. The output skills write local visual artifacts:

```txt
.webanatomy/
├── find-examples/
├── audit-page/
├── research-best-practices/
├── write-page/
│   └── topic-date/
│       ├── report.md
│       ├── report.html
│       └── references/
│           ├── current.png
│           └── company-section.png
└── build-page/
    └── page-date/
        ├── wireframe.html
        ├── design-system.md
        └── references/
```

The chat response should stay short: top findings, report path, and any screenshot or MCP limitations. `report.html` is the product experience.

## Live benchmark data (optional, highly recommended)

The skills work on their own, so install them and start immediately. Connecting the hosted Web Anatomy MCP is never mandatory, but highly recommended: it grounds every recommendation in live benchmark data and real reference examples instead of static guidance, which is where the skills are at their best. It needs a beta token and one config command per IDE:

**Sign in at https://www.webanatomy.ai/dashboard/mcp to get your token + per-IDE config.** You must be signed in, because the page generates your personal token there.

The skills use MCP tools such as `search_pages`, `get_page`, `search_sections`, and `get_section` when connected, and degrade gracefully to static guidance when not. Scores, thresholds, raw marker coordinates, and benchmark field names stay internal; user-facing reports translate them into plain-English patterns and gap labels.

**Want to see the benchmark first?** Browse the public scored sections gallery at https://www.webanatomy.ai/best-landing-pages/sections — real landing-page sections, scored, with what makes each one work. It is the same library the MCP serves to your agent, so you can explore it before connecting anything.

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

**Option 1 — CLI (any agent):**

```bash
# Installs the whole pack to .agents/skills/
npx skills add GabrielAmz/web-anatomy

# Update later (or just re-run the command above, it's idempotent)
npx skills update GabrielAmz/web-anatomy
```

**Option 2 — Claude Code plugin (managed updates):**

```text
/plugin marketplace add GabrielAmz/web-anatomy
/plugin install web-anatomy
```

Claude Code tracks the installed version and surfaces updates through its plugin system, so you do not have to remember to re-run anything.

**Option 3 — clone and copy manually:**

```bash
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
