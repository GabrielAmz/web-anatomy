# Versions

## v0.1.0 — 2026-05-13 (stealth ship)

Initial release. Three skills.

- `wa-page-context` — foundation. Captures product, ICP, conversion goal, stage, tech stack into `.agents/page-context.md`. Every other skill loads this first.
- `wa-page-create` — flagship. Page archetype picker + section sequencer + copy generator + reference-pattern citation.
- `wa-persona-pages` — auto-generate a persona-page variant from the Ramp /small-business pattern.

## v0.2.0 — 2026-05-22 (benchmark plugin slice)

Adds the Lazyweb-inspired plugin architecture and benchmark-backed workflow skills.

- Repo marketplace files for Codex and Claude plugin discovery.
- `plugins/webanatomy` bundle with Codex/Claude manifests, assets, and mirrored skills.
- `.mcp.example.json` documenting the future `https://www.webanatomy.ai/mcp` connection and token fallback.
- Removes the initial `wa-*` prototype skills from the active pack.
- `webanatomy-setup` — captures product, ICP, industry, competitors, proof assets, and priority pages.
- `find-examples` — fast benchmark-backed section references.
- `research-best-practices` — durable research reports under `.webanatomy/research-best-practices/`.
- `improve-page` — current-reality capture, page classification, benchmark matching, and gap analysis.
- `benchmark-compare` — concise URL/screenshot comparison with public gap labels.

## Roadmap

**v0.3** — MCP tool expansion. Add `get_section`, `search_pages`, `classify_page_or_section`, and `compare_url_to_benchmark` once the hosted server exposes them.

**v0.4** — port pipeline. Add `play-use-case-pages`, `play-best-x-category-pages`, `play-switching-motion`, `play-show-value-upfront` from the Web Anatomy strategy library. ~4 more skills.

**v0.5** — section revamps. `hero-revamp`, `pricing-table-revamp`, `feature-grid-revamp`, `faq-revamp`. ~4 more skills.

**v0.6** — teardown skills. `landing-page-teardown`, `pricing-page-teardown`, `comparator-teardown`. ~4 more skills.

**v1.0** — big launch. ~30 skills total. Full landing page, coordinated HN/PH/X/Discord drop.

**v1.x+** — community contributions, more reference patterns, deeper teardown evidence.
