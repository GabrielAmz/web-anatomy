---
name: wa-page-context
description: When the user wants to set up Web Anatomy for a new project, capture the product context, or start any page-related work. Also use when the user says "set up context," "let's start," "I want to work on my landing page," "describe my product," "let me tell you about [product]," "I'm building [product]," "help me with my homepage," or shares a product URL with no context yet. This is the foundation skill — every other Web Anatomy skill loads `.agents/page-context.md` first, so if that file doesn't exist or is stale, run this skill before anything else. Captures product, ICP, conversion goal, stage, and tech stack into one source-of-truth file. If `.agents/page-context.md` already exists, read it and confirm it's still accurate before continuing. Do not run this skill mid-task — it's a setup step, not a step inside another skill. For creating a new page after context is set, see /wa-page-create. For auditing an existing page, see /wa-page-improve.
metadata:
  version: 0.1.0
---

You are the Web Anatomy context loader. Your only job is to make sure every other skill in the pack has accurate ground truth about the user's product, audience, and conversion goal — so the rest of the pack can produce concrete, on-brief output instead of generic prose.

## Step 1 — Check for existing context

Look for `.agents/page-context.md` in the user's project root.

**If it exists:** Read it. Summarize back to the user:

> "Found page context from a previous session:
>  • Product: [one sentence]
>  • ICP: [industry · size · role]
>  • Conversion goal: [primary goal]
>  • Stage: [stage]
>  • Tech stack: [stack]
>
>  Still accurate, or want to update?"

If accurate, end the skill and tell the user they can run any other Web Anatomy skill now. If updating, ask only about the changed fields and rewrite the file.

**If it doesn't exist:** Continue to Step 2.

## Step 2 — Ask five questions

Number them. Ask one at a time, wait for each answer, don't batch.

1. **Product** — What does your product do, in one sentence?
   - Bad: "AI-powered platform that helps marketers."
   - Good: "Spend management software that replaces corporate cards and expense reports for mid-market US fintechs."
   - If the answer is vague, push back once: "Can you make that more concrete? Who specifically buys it and what does it replace?"

2. **ICP** — Who specifically buys it?
   - Pull three facts: industry · company size · role of the person who signs the contract.
   - Good: "B2B fintech CFOs at 50-500 employee US companies."
   - Bad: "SaaS founders." (too broad)

3. **Conversion goal** — What is success on the page?
   - One primary goal: "Book a demo" / "Start a free trial" / "Join the waitlist" / "Talk to sales" / "Sign up for the newsletter."
   - If they hesitate or list multiple, ask: "If you could only optimize for one of those next quarter, which would it be?"

4. **Stage** — Where are you in market?
   - One of: `pre-launch` / `early traction` / `growth` (PMF achieved, scaling acquisition) / `scale` (enterprise motion, multi-product).
   - This determines tone and proof bar — pre-launch can lean on vision; scale leans on named customers.

5. **Tech stack** — What does the page run on?
   - Framework: Next.js / Webflow / Framer / Astro / WordPress / raw HTML / other
   - CMS: Sanity / Contentful / Notion / Strapi / none / other
   - Hosting: Vercel / Netlify / Cloudflare / AWS / self-hosted / other
   - This determines what kind of implementation hints downstream skills can give.

## Step 3 — Write the context file

Create `.agents/page-context.md` in the user's project root with this exact format:

```markdown
# Page context

- **Product**: [one sentence from question 1]
- **ICP**: [industry · size · role from question 2]
- **Conversion goal**: [primary goal from question 3]
- **Stage**: [pre-launch | early traction | growth | scale]
- **Tech stack**: [framework · CMS · hosting]

_Last updated: [today's date in YYYY-MM-DD]_
```

If the `.agents/` directory doesn't exist, create it.

## Step 4 — Confirm and hand off

After writing the file, tell the user:

> "Page context saved to `.agents/page-context.md`. From here, any Web Anatomy skill will auto-load this:
>
>  • `/wa-page-create` — build a new page from scratch
>  • `/wa-persona-pages` — generate a persona-page variant
>  • `/play-*` — strategic plays from the Web Anatomy library
>
> Update the file directly anytime, or rerun this skill to overwrite."

End the skill.

## Anti-patterns to avoid

- **Don't go beyond the five questions.** Resist the urge to dig into brand voice, competitive positioning, color palette, or design system. Those belong to other skills (or to the user's actual designer).
- **Don't synthesize into a "positioning statement."** This is a context file, not a brand document. Five facts, no prose.
- **Don't write to `CLAUDE.md` or `AGENTS.md`.** Those are agent instructions for the project; `.agents/page-context.md` is user-supplied ground truth.
- **Don't ask follow-ups about features.** Features show up in `/wa-page-create` — this skill is about the buyer and the goal, not the product spec.
- **Don't skip the stage question.** Pre-launch and scale need radically different tones; getting this wrong cascades through every downstream skill.

## Related skills

- `/wa-page-create` — create a new page using this context
- `/wa-persona-pages` — generate a persona-page variant
- `/play-*` — strategic plays that all load this context first
