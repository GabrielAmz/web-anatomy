# Moodboard Method

How the `moodboard` skill turns a page into a section-by-section visual reference board. This file documents the per-section anatomy and the discipline tags. The shared output rules live once in `webanatomy-setup/references/house-style.md`; this file does not restate them.

## Per-section anatomy

Each section in the report follows the same five-part structure so the board reads consistently top to bottom:

1. **Header.** Section name (with optional emoji) and meta chips: priority (`P0`-`P3`), action (Revamp or Create), effort, impact, goal.
2. **Current, large + problems.** The current-state screenshot shown large on the left. Beside it, one factual `currentState` line, then the `problems` identified as a short list. State problems as opportunities, about the page, not at the reader.
3. **Benchmarks.** A grid of benchmark screenshots. Each is captioned with the single practice it demonstrates (`bestPractice`) and a link to the source. Show two to four per section. Each example must illustrate a practice, not just be a known brand.
4. **Best practices by discipline.** The synthesized, discipline-tagged practices observed across the benchmarks, each ending in the brands that show it.
5. **Recommendation.** The concrete actions for the brand, ordered. This is the "so what" of the section.

## Discipline tags

Every line in `bestPractices` starts with one tag in brackets. Tags keep the synthesis scannable and let a team route work to the right craft. The renderer color-codes them.

- `[COPY]` wording, headline, sub-headline, CTA label, proof phrasing.
- `[DESIGN-UX]` layout, hierarchy, components, interaction, flow.
- `[VISUEL]` imagery, product captures, illustration choices, visual proof.
- `[PREUVE]` trust and proof elements: ratings, counts, logos, reassurance bands.

Aliases the renderer also accepts: `UX`, `DESIGN`, `DESIGN/UX` map to `[DESIGN-UX]`; `VISUAL` maps to `[VISUEL]`; `PROOF` maps to `[PREUVE]`.

Format: `"[TAG] the practice, stated as a move · Brand A, Brand B"`. The trailing ` · sources` is optional and rendered muted.

## Sourcing from an existing module audit

When a structured audit already exists (for example a Notion "modules to create" database), map its fields rather than re-diagnosing:

| Audit field | report-data field |
|---|---|
| Current state (factual) | `section.currentState` + `section.current` screenshot |
| Problem / challenge | `section.problems[]` |
| Benchmark image + its caption | `section.benchmarks[].screenshotUrl` + `bestPractice` |
| Best practices (tagged list) | `section.bestPractices[]` |
| Recommendations for the brand | `section.recommendations[]` |
| Priority / Action / Effort / Impact / Goal | `section.meta[]` chips |

Carry the content faithfully. The moodboard is a presentation layer over the audit, not a re-interpretation of it.

## Why visual-first

A page is a vertical scroll. The moodboard mirrors that: a reviewer scrolls the report the way a visitor scrolls the page, seeing current versus benchmark in the same reading order. The HTML report is the source of truth; it is also a clean import surface for a design tool (drag the images, or import the HTML) and exports to PDF for sign-off. Keeping the data in `report-data.json` means the same content re-renders without hand-editing HTML.
