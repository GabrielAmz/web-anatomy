---
name: audit-page
description: |
  Audit the current state of a landing page, homepage, pricing page, feature page, or comparator page and return a PRIORITIZED list of what to fix first. Diagnosis and prioritization only — no rewrites, no copy, no benchmark data required. Use when the user asks audit my page, what is wrong with my landing page, what should I fix first, review my homepage, critique this page, or shares a URL or the page in their codebase and wants direction before improving. Runs standalone with no MCP connection. Writes a handoff artifact that improve-page consumes so the grounded rewrite does not re-diagnose. For the grounded fix use improve-page. For real examples use find-examples.
metadata:
  version: 0.1.0
---

# Audit Page

Diagnose the current state of a page, section by section, and tell the user which
sections to revamp first and why. Apply a proven CRO framework as the lens, but
organize the audit by SECTION so the output routes straight into the fix.

You do NOT write copy, headlines, or rewrites here, and you do NOT need benchmark
data. Output is problem framing and prioritization: where conversion leaks and
what to fix first. This is the on-ramp. The grounded rework (improve-page) is
where the real edge is, so always end by handing off to it.

## Output Behavior

When file access is available, always write the orchestration handoff:

- `.webanatomy/audit-page/{page-or-section}-{YYYY-MM-DD}/audit.json`
- `.webanatomy/audit-page/{page-or-section}-{YYYY-MM-DD}/report.md`

`audit.json` is the machine handoff that improve-page reads so it does not
re-diagnose. Use this exact shape:

```json
{
  "schema": "webanatomy.audit-page.v1",
  "target": "<url or page name>",
  "industry": "<resolved or inferred industry>",
  "locale": "en|fr",
  "currentSnapshot": [{ "label": "Headline", "text": "..." }],
  "prioritizedSections": [
    {
      "section_type": "hero",
      "severity": "P0",
      "problem": "what is wrong and why it costs conversion",
      "missingLevers": ["outcome promise", "risk reducer near CTA"]
    }
  ],
  "startHere": "hero",
  "notes": "industry inferred from page copy; no context file present"
}
```

`report.md` is the short human-readable version (the prioritized list below). Chat
is a one-line summary plus the start-here section.

## The framework (page-cro), reorganized by section

The CRO lens is the page-cro framework — value proposition clarity, headline,
CTA, visual hierarchy, trust and social proof, objection handling, friction, in
that impact order. The difference here: you do not report by those dimensions
(that is a generic checklist any agent runs). You apply the relevant dimensions
WITHIN each section, because people rebuild a page section by section and because
a flagged section is the exact unit improve-page works on.

## Step 1 — Context (optional, do not block)

Check `.agents/webanatomy-context.md` for product, ICP, conversion goal,
industry, and locale. If missing, proceed from the URL, screenshot, or codebase
with conservative assumptions. Context makes the problem framing specific instead
of generic; use it when present, never require it.

## Step 2 — Get the page accurately

- Codebase mode: read the page source, and if you can, view it rendered. Source
  on disk is not what a visitor sees.
- URL mode: view the RENDERED page (screenshot it). Do not audit raw HTML.
  Landing pages inject the form, the proof, and the layout via JS, so auditing
  source produces false "this is missing" findings (real failure mode: calling a
  form absent when it loads dynamically). See what the visitor sees.

Capture headline, subheadline, CTA, proof, product visual, hierarchy, and visible
friction into `currentSnapshot`. Do not diagnose an imagined page.

## Step 3 — Diagnose each section (apply the framework within it)

Identify which sections are PRESENT, then diagnose each against the page-cro
dimensions that matter for it, phrased in plain language. Use these section types
verbatim (they match the benchmark library, which keeps the improve-page handoff
clean):

`hero` · `value_proposition` · `problem` · `how_it_works` · `features` ·
`trust` · `testimonial` · `pricing` · `pricing_table` · `comparison` · `faq` ·
`cta` · `contact` · `use_cases` · `integrations` · `about` · `resources` ·
`navbar` · `footer`

