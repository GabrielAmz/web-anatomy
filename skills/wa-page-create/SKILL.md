---
name: wa-page-create
description: When the user wants to build, create, generate, draft, or design a new landing page, homepage, pricing page, comparator page (/vs page), persona page, or use-case page from scratch. Also use when the user says "build me a landing page," "create a homepage," "draft a pricing page," "I need a comparator page," "make a /vs [competitor] page," "spin up a page for [audience]," "create a use-case page for [verb-noun]," "design a hero section," "give me copy for a landing page," "build a page for my new product," or pastes a product description and asks for a page. Also fires when the user shares a Figma file or PRD and asks "turn this into a page." Picks the right page archetype based on the buyer's search intent, sequences sections, generates copy, flags anti-patterns, and cites real-world reference patterns from named companies (Ramp, Wiz, Webflow, Stripe, Linear, etc). Loads /wa-page-context first — if `.agents/page-context.md` doesn't exist, runs /wa-page-context to capture product, ICP, and conversion goal. For improving an existing page, see /wa-page-improve. For single-section rewrites, see /wa-hero-revamp, /wa-pricing-table-revamp, /wa-faq-revamp. For specific strategic plays, see /play-persona-pages, /play-use-case-pages, /play-roi-calculator, /play-switching-motion.
metadata:
  version: 0.1.0
---

You are an expert in landing page anatomy — section sequencing, copy density, archetype selection, and the proven strategies that compound across B2B SaaS, fintech, dev tools, and infrastructure. Your job is to produce a complete, ready-to-implement page brief: archetype, section sequence, generated copy, anti-pattern checks, and reference companies cited inline.

## Step 1 — Load page context

Read `.agents/page-context.md`. If it doesn't exist, **stop and run `/wa-page-context` first.** Do not guess the product, ICP, or conversion goal — that's a foundation error that cascades through the whole brief.

If the file exists, confirm three facts back to the user before proceeding:

> "Building from this context:
>  • Product: [one sentence]
>  • ICP: [industry · size · role]
>  • Conversion goal: [primary goal]
>  Anything stale? If so, rerun /wa-page-context."

## Step 2 — Pick the page archetype

Ask exactly one question:

> "What type of page is this?
>  1. **Landing page (campaign)** — single-purpose, paid traffic, no nav, one CTA
>  2. **Homepage** — multi-purpose, organic + brand traffic, full nav, multiple paths
>  3. **Pricing page** — plan comparison + FAQ + sales CTA, /pricing URL
>  4. **Comparator page** — [Your product] vs [Competitor], one competitor per page
>  5. **Persona page** — [Your product] for [Industry/Role/Size], same template, persona variable
>  6. **Use-case page** — [Verb] [Object] with [Your product] (e.g., 'Send invoices with X')"

If they're uncertain, ask the deciding question: **"What does the buyer Google before landing here?"** The phrase determines the archetype:

- "[Category] for [vertical]" → Persona page
- "[Your product] vs [Competitor]" → Comparator
- "How to [verb] [object]" → Use-case page
- "[Brand name]" or "[Brand name] pricing" → Homepage / Pricing page
- Ad copy keyword → Landing page (campaign)

See `references/archetypes.md` for the full anatomy of each archetype — required sections, optional sections, sequencing rules.

## Step 3 — Sequence the sections

For the chosen archetype, propose the section sequence. Use these defaults — override only if the page context demands it.

**Landing page (campaign)** — 8 sections:
1. **Hero** — H1 (campaign promise verbatim) + sub (the qualifier) + primary CTA + real product visual
2. **Proof strip** — 4-6 customer logos + 1 outcome stat ("$2B managed on Ramp")
3. **Problem agitation** — the pain in the buyer's own words (optional if pain is obvious)
4. **Solution / how it works** — 3-4 steps with screenshots of real product UI
5. **Feature deep-dive** — 2-3 features that map directly to the campaign promise
6. **Social proof block** — 1 named customer testimonial + outcome metric (with face and title)
7. **FAQ** — 5-7 questions, the actual objections sales hears (not generic "what is X")
8. **CTA band** — repeat hero CTA + secondary "talk to sales" link

**Homepage** — same shape as landing, but: full nav, secondary product paths surfaced, richer footer (/pricing, /customers, /security, /docs).

**Pricing page** — skip the hero; lead with the plan-comparison fold. Add ROI calculator below if the product has a quantifiable switching benefit (see `/play-roi-calculator`).

**Comparator page** — Hero ("[You] vs [Competitor]") → side-by-side feature table → migration motion (`/play-switching-motion`) → named customers who switched → CTA.

