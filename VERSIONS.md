# Versions

## v0.1.0 — 2026-05-13 (stealth ship)

Initial release. Three skills.

- `wa-page-context` — foundation. Captures product, ICP, conversion goal, stage, tech stack into `.agents/page-context.md`. Every other skill loads this first.
- `wa-page-create` — flagship. Page archetype picker + section sequencer + copy generator + reference-pattern citation.
- `wa-persona-pages` — auto-generate a persona-page variant from the Ramp /small-business pattern.

## v0.2.0 — 2026-05-22 (benchmark plugin slice)

Adds the plugin architecture and benchmark-backed workflow skills.

- Repo marketplace files for Codex and Claude plugin discovery.
- `plugins/webanatomy` bundle with Codex/Claude manifests, assets, and mirrored skills.
- `.mcp.example.json` documenting the future `https://www.webanatomy.ai/mcp` connection and token fallback.
- Removes the initial `wa-*` prototype skills from the active pack.
- `webanatomy-setup` — captures product, ICP, industry, competitors, proof assets, and priority pages.
- `find-examples` — fast benchmark-backed section references.
- `research-best-practices` — durable research reports under `.webanatomy/research-best-practices/`.
- `improve-page` — current-reality capture, page classification, benchmark matching, and gap analysis.
- `benchmark-compare` — concise URL/screenshot comparison with public gap labels.

## v0.2.1 — 2026-06-04 (homepage MCP expansion)

Updates the workflow skills for hosted MCP page inspiration.

- `find-examples` can now use `search_pages` for whole-homepage examples and `search_sections` for section examples.
- `research-best-practices`, `improve-page`, and `benchmark-compare` use page-level examples for homepage/category patterns before falling back to section-level evidence.
- Plugin mirror skills now include the same hosted MCP instructions.

## v0.2.2 — 2026-06-11 (report v2 layout)

Redesigns the report every workflow skill produces, tested against a real audit.

- New layout: plain descriptive title, blue TL;DR callout (max 3 bullets), numbered cards with their reference screenshots inline; 2-3 references render as options A/B/C.
- The shared renderer enforces hard word budgets and a grounding floor (min 3 cards with refIds), failing loudly with exact overruns so the writing agent rewrites instead of padding.
- `improve-page` (0.3.0): mandatory hero slot, per-recommendation copy-paste agent prompts, What's working section.
- `audit-page` (0.2.0): P0-P3 severities become HIGH/MEDIUM/LOW, audit.json schema v2, recommendations typed copy|design, prose budgets on the handoff.
- `benchmark-compare`, `find-examples`, `research-best-practices` (0.3.0): same layout; patterns/gaps/findings carry their example screenshots inline. Legacy report-data still renders.

## v0.2.3 — 2026-06-15 (single install path)

Removes the plugin/marketplace layer in favor of one install path.

- Deletes `.claude-plugin/`, `.agents/plugins/`, and the `plugins/webanatomy` bundle (mirrored skills, Codex/Claude manifests, assets, plugin-scoped `.mcp.example.json`).
- `npx skills add GabrielAmz/web-anatomy` (Agent Skills spec) is now the single install path; it already covers Claude Code, Codex, Cursor, and Windsurf cross-client.
- The marketplace mechanism was Claude-Code-only and schema-fragile (a missing `owner` field failed install on the user's machine); the skills installer has neither limitation.
- `validate-skills.sh` no longer checks a plugin mirror, since there is no longer a mirror to keep in sync.
- Deletes the root `.mcp.example.json`. MCP setup (beta token + per-IDE config) now lives at https://www.webanatomy.ai/dashboard/mcp; the README and AGENTS point there. Skills install first and run fully without MCP — connecting it is an optional upgrade for live benchmark data.

## v0.2.4 — 2026-06-15 (umbrella positioning + altitude framing)

Detail pass on the project and skill docs. No workflow changes.

- README rewritten around the umbrella positioning: what Web Anatomy is, the benchmark behind the skills (3,500+ sections, 500+ pages, 290+ companies — confirm before release), and the four altitudes (strategy, page, section, fix) with each skill mapped to one.
- Every `SKILL.md` description now leads with its altitude; bodies get a one-line orientation placing the skill in the four-altitude model. Routing triggers unchanged.
- Removes the "Lazyweb-style improvement report" trigger from `improve-page` (a competitor name in our own routing).
- GitHub repo description updated to the umbrella framing (was still describing the removed v0.1 skills).

## Roadmap

**v0.3** — MCP tool expansion. Add `classify_page_or_section` and `compare_url_to_benchmark` once the hosted server exposes them.

**v0.4** — port pipeline. Add `play-use-case-pages`, `play-best-x-category-pages`, `play-switching-motion`, `play-show-value-upfront` from the Web Anatomy strategy library. ~4 more skills.

**v0.5** — section revamps. `hero-revamp`, `pricing-table-revamp`, `feature-grid-revamp`, `faq-revamp`. ~4 more skills.

**v0.6** — teardown skills. `landing-page-teardown`, `pricing-page-teardown`, `comparator-teardown`. ~4 more skills.

**v1.0** — big launch. ~30 skills total. Full landing page, coordinated HN/PH/X/Discord drop.

**v1.x+** — community contributions, more reference patterns, deeper teardown evidence.
