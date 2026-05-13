# Web Anatomy

> AI agent skills for shipping landing pages. Pick the archetype, sequence the sections, cite real patterns from Ramp, Wiz, Webflow.

```
$ npx skills add GabrielAmz/web-anatomy
```

Installs the Web Anatomy pack for Claude Code, OpenAI Codex, Cursor, Windsurf, and any agent that supports the [Agent Skills](https://agentskills.io/) spec.

## What's in v0.1

Three skills to start. Hand-authored, not generated.

| Skill | What it does |
|---|---|
| `wa-page-context` | Foundation. Captures product, ICP, and conversion goal once — every other skill loads it. |
| `wa-page-create` | Flagship. Picks the page archetype (landing / homepage / pricing / comparator / persona / use-case), sequences sections by buyer intent, generates copy, cites real reference patterns. |
| `wa-persona-pages` | The Ramp `/small-business`, `/startups`, `/mid-market` move. One template, one page per qualifier — programmatic SEO without the SEO smell. |

## What's coming (v1.0)

~30 skills across four categories:

- **Teardowns (8)** — full-page audits: `wa-landing-page-teardown`, `wa-pricing-page-teardown`, `wa-comparator-teardown`, `wa-persona-teardown`, `wa-signup-flow-teardown`, ...
- **Section revamps (9)** — single-section deep cuts: `wa-hero-revamp`, `wa-pricing-table-revamp`, `wa-feature-grid-revamp`, `wa-faq-revamp`, `wa-comparison-table-revamp`, ...
- **Page generation (4)** — `wa-page-create` (already in v0.1) + dedicated builders: `wa-comparator-page`, `wa-pricing-page`, `wa-use-case-page`
- **Strategic plays (~10)** — `play-best-x-category-pages`, `play-switching-motion`, `play-show-value-upfront`, `play-roi-calculator`, `play-self-segmenting-homepage`, `play-blurred-form-background`, `play-free-tools-ecosystem`, `play-community-templates`, `play-use-case-pages`, plus `play-persona-pages` in v0.1

See [VERSIONS.md](VERSIONS.md) for the roadmap.

## Why "Anatomy"

Most AI-agent skill packs frame pages as a job (CRO, copywriting, SEO). Web Anatomy frames them as a structure — hero, proof, problem, solution, pricing, FAQ, CTA. Every section has known patterns, known anti-patterns, and known reference companies.

Every Web Anatomy skill ends with a **Reference Pattern** — a real company doing this section well, cited inline. The framework AND the evidence, not just generic best-practice prose.

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

After install, start with `wa-page-context` — it sets up the product/ICP/goal context every other skill loads.

## Contributing

PRs welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the new-skill recipe — kebab-case, YAML front matter, `wa-<verb>-<noun>` or `play-<strategy>` naming, body under 5K tokens.

## License

MIT. Use it, fork it, sell it, ship it.

---

Built by [Gabriel Amzallag](https://github.com/GabrielAmz). The Web Anatomy pack is a public extraction of the patterns powering a private landing-page benchmark and audit tool — the skills give you the framework; the [analyzer](#) gives you the data.