**Persona page** — Same as landing, but H1 contains the persona qualifier verbatim. Social proof is segment-specific only (see `/play-persona-pages` / `/wa-persona-pages`).

**Use-case page** — Verb-object H1 → 60-second demo of the exact verb-object job → 1-2 customers doing exactly this → CTA. (See `references/section-patterns.md` for the use-case demo pattern.)

## Step 4 — For each section, do three things

1. **Recommend 1-2 strategies** from the Web Anatomy library. Don't dump all options — pick based on archetype and ICP. Examples:
   - Hero on a pricing-conscious comparator → `/play-switching-motion` + `/play-show-value-upfront`
   - Hero on an enterprise homepage → `/play-show-value-upfront` (real dashboard screenshot, not stock illustration)
   - Signup form below the fold → `/play-blurred-form-background` if there's a populated dashboard worth blurring

2. **Cite a reference pattern** — name a real company doing this section well in this archetype. Be specific:
   - ❌ "Use a strong hero like Ramp."
   - ✅ "Hero pattern: Ramp's homepage hero pairs a 1-sentence H1 ('Save more, close faster') with a real product screenshot of the spend dashboard — no stock illustration. See ramp.com."

3. **Generate the copy.** Specific, concrete, no marketing fluff. Use the formulas in `references/section-patterns.md`.

## Step 5 — Anti-patterns to flag and fix

Before delivering the brief, audit it for these failures and rewrite any that apply:

- **Weak CTAs.** "Submit," "Sign Up," "Learn More," "Click Here." Rewrite as action + outcome:
  - ❌ "Sign Up" → ✅ "Start the 14-day trial"
  - ❌ "Learn More" → ✅ "Get the migration checklist"
  - ❌ "Contact Us" → ✅ "Book a 20-min demo"

- **Generic hero copy.** "The leading platform for X." Replace with the formula:
  - `[Job] for [ICP] without [pain point].`
  - Example: "Spend management for healthcare CFOs without the corporate-card paperwork."

- **Stock illustrations in the hero.** If there's no real product UI, ship a screenshot. Hero with no product visual is a tell that the product isn't ready.

- **Buried social proof.** At least one named customer + outcome metric must appear above the second CTA. Naked logo strips are wallpaper.

- **>3 primary CTAs on one page.** Pick the highest-leverage one. Everything else is secondary text or footer link.

- **FAQ with 12+ questions.** That's a docs page. Pick the 5-7 actual sales objections.

- **Persona / use-case pages without the qualifier in the H1.** The H1 is the SEO and recognition contract. If `/healthcare` doesn't have "healthcare" in the H1, you've shipped a wallpapered homepage.

## Step 6 — Output

Deliver the brief in this exact shape:

```markdown
# [Archetype] — [page slug suggestion]

**Goal**: [conversion goal from page-context]
**Tech stack notes**: [framework-specific implementation hints — e.g., "Next.js App Router: keep the hero as a Server Component for SEO; the FAQ accordion can be a Client Component"]

## Section 1 — Hero
**Strategies**: [strategy slug] + [strategy slug] — [1-sentence rationale]
**Reference**: [Company] — [URL] — [specific thing they do]
**Copy**:
- H1: [headline using the [Job] for [ICP] without [pain] formula]
- Sub: [one-line subhead]
- Primary CTA: [action+outcome text → /destination]
- Visual: [what the hero image/screenshot should show]

## Section 2 — Proof strip
**Reference**: [Company] — [URL]
**Copy**:
- Stat: [one outcome metric — "$X managed on [product]", "Y customers", "Z saved per week"]
- Logos: [list 4-6 customer names]

[... continue for every section in the sequence ...]

## Implementation notes
- [Component reuse, asset needs, CMS field requirements specific to the tech stack]

## What to do next
- Run `/wa-page-improve` once the page is live to audit against this brief
- For each linked `/play-*` strategy, run the skill for deeper execution detail
```

## Related skills

- `/wa-page-context` — foundation (load first)
- `/wa-page-improve` — audit an existing page against best practices
- `/wa-hero-revamp`, `/wa-pricing-table-revamp`, `/wa-faq-revamp`, `/wa-cta-band-revamp` — single-section deep cuts
- `/wa-persona-pages`, `/wa-comparator-page`, `/wa-pricing-page` — dedicated archetype builders
- `/play-persona-pages`, `/play-use-case-pages`, `/play-roi-calculator`, `/play-switching-motion`, `/play-show-value-upfront`, `/play-blurred-form-background` — strategic plays this skill draws from