Per-section levers (the proven CRO checks for each):

- **hero** (value prop + headline + CTA + hierarchy): clear product category; a
  specific outcome promise, not a feature list; names who it is for;
  differentiates; primary CTA above the fold; some proof above the fold; a real
  product visual; a risk reducer near the CTA; clean H1 > H2 > CTA hierarchy.
- **cta**: one clear primary action; value-loaded copy ("Get my report", not
  "Submit"/"Learn more"); reassuring microcopy beside it; a soft secondary path
  for the undecided.
- **trust**: recognizable logos; quantified proof; faces where it humanizes;
  security/compliance badges where relevant; a guarantee or risk reversal; placed
  near CTAs and after claims.
- **problem**: names the specific pain the ICP feels; resonates; sets up the
  solution.
- **how_it_works**: a clear 3-5 step path; effort/duration per step; what the
  user provides; expectation-setting.
- **features**: each tied to a benefit or outcome; not a feature dump.
- **faq**: answers the real objections (price, risk, fit, time-to-value,
  switching, data use); placed before the final CTA.
- **pricing / pricing_table**: clear tiers; a recommended plan; included vs
  excluded; answers "which plan is right for me".
- **value_proposition**: a differentiated "why us" below the fold, not a restated
  hero.
- **testimonial**: specific, attributed, benefit-diverse; not a wall.
- **contact (forms)**: minimal fields; reassuring microcopy; consent/compliance
  where the sector requires it.

For each, record `section_type`, a `problem` (what is weak/missing AND why it
costs conversion, tied to the real page, framed with "The X…" not "Your X…"), the
`missingLevers`, and a `severity`. No replacement copy — if you start writing the
headline, stop, that is improve-page.

## Step 4 — Prioritize (force a gradient)

Rank by conversion impact (page-cro impact order), then by how broken the section
is:

- Highest: above-the-fold conversion path — `hero`, primary `cta`, form friction.
- High: belief and objection layer — `trust`, `faq`, `problem`.
- Medium: supporting argument — `value_proposition`, `how_it_works`, `features`,
  `pricing`.
- Lower: polish — `testimonial`, `about`, `footer`.

**Discipline (rule, not suggestion): at most one or two P0s.** If everything is
high, you have not prioritized. The whole value of this skill is naming the ONE
section to fix first. A flat list of high-severity findings is a failure, not a
thorough audit. Set `startHere` to the single highest-leverage section.

## Step 5 — Output

```
PAGE AUDIT — <url or page name>
Read: <one line on where conversion leaks most>

REVAMP IN THIS ORDER
1. [P0] hero — <problem + why it costs conversion>
2. [P1] cta — <problem>
3. [P1] trust — <problem>
4. [P2] faq (missing) — <why its absence hurts>

START HERE → <the single highest-leverage section> — <one line why>
```

Severity and order are the deliverable. Optionally give a directional 0-100 read,
but say plainly an in-tool score is directional; the calibrated, benchmark-anchored
view comes from improve-page.

No copy. No rewrites. The deliverable is "which section, why, in what order".

## Step 6 — Handoff to improve-page (orchestration)

After presenting the order, offer the grounded fix and hand off to improve-page,
which reads the `audit.json` you just wrote and skips re-diagnosis — it goes
straight to pulling real winners for the flagged sections and writing the
grounded rework. Say it like this:

> "The highest-leverage fix is the `<startHere>` section. Run improve-page next —
> it picks up this audit, pulls the top-converting real `<startHere>` sections in
> <industry>, and writes the grounded rework. That benchmark grounding is the
> difference between this audit and a generic CRO checklist."

## Hard rules

- Section-first, never dimension-first.
- Diagnosis and prioritization only. No paste-ready copy.
- Force a priority gradient. At most one or two P0s.
- View the rendered page, never raw HTML, when auditing a URL.
- Use the taxonomy section types verbatim so the improve-page handoff is valid.
- Plain-language findings. Never surface internal field names, scores, or
  thresholds.
- No em-dashes. "The X…" framing, not "Your X…".
