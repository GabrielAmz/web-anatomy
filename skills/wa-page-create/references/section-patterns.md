# Section patterns

Each section has known patterns, known anti-patterns, and known reference companies. The `wa-page-create` skill draws from this when generating copy and citing references.

---

## Hero

**Job**: 5-second recognition. Buyer sees the H1, decides whether the page matches what they Googled, and either stays or bounces.

**The formula**:
```
H1: [Job] for [ICP] without [pain point]
Sub: [Specific, concrete benefit — not "leading" or "best-in-class"]
Primary CTA: [Action verb] [Outcome] (action+outcome, never "Sign Up" / "Learn More")
Visual: Real product UI screenshot (no stock illustration)
```

**Examples**:
- ✅ "Spend management for healthcare CFOs without the corporate-card paperwork."
- ✅ "Sales tooling for outbound teams without the CRM overhead."
- ❌ "The leading AI-powered platform for modern teams." (generic, no qualifier, no pain)
- ❌ "Welcome to [Brand]." (no job, no ICP, wallpaper)

**Anti-patterns**:
- Hero without a product visual → reads as not-shipped-yet
- Hero with stock illustration of "diverse team at laptops" → reads as agency template
- H1 in marketing language ("Transform your workflow") → reads as inauthentic

**Reference patterns**:
- **Ramp homepage** — H1 "Save more, close faster" + real spend dashboard screenshot
- **Linear homepage** — H1 "Linear is the system for modern software development" + animated product UI
- **Wiz homepage** — H1 + Fortune 100 logo strip + real dashboard tabs
- **Lovable homepage** — H1 "Build something Lovable" + live prompt input that ships an app on demo

---

## Proof strip

**Job**: borrowed credibility. Buyer scrolls past the hero and asks "who else trusts this?" Answer it in 3 seconds.

**The formula**:
```
[4-6 customer logos] + [1 outcome stat with a number]
```

**Examples**:
- ✅ "$2B managed on Ramp" + 6 logos including Anthropic, Notion, Vercel
- ✅ "Trusted by 4,000+ engineering teams" + 4 logos
- ❌ "Loved by the world's best teams" + 12 generic logos (vague + cluttered)

**Anti-patterns**:
- Logo strip with no outcome stat → wallpaper
- Outcome stat with no logos → unverifiable
- More than 6 logos → cognitive overload, none register
- Logos at different sizes / styles → looks like a quilt

**Reference patterns**:
- **Stripe homepage** — clean 6-logo strip + "$1T+ processed" stat
- **Vercel homepage** — 6 logos + "Trusted by leading companies"
- **Linear /customers** — fewer logos, each is a clickable case study

---

## Problem agitation (optional)

**Job**: make the pain visceral. Quote the buyer's actual phrasing.

**The formula**:
```
[Quote from a real customer or Reddit thread]
[Bullet list of 3 manifestations of the pain]
```

**Anti-pattern**: agitating a pain the buyer doesn't have. If you're selling to growth-stage companies and the agitation is "spreadsheets are slow" — you've underestimated the buyer. Pain has to match stage.

**Reference**: most YC-stage SaaS landing pages skip this section entirely. Use it only when the pain is non-obvious from the campaign.

---

## Solution / How it works

**Job**: show the product working. 3-4 steps, each with a screenshot of the real product UI.

**The formula**:
```
3 or 4 numbered steps. For each:
- One-line description of the step (verb-object)
- Real product screenshot showing exactly that step
- Optional: 1-line callout of the outcome ("X happens in 60s")
```

**Examples**:
- ✅ Stripe: "Add Stripe to your site" → "Customers pay you" → "Get paid" with a real screenshot at each step
- ❌ "Step 1: Sign up" → "Step 2: Configure" → "Step 3: Go live" with stock illustrations (generic)

**Anti-pattern**: steps that describe configuration ("Set up your account," "Add your team") instead of value ("Run your first campaign," "Send your first invoice"). Configuration is friction; show the value.

