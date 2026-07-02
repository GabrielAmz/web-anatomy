# CLAUDE.md — Web Anatomy

Claude Code-specific notes. The full cross-agent install instructions are in [AGENTS.md](AGENTS.md).

## Slash command shortcuts

After install, every skill is available as a slash command in Claude Code:

```
/webanatomy-setup
/persona
/find-examples
/audit-page
/research-best-practices
/write-page
/build-page
```

## First-run order

1. Run `/webanatomy-setup` once to capture product, ICP, industry, competitors, proof assets, and priority pages. This writes `.agents/webanatomy-context.md`.
2. Optionally run `/persona` to deepen the ICP into a sourced reader model (ranked objections with source tags, vocabulary, competitor claims map). This writes `.agents/webanatomy-persona.md`; `audit-page` and `write-page` read it when present.
3. Then run the benchmark-backed workflows: `/find-examples` (market view), `/audit-page` (diagnose your page), `/research-best-practices` (tiered ladder for one section), `/write-page` (the grounded rework or a new build), or `/build-page` (assemble structure + copy into a shareable wireframe).

## The two flows

Both end in a shareable wireframe:

- **Improve:** `/audit-page` → `/write-page` → `/persona` challenge (optional cold read; a FAIL loops back to `/write-page`) → `/build-page` (optional, in your page's own look).
- **Create:** `/find-examples` (pick one exemplar) → `/write-page` build mode (light outline adopts the exemplar's section order, then writes copy) → `/persona` challenge (optional) → `/build-page` (assemble in the exemplar's look).

`write-page` is the copy engine; `build-page` is the terminal assembler. The single chosen exemplar drives both structure and design.

## Visual Output

The benchmark workflows write visual reports under `.webanatomy/` with `report.md`, `report.html`, and a `references/` folder for screenshots. Prefer opening the HTML report for visual review; chat summaries should stay short.

## Skill discovery

Claude reads the `description:` field from each `SKILL.md` front matter when deciding which skill to activate. Web Anatomy descriptions are deliberately verbose (200-400 words) and pack in trigger phrases like "build me a landing page," "create a homepage," "this page isn't converting." That's intentional — the description IS the routing layer.

If the wrong skill activates, paste the slug explicitly: `Use /write-page to audit this pricing page...`.

## Updating

```bash
npx skills update GabrielAmz/web-anatomy
```

Or pull manually:

```bash
cd .agents/web-anatomy && git pull
```

(If you installed via submodule.)
