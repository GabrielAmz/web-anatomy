# Contributing to Web Anatomy

PRs welcome. The bar is high but the recipe is short.

## What we accept

- **New skills** — page-level audits, section revamps, page generators, strategic plays
- **Reference pattern additions** — real companies doing a section well, with URL evidence
- **Skill improvements** — tighter triggers, better anti-patterns, sharper output specs
- **Docs / typo fixes**

## What we don't accept (yet)

- Skills for backend topics (auth, payments, infra) — out of scope, this is a page-anatomy pack
- Generic "marketing" or "growth" skills — see [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) instead
- Skills that don't conform to the [Agent Skills spec](https://agentskills.io/specification.md)

## The 5-step recipe for a new skill

1. **Name it** — `wa-<verb>-<noun>` for page-level skills (e.g., `wa-faq-revamp`), or `play-<strategy-slug>` for strategic plays (e.g., `play-roi-calculator`).
2. **Create the directory** — `skills/<name>/` with `SKILL.md` inside. The directory name must exactly match the `name:` field in front matter.
3. **Write the front matter**:
   ```yaml
   ---
   name: wa-faq-revamp
   description: When the user wants to [...] long, trigger-phrase-dense description that ends with cross-references to related skills.
   metadata:
     version: 0.1.0
   ---
   ```
   The `description` is how Claude routes — pack it with synonyms.
4. **Write the body** — under ~5000 tokens / 500 lines. Push detail into `references/<topic>.md`. Body structure:
   - Role prompt ("You are an expert in...")
   - Step 1 — load `wa-page-context` (every page-level skill does this)
   - Step 2+ — the framework
   - Anti-patterns to flag
   - **Reference patterns** — at least one named real-world company with a URL
   - Output format spec
   - Related skills (cross-link to siblings)
5. **Validate and PR** — run `./validate-skills.sh`. If it passes, open a PR using the template.

## Style conventions

- Voice: confident, named-examples-only, anti-conventional-wisdom. End sections on a sharp aphorism when natural.
- No generic best-practice prose. Every recommendation needs a named company or a specific number behind it.
- Anti-patterns by name. "Submit / Click Here are dead CTAs" beats "use strong CTAs."
- Trigger phrases in the description verbatim — copy how the user would actually phrase the request.

## How descriptions work

The `description:` field is loaded into context at agent startup. The body is loaded only when the skill activates. Keep the description tight and trigger-rich; let the body carry the depth.

## Reference patterns

Each skill must cite at least one **Reference pattern** — a real company doing this section well, with a URL. Don't make these up. Use companies you've seen the pattern on. If your reference is paywalled or gone, replace it.

Best sources for references:
- Ramp, Wiz, Webflow, Linear, Stripe, Vercel, Figma, Notion, Lovable, Mercury, Lemlist, Brex
- The teardowns in [Web Anatomy's source library](https://github.com/GabrielAmz/web-anatomy/tree/main/skills) (look for `seenOn:` fields)