**Reference**: Webflow homepage — three steps, each with a screenshot showing the actual Webflow canvas in different stages.

---

## Feature deep-dive

**Job**: explain what's different. Don't list every feature — pick 2-3 that map to the campaign promise.

**The formula**:
```
Per feature:
- Feature name (verb-object, not noun)
- 2-sentence description
- Screenshot of the feature in action
- (Optional) Outcome metric
```

**Anti-pattern**: feature grids with 12+ items. Pick the 2-3 that matter for this archetype. The full feature list lives at `/features` or in docs.

**Reference**: Notion homepage feature blocks — 3-4 features, each a verb-object name + screenshot + outcome line.

---

## Social proof block

**Job**: one named customer story that the buyer can identify with.

**The formula**:
```
- 1-3 sentence quote (no marketing language — actual buyer phrasing)
- Named person + title + company
- Real face (not a logo)
- Outcome metric: time saved / dollars saved / X% improvement
```

**Examples**:
- ✅ "We replaced four tools and saved $80K in our first quarter." — Sarah Chen, CFO, Acme Corp [photo]
- ❌ "[Brand] is amazing!" — Anonymous customer (no name, no outcome, no proof)

**Anti-patterns**:
- Quote with no name → unverifiable
- Quote with no outcome metric → marketing language
- Quote from a fictional persona (e.g., "Marketing Manager at Tech Company") → reads as fake

**Reference patterns**:
- **Linear** — customer page with single-quote heroes, named faces, outcome metrics
- **Ramp** — customer stories with finance-team-specific outcomes (close time, cost saved)

---

## FAQ

**Job**: handle the top 5-7 objections sales actually hears.

**The formula**:
```
Per question:
- The question phrased exactly as a prospect would ask it
- 2-4 sentence answer
- Optional: link to docs or a longer page
```

**Pick from**:
- Pricing objections ("What does it cost?", "Is there a contract?", "Can I cancel?")
- Migration objections ("How do I switch from [competitor]?", "How long does setup take?")
- Trust objections ("Where is my data stored?", "Are you SOC 2 certified?", "Who else uses this?")
- Fit objections ("Does this work for [vertical]?", "Does this integrate with [tool]?")

**Anti-pattern**: FAQ with 12+ questions. That's a docs page. Pick 5-7 actual sales objections — ask the sales team what they hear.

**Reference**: Mercury /pricing FAQ — six tightly-written objection answers, no fluff.

---

## CTA band

**Job**: closing fold. Repeat the primary CTA, add a secondary "talk to sales" link.

**The formula**:
```
- 1-line H2 reframing the value prop
- Primary CTA: same action+outcome text as the hero (consistency builds confidence)
- Secondary link: "Talk to sales" or "Book a demo" (smaller, less visual weight)
```

**Anti-patterns**:
- CTA with no H2 — looks like a footer banner, not a closing fold
- Three competing CTAs — pick one primary, one secondary
- Different CTA text from the hero — buyer wonders if it's a different offer

**Reference**: every Stripe page — CTA band repeats the homepage CTA verbatim. Consistency.

---

## Self-segmenter (optional, homepage / pricing)

**Job**: when you serve 3+ ICPs, let the reader pick.

**The formula**:
```
3-4 cards or tabs at the top of the page:
- "I'm a [solo founder]"
- "I'm at an [agency]"
- "I'm at an [enterprise]"
On click, the page reflows: copy, examples, pricing emphasis.
```

**Reference**: VWO homepage — segmenter at the top, full page reflows per segment. See `/play-self-segmenting-homepage`.

---

## Use these patterns to generate copy

The `wa-page-create` skill draws from this file for two things:

1. **Copy formulas** — use the `[Job] for [ICP] without [pain]` H1 formula, the `action+outcome` CTA formula, etc.
2. **Reference patterns** — cite a real company doing this section well in this archetype.

Always cite at least one real reference per section. "Use a strong hero like Ramp" is generic; "Ramp's homepage hero pairs 'Save more, close faster' with a real spend dashboard screenshot" is specific.
