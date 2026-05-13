---
name: wa-persona-pages
description: When the user wants to build a persona page or persona-page variant — one landing page per buyer qualifier (industry, company size, role, or referrer channel) from a single template. Also use when the user says "build a persona page for [segment]," "create a /healthcare variant," "spin up /small-business," "I want pages for each ICP," "ship a page targeted at [vertical]," "create a programmatic SEO play for ICPs," "give me a /vc-portfolio-companies page," or describes a page like "spend management for healthcare CFOs." Generates the page using the Ramp /small-business pattern — qualifier in the H1, segment-specific logos, segment-specific testimonials, optional pricing emphasis tuned to the segment. Loads /wa-page-context first to know the product, ICP, and conversion goal. This skill is the executable form of the `play-persona-pages` strategy — for the underlying strategic play (mandatory/optional/alpha rules, hypothesis, variants), see /play-persona-pages. For creating other page types from scratch, see /wa-page-create. For improving an existing persona page, see /wa-page-improve.
metadata:
  version: 0.1.0
---

You are helping the user ship a persona page variant — one landing page per buyer qualifier (industry, size, role, or channel), built from a single template. The strategy is the Ramp `/small-business`, `/startups`, `/mid-market` move: same template, the qualifier is the only variable. Below is the play, in the form of mandatory rules (skip these and the page fails), optional rules (5-15% lift on top), and alpha experiments (only suggest if asked).

## Step 1 — Load page context

Read `.agents/page-context.md`. If it doesn't exist, run `/wa-page-context` first. You need the product, ICP, and conversion goal before generating any variant.

## Step 2 — Ask which qualifier

> "Which qualifier are we shipping a variant for? Pick one of four types:
>  1. **Industry** — `/healthcare`, `/legal`, `/manufacturing`. Highest defensibility (vertical testimonials), slowest to populate.
>  2. **Company size** — `/startups`, `/mid-market`, `/enterprise`. Easiest to ship; pricing emphasis varies per segment.
>  3. **Role** — `/for-cfos`, `/for-engineering-leaders`. Use when the buyer's role determines the buying criteria.
>  4. **Channel (referrer)** — `/accountants`, `/vc-portfolio-companies`. Aimed at the referrer, not the buyer — forwardable artifact.
>
>  What's the qualifier slug?"

## The Rule

Ship one landing page per buyer qualifier — industry, size, role, or channel — from a single template, with social proof and pricing emphasis tuned to each.

## Why This Works

Buyers don't search the bare category — they search the category plus a qualifier ("spend management for healthcare," "CRM for startups"). A page that puts that exact qualifier in the H1 makes the match recognition mechanical instead of editorial.

## Resources You Need In Place

- **≥3 named customers** — one per variant you ship. No customer in that segment means no variant for that segment, period.
- **Per-variant content sources** — real testimonials, vertical-specific social proof, and pricing emphasis from your data, not stock.
- **~2-4h per variant** after the template ships. Plan for 10+ variants in the first sprint if you want compounding.
- **A natural referrer layer** (accountants, PE/VC, integrators, agencies) — only required if you're shipping the channel variant.

## MANDATORY RULES — skip these and the play fails

1. **Put the qualifier in the H1.**
   Why: Buyers see their exact phrasing or they bounce in 5 seconds. The H1 is the matching contract.
   When: Every variant. No exceptions.

2. **Name the persona in the URL slug.**
   Why: Bare-keyword slugs compete with G2/Capterra. The qualifier in the URL is half the SEO surface.
   When: Always. Vanity slugs (`/personas/healthcare`) lose to canonical ones (`/spend-management-for-healthcare`).

3. **Swap social proof to a real customer in that exact segment.**
   Why: Generic logos read as content farming. Vertical-specific testimonials are the moat competitors can't fake overnight.
   When: When you have ≥1 named customer in that segment. If you don't, don't ship the variant yet.

## OPTIONAL — adds 5-15% lift on top of the mandatory rules

1. **Tune the pricing emphasis to the persona's price tolerance.**
   Why: Annual for enterprise, per-seat for SMB, custom for mid-market — same product, different price-fold framing.
   When: When pricing differs materially by segment. Skip if pricing is identical across personas.

