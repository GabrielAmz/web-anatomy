# Page archetypes

Each archetype is a template — required sections, optional sections, recommended order. The `wa-page-create` skill picks an archetype based on what the buyer Googles before landing on the page.

---

## Landing page (campaign)

**Buyer signal**: clicked an ad, opened a cold email, arrived from a specific outbound link. One source, one promise, one conversion goal.

**Required sections** (in order):
1. **Hero** — H1 mirrors the campaign promise verbatim, sub names the qualifier, primary CTA is action+outcome, real product visual
2. **Proof strip** — 4-6 customer logos + 1 outcome stat
3. **Solution / how it works** — 3-4 steps with screenshots
4. **Social proof block** — 1 named-customer testimonial + outcome metric
5. **CTA band** — repeat hero CTA + secondary "talk to sales"

**Optional sections**:
- Problem agitation (between hero and solution) — when the pain isn't obvious from the campaign
- Feature deep-dive (between solution and social proof) — when the campaign promises specific features
- FAQ (between social proof and CTA band) — when the offer needs objection-handling

**Anti-pattern**: full homepage nav. Landing pages strip the nav so the only choices are the CTA or scroll. Adding a nav is a campaign-killer.

**Reference**: any Ramp campaign landing — `ramp.com/[campaign-slug]`. Hero promise → 3-step how-it-works → 1 named customer → CTA. No nav.

---

## Homepage

**Buyer signal**: typed your brand name, clicked a brand keyword ad, or arrived from organic/brand traffic. Multiple potential conversion paths — pricing curiosity, demo intent, product research, jobs page, security page.

**Required sections** (in order):
1. **Hero** — value-prop H1 (broader than a campaign), real product visual
2. **Proof strip** — logos + outcome stat
3. **Product / features** — 3-4 product surfaces with screenshots and one-liners
4. **Social proof block** — multi-customer testimonial carousel or 2-3 named quotes
5. **Secondary paths** — section that branches: pricing, customers, security, docs, blog, careers
6. **CTA band**

