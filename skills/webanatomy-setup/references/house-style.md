# Web Anatomy House Style

The shared rules every Web Anatomy skill follows when it writes output. This is the
single source of truth so the four workflow skills stay consistent instead of each
restating (and drifting from) the same conventions. When a skill writes findings, a
report, or rewritten copy, it follows this file.

## 1. Copy and findings style

- **No em-dashes.** Use periods, commas, parentheses, or colons. This applies to
  every findings line, report sentence, and piece of rewritten copy.
- **Frame around "The X...", not "Your X...".** Write analytically, about the page,
  not at the reader. "The hero leads with the product name" beats "Your hero leads
  with the product name."
- **Frame as opportunities, not complaints.** State the move and what it unlocks,
  not the deficiency. "Lead the H1 with the outcome" beats "the H1 is weak."
- **Plain language.** Short sentences. One idea per line. No internal jargon.
- **Honor the user's voice and locale.** When `.agents/webanatomy-context.md`
  records a Voice and tone or a Locale, match it in any copy you write or rewrite.
  Write French copy for `fr`, English for `en`. Never invent claims, metrics, or
  proof the user does not have.

## 2. Shared vocabulary (use these exact labels, do not mix the two scales)

- **Severity** (audit recommendations, ungrounded priority): `P0` critical (blocks
  comprehension, trust, or conversion), `P1` high, `P2` medium, `P3` polish. At most
  one or two P0s. Name the single highest-leverage fix as `startHere`.
- **Gap labels** (grounded comparison against benchmark winners): `HIGH` (likely
  blocks comprehension, trust, or conversion), `MEDIUM` (meaningful lift), `LOW`
  (polish or optional).

Severity is for the free audit. Gap labels are for the grounded compare. Do not use
P-levels in a benchmark report or HIGH/MEDIUM/LOW in an audit.

## 3. Never expose framework internals

The reader sees plain-English practices, never the machinery:

- No rubric item IDs (`M1`, `V23`), category weights, thresholds, or the internal
  scoring math.
- No benchmark scores, angle counts, raw criteria field names, or marker
  coordinates from the MCP.
- Translate internals into visible practices: not "marker at x:0.7" but "the proof
  sits directly under the CTA"; not "score 82" but "the move the strongest pages
  make."

The public overall score (the `/100` in an audit) is allowed. The math behind it is
not.

## 4. Section taxonomy (use the canonical types verbatim)

Tag every finding with a section so handoffs match benchmark sections. Canonical
types: `hero`, `value_proposition`, `trust`, `testimonial`, `pricing`, `faq`,
`cta`. Use `page` for whole-page (narrative order, page focus). Resolve common
aliases to the canonical type: above the fold goes to `hero`, plan cards to
`pricing`, logos to `trust`, customer quotes to `testimonial`, value prop to
`value_proposition`, FAQ accordion to `faq`, final banner to `cta`. A handoff that
uses a non-canonical type cannot be matched downstream.

## 5. Honesty (do not overclaim)

- **Never assert an element is missing from a screenshot alone.** "No form", "no
  CTA", "no FAQ" must be confirmed in the DOM after network idle and a full scroll.
  If you cannot confirm, write "could not verify", not "missing".
- **Mark not-evaluable rather than guess.** If something genuinely cannot be judged
  (for example visual items with no render), say so and exclude it from any score.
  Surface what was not evaluated rather than letting the output look more complete
  than it is.
- **No promises.** Do not promise a ranking, a conversion lift number, or a
  guaranteed result. State the move and the reasoning, not an outcome guarantee.
- **The audit score is directional.** It is framework-relative (against proven CRO
  criteria). The calibrated, benchmark-anchored view comes from the grounded skills
  plus the MCP. Say so when you show a score.