2. **Footer-link a `/personas` hub on every variant.**
   Why: Crawl equity compounds. Without the hub, variants cannibalize each other in the same SERP.
   When: Once you have ≥3 variants live.

3. **Ship one variant aimed at the referrer, not the buyer.**
   Why: Accountants, agencies, PE/VCs share pages they can forward to portfolio companies. The fork is the lead-gen — outbound can't manufacture forwarded introductions.
   When: When you have a natural channel layer. Skip if your buyer is end-direct.

## ALPHA — experimental, only suggest if I explicitly ask

1. **A/B before scaling beyond 3 variants.**
   Why: Wrong qualifier vocab tanks worse than no qualifier. "Mid-market" might mean 50-500 employees to you and 200-2,000 to your buyer.
   When: Anytime you can run a 14-day test. Most teams skip this and pay for it in dead variants.

## Reference Pattern

**Ramp** — `/small-business`, `/startups`, `/mid-market`, `/enterprise`, `/accountants`, `/vc-portfolio-companies`. One template, the qualifier is the only variable. Testimonials and pricing emphasis swap per ICP. Footer hub at `/personas`. The H1 contains the qualifier verbatim on every variant.

**Also seen on**: Brex (industry variants), Gusto (size variants), Mercury (size + channel variants).

## Your Job

1. **Audit my context** against the mandatory rules above. If I'm missing a named customer in the segment, tell me before generating the variant — that's the blocker.
2. **Generate the variant** using the qualifier I picked. Output should include:
   - H1 with the qualifier verbatim
   - URL slug suggestion
   - 4-6 segment-specific logo placeholders (named, not generic)
   - 1-2 testimonial placeholders with required: real face, named title, segment-matching company, outcome metric
   - Pricing emphasis (optional but recommended) — annual for enterprise, per-seat for SMB, custom for mid-market
   - Footer hub link to `/personas` if I have ≥3 variants live
3. **Suggest 1-2 optional enhancements** that fit my product and stage. Don't dump all of them — pick the highest-leverage ones based on the qualifier type.
4. **Do not suggest ALPHA rules** unless I explicitly ask.

## Output format

```markdown
# Persona variant — [qualifier]

**URL slug**: /[qualifier-slug]
**Goal**: [conversion goal from page-context]

## H1
[Qualifier verbatim] · [Job] for [Segment] without [Pain point]

## Sub
[One-line subhead — segment-specific benefit]

## Primary CTA
[Action verb] [Outcome] → /[destination]

## Logos (4-6 — list the segment-specific customer names you'll feature)
- [Customer 1 in segment]
- [Customer 2 in segment]
- ...

## Testimonial block
> [Quote in real customer voice — outcome-focused, no marketing language]
> — [Named person], [Title], [Segment-matching company]
> Outcome metric: [time saved | dollars saved | X% improvement]

## Pricing emphasis (optional but recommended)
[Annual contracts | Per-seat pricing | Custom enterprise pricing] — see /play-persona-pages mandatory rule #2 if pricing differs by segment.

## Footer
- Link to `/personas` hub (once you have ≥3 variants live)
- Standard footer

## Implementation notes
- Use the same template as your other persona variants. The qualifier is the only variable.
- If shipping this variant in `[tech stack from page-context]`, [framework-specific hint].
- Estimated ship time: 2-4 hours after the template is ready.

## What to check before publishing
- [ ] Mandatory #1 — qualifier in the H1 verbatim
- [ ] Mandatory #2 — qualifier in the URL slug
- [ ] Mandatory #3 — at least one segment-specific testimonial
- [ ] No generic logos (only segment-matching customers)
```

## Related skills

- `/wa-page-context` — foundation (load first)
- `/wa-page-create` — build a different page archetype from scratch
- `/wa-page-improve` — audit an existing persona page against the mandatory rules
- `/play-persona-pages` — the underlying strategic play (full rules + hypothesis + variants + design rationale)
- `/play-use-case-pages` — sibling play (use-case variants instead of persona variants)
- `/play-best-x-category-pages` — sibling play (category-page variants)
