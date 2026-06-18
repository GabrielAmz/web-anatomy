---
name: build-page
description: |
  The terminal assembler in Web Anatomy. Take a page structure plus its written copy and assemble them into one shareable wireframe with a coherent, single-exemplar design system (type scale, color direction, spacing, component style). Runs on both branches: a newly created page (build) or an improved existing page. Use when the user asks to assemble the page, build the wireframe, turn this into a page I can share, give me a shareable mockup, apply a design system, or lay this out top to bottom. Reuses the copy and references that write-page already produced; it does not write copy and it does not re-diagnose. Derives the design from ONE exemplar (a benchmark page for a new page, the user's own page when improving), never averaged across companies. Writes a self-contained wireframe under `.webanatomy/build-page/`.
metadata:
  version: 0.1.0
---

# Build Page

The last step of the page workflow: turn structure + copy into a wireframe someone can actually look at. `write-page` produces the words; `build-page` lays them out in a coherent design and hands the user one shareable artifact.

This is the **terminal assembler**. It runs on both branches:

- **After a new page is written (create):** assemble the chosen sections + their copy into a wireframe.
- **After an existing page is improved:** assemble the improved structure + copy into a shareable "here is the better version" wireframe (optional; the user can stop at the copy fixes).

It does not write copy (that is `write-page`), it does not diagnose (that is `audit-page`), and it does not invent the section list (that comes from the structure it is handed). It assembles and designs.

## The one rule: a single design exemplar

A coherent page cannot be stitched from sections of different companies. Their type, color, and spacing clash, and the result reads as broken. So `build-page` derives the whole design system from exactly ONE source:

- **Create:** one exemplar homepage the user likes, picked via `find-examples` / `search_pages`. Use it for the look only.
- **Improve:** the user's OWN current page. It already has a coherent design language; keep it and re-skin the improved structure + copy in it.

The exemplar drives DESIGN only: type scale, color direction, spacing rhythm, component style, section layout patterns. Never lift the exemplar's words, claims, or brand name. The copy is the user's, from `write-page`.

## Step 0 - Gather the inputs

`build-page` needs two things. Do not start without both:

1. **Structure + copy.** Prefer the most recent `write-page` output for this page (`.webanatomy/write-page/{page}-*/report-data.json` and its `recommendations` / written sections). If the user is running `build-page` directly without a prior `write-page` run, ask them to run `write-page` first (build or improve mode); this skill assembles, it does not generate the copy.
2. **One design exemplar.**
   - Create: ask which exemplar homepage to follow, or surface candidates via `find-examples` and let the user pick one. Capture its screenshot as the design reference.
   - Improve: use the current page already captured by `audit-page` / `write-page` (`references/current.png`). If none exists, capture it now.

If the user has a brand or design system of their own (tokens, a styleguide, an existing site), prefer it over the exemplar for color and type, and use the exemplar only for layout and section composition. Ask once.

## Step 1 - Derive the design system from the exemplar

Read the single exemplar's screenshot and extract a small, coherent system. Keep it to what a wireframe needs:

- **Type:** heading scale and body size relationship, weight contrast, and whether it is geometric or humanist (describe, do not guess exact fonts unless visible).
- **Color:** background direction (light / dark / tinted), one primary action color, and the contrast level. Direction, not exact hex, unless the exemplar makes it obvious or the user gave tokens.
- **Spacing:** section rhythm (tight / generous), container width, and alignment (centered / left).
- **Components:** button style, card vs flat, how proof and product visuals are placed.

Write this as a short `design-system.md` (a handful of lines per dimension). This is the "clear design guidelines" half of the deliverable. Follow the house style for any prose: no em-dashes, never expose benchmark internals.

Do not blend a second source. If a section's copy came from a benchmark example with a different look, that example informed the COPY (via `write-page`), not the design here.

## Step 2 - Assemble the wireframe

Lay the agreed sections out top to bottom, in order, each populated with its `write-page` copy, skinned in the design system from Step 1.

Output a single self-contained HTML file: inline CSS only, no external dependencies, no CDN links, system fonts (or a close stand-in for the exemplar's type feel). It is a wireframe, a coherent shareable draft, not a pixel-final mockup:

- Real copy from `write-page` in every section (never lorem ipsum).
- Section order and hierarchy from the structure.
- Layout, spacing, and component style from the design system.
- Placeholders for assets the user does not have yet (product shots, logos), clearly marked, never faked.
- An HTML comment above each section noting which exemplar pattern it follows and which `write-page` reference grounded the copy.

The wireframe is the artifact the user shares. Keep it clean and legible over decorative.

## Step 3 - Output

Write:

- `.webanatomy/build-page/{page}-{YYYY-MM-DD}/wireframe.html` - the shareable wireframe.
- `.webanatomy/build-page/{page}-{YYYY-MM-DD}/design-system.md` - the design guidelines.
- `.webanatomy/build-page/{page}-{YYYY-MM-DD}/references/` - the exemplar screenshot and any section references reused from `write-page`.

Then hand it over explicitly: say the wireframe is ready, give the full path, and offer to open it (`open <path>` on macOS, `xdg-open` on Linux, `start` on Windows). Propose the next move: tweak a section, swap the exemplar to try a different look, or export the copy and design notes into the user's coding agent to build the real page.

## Guardrails

- **One exemplar, always.** Never average a design across companies. If the user wants to compare looks, run twice with two exemplars and let them choose.
- **Assemble, do not rewrite.** Use `write-page`'s copy verbatim. If the copy needs changing, that is a `write-page` job, not this one. Do not re-query the benchmark for copy.
- **Design only from the exemplar.** Never copy its words, claims, metrics, or brand.
- **No faked proof.** Mark missing assets (testimonials, logos, product shots) as placeholders; never invent them.
- **It is a wireframe.** Coherent and shareable, not pixel-final. Say so when handing it over.
- **House style.** Follow `webanatomy-setup/references/house-style.md` for any prose: no em-dashes, "The X…" not "Your X…", and never expose benchmark scores, thresholds, or internal fields. Answer in the user's language.

## Future enhancement

V1 writes the HTML wireframe directly. A deterministic wireframe renderer (a script that takes structure + copy + design tokens and emits the HTML, mirroring the report renderer the other skills use) is a later improvement; until then, keep the hand-written HTML clean and self-contained.