**Optional sections**:
- Problem agitation (rare on homepages — the buyer is already brand-aware)
- Self-segmenter (if you have ≥3 distinct ICPs — see `/play-self-segmenting-homepage`)
- Use-case carousel (links to /use-cases/* pages)
- Persona switcher in the nav (see `/play-persona-pages`)

**Anti-pattern**: trying to be a landing page. Homepages serve multiple jobs — don't strip the nav, don't kill the secondary paths.

**Reference**: Wiz homepage — `wiz.io`. Real dashboard hero, Fortune 100 logo strip, three product tabs with screenshots, named customer quote, segmented bottom CTA.

---

## Pricing page

**Buyer signal**: high-intent. Already category-aware, evaluating cost. The `/pricing` URL is the most valuable click on the site after the homepage.

**Required sections** (in order):
1. **Plan comparison fold** — 3-4 plans side-by-side with feature checkmarks
2. **FAQ** — pricing-specific objections (annual discount, contract length, seat limits, what counts as "user")
3. **Sales CTA band** — "Talk to sales" for enterprise tiers

**Optional sections**:
- ROI calculator (above plan comparison if the product has quantifiable savings — see `/play-roi-calculator`)
- Hero (small — most pricing pages skip the hero and lead with the plan fold)
- Customer roster (between FAQ and CTA — proof at the moment of price hesitation)
- "Built for" segmenter (if pricing varies by segment — see `/play-self-segmenting-homepage`)
- No-pricing alternative: 3-5 question survey routed to a calendar booking (see `/play-pricing-tab-survey`) — when public pricing would hurt deal economics

**Anti-pattern**: hiding the price behind "Contact us" without a survey. The /pricing click is too high-intent to waste on a contact form. Either show the price or route to a 3-question qualifier with a calendar.

**Reference**: Linear pricing — `linear.app/pricing`. Three plans, transparent per-seat pricing, FAQ that handles seat-count and trial questions, Enterprise CTA for the top tier.

---

## Comparator page

**Buyer signal**: comparing two products head-to-head. URL pattern: `/vs/[competitor]` or `/[competitor]-alternative`. Already deep in evaluation.

**Required sections** (in order):
1. **Hero** — "[You] vs [Competitor]" framing, qualifier+job in the sub, primary CTA is "Switch in [X days/hours]"
2. **Side-by-side feature table** — your strengths first, competitor's strengths acknowledged
3. **Switching motion** — numbered migration process, time per step, named onboarding specialist (see `/play-switching-motion`)
4. **Named customers who switched** — 1-2 testimonials from companies that moved off the competitor
5. **CTA band** — "Start the migration" or "Book a switching call"

**Optional sections**:
- Pricing comparison (if you're cheaper or pricing differently)
- ROI calculator (savings from switching — see `/play-roi-calculator`)
- "Why companies leave [Competitor]" — the 3-5 reasons customers give for switching

**Anti-pattern**: a feature table with checkmarks only in your column. Reads as marketing, not comparison. Acknowledge what the competitor does well — credibility unlocks the rest.

**Reference**: Ramp /switch — `ramp.com/switch`. Replaces the comparison table entirely with a migration product: numbered steps, time per step, named human specialist with a face. Switching from Brex / Concur / Expensify becomes a logistics problem, not a comparison problem.

---

## Persona page

**Buyer signal**: typed "[your category] for [their segment]" — "spend management for healthcare," "CRM for startups," "scheduling for restaurants." URL pattern: `/[segment]` (e.g., `/small-business`, `/startups`).

**Required sections** (in order):
1. **Hero** — H1 contains the persona qualifier verbatim ("Spend management for healthcare CFOs")
2. **Proof strip** — segment-specific logos only (healthcare companies on the healthcare page)
3. **Solution / how it works** — same template as landing page, but the screenshots feature the segment's typical use case
4. **Social proof block** — named customer in that exact segment + outcome metric
5. **CTA band**

**Optional sections**:
- Pricing emphasis tuned to the segment (annual contracts for enterprise, per-seat for SMB) — see `/play-persona-pages`
- "Built for [segment]" feature row — features that matter most to this segment surfaced first
- Channel variant: page aimed at the referrer (accountants, agencies, integrators), not the buyer
- Footer link to `/personas` hub on every variant (crawl equity)

**Anti-pattern**: shipping a persona page without a named customer in that segment. Generic logos in a "for healthcare" page reads as content farming. If you don't have one customer in the segment, don't ship the variant yet.

**Reference**: Ramp /small-business, /startups, /mid-market, /enterprise, /accountants, /vc-portfolio-companies — same template, different qualifier in the H1, testimonials and pricing emphasis swap per ICP.

See also: `/wa-persona-pages` (skill that generates these variants from a template), `/play-persona-pages` (deep play with mandatory/optional rules).

---

## Use-case page

**Buyer signal**: typed "how to [verb] [object]" or "[verb] [object] with [your category]" — "send invoices with Stripe," "manage receipts," "track employee spend." URL pattern: `/use-cases/[verb-object]`.

**Required sections** (in order):
1. **Hero** — verb-object H1 verbatim ("Send invoices in minutes"), primary CTA is "Try it free"
2. **Demo** — 60-second video or interactive demo of the exact verb-object job
3. **Customer block** — 1-2 customers doing exactly this use case (not generic customers)
4. **CTA band**

**Optional sections**:
- "How it works" — 3-step breakdown of the job
- Related use cases (links to sibling /use-cases/ pages — crawl equity)
- FAQ (only the questions specific to this verb-object pair)

**Anti-pattern**: generic homepage clone with the H1 swapped. Use-case pages need the demo and the use-case-specific customer, or they're indistinguishable from the homepage and don't rank.

**Reference**: Loom /use-case/[verb] — `loom.com/use-case/design`, `/sales`, `/engineering`, `/marketing`. One template, different verb-audience in the H1, screenshots of the specific job.

See also: `/play-use-case-pages` (when this becomes a programmatic SEO play across 10+ verb-object pairs).

---

## Choosing the archetype

When the user is uncertain, ask:

> "What does the buyer Google before landing here?"

Map their answer:

| Buyer Googles | Archetype |
|---|---|
| "[Category] for [segment]" | Persona page |
| "[Your product] vs [Competitor]" | Comparator |
| "How to [verb] [object]" | Use-case page |
| "[Brand name]" or "[Brand name] pricing" | Homepage / Pricing |
| Ad copy keyword | Landing page (campaign) |
| Category keyword ("CRM," "spend management") | Homepage with a self-segmenter |

If the answer is "I don't know" — the user needs `/wa-page-context` more than `/wa-page-create`. Send them back.
