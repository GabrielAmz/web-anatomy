# Persona method

The detail behind the two modes of the `persona` skill: how to source objections
without inventing them (build), and how to cold-read a page as the persona
(challenge).

## Part 1 — Sourcing objections (build mode)

### The sourcing ladder

Work down this ladder. Stop asking for a lower rung only when the upper rungs
are exhausted, and record which rungs produced what in `Confidence and gaps`.

1. **The user's own data** (`user-stated`). Sales calls, lost-deal reasons,
   support tickets, churn reasons, onboarding questions, cold-outreach replies.
   Ask for it explicitly and concretely; three remembered bullet points from
   real conversations beat everything below. This is the only rung that can
   confirm an `inferred` objection into the top 3.
2. **Reviews of competitors** (`review-mined`). The buyer's own words about
   products solving the same problem:
   - **3-star reviews are the densest source.** 5-star reviews are marketing;
     1-star reviews are often edge-case rage; 3-star reviews explain what almost
     stopped a real buyer, which is exactly an objection.
   - **What to extract:** complaints ("support takes days", "price doubles at
     scale") become objections your page inherits by category. Praise ("setup
     took 10 minutes") reveals table stakes your page must at least match.
     "Switched from / switched to" sentences reveal the trigger and the
     comparison set.
   - **Where:** G2 and Capterra for B2B SaaS, Trustpilot for broader products,
     app stores for mobile, Chrome Web Store for extensions.
3. **Competitor FAQs and pricing pages** (`review-mined`, with the URL). Every
   question a competitor chose to answer publicly is an objection their market
   raised often enough to warrant a slot. Their pricing-page fine print ("can I
   cancel anytime", "what counts as a seat") is the anxiety inventory of the
   category.
4. **Community language** (`review-mined`, with the thread). Reddit, HN, niche
   Slack/Discord dumps, LinkedIn comments where the ICP talks shop. This rung
   is less about objections than **vocabulary**: the words they use for the
   problem (harvest verbatim), and the marketing words they mock. Both go into
   the Vocabulary field.
5. **Judgment** (`inferred`). Allowed, labeled, ranked below sourced
   objections, and never in the top 3 without user confirmation.

### The objection quality bar

An objection is a sentence the reader would say out loud, in first person, about
their own situation. Test each candidate:

- "Will this break our HubSpot sync?" — passes.
- "Integration concerns" — fails (a label, not a sentence).
- "Is this GDPR-compliant, and where is the data hosted?" — passes.
- "Trust issues" — fails.

Rank by frequency and intensity across sources, not by which is easiest to
answer. Cap at 8: a persona with 20 objections gives the writer no priority.

### The claims map method

For each of the 2-4 competitors the persona actually compares:

1. Capture the live homepage (and pricing page when relevant).
2. Extract four things: the **headline promise** (their H1, verbatim), the
   **proof shown** (logos, numbers, case studies, security badges — types, not
   an inventory), the **pricing posture** (public vs "talk to sales", free tier
   or not), and their **table-stakes claims** (the promises that also appear on
   the other competitors' pages).
3. A claim that appears on 3+ pages in the set is **table stakes**: the page
   must satisfy it but must never lead with it. This is the input to
   `write-page`'s claims-parity check.

### Buying committee — when and only when

Capture a committee when the purchase needs more than one yes. Signals: the
conversion goal is "book a demo" or "talk to sales", the price is
four-figures-plus annual, or the user says so. Each member gets one line and one
objection (the economic buyer: "what does this replace in the budget"; the
security reviewer: "SOC 2 or it does not enter the building"; the team lead:
"how long until my team actually uses it"). A self-serve product bought on a
card gets no committee section. Do not invent stakeholders for completeness.

## Part 2 — The cold-read protocol (challenge mode)

Read once, in order, as the persona. Do not study the page like an auditor;
experience it like a visitor with a tab bar full of alternatives.

### 1. The five-second read

Look only above the fold. Answer as the persona, fast: What is this? Is it for
me? Why should I care? Any "unclear" is a hero finding. Do not scroll first; the
whole point is the cold first impression.

### 2. The scroll narrative

Walk the sections in order. At each one, narrate in first person: what I am
thinking, which of my objections this just answered or raised, whether I keep
reading. Name the exact section where attention drops ("by the third feature
card I am skimming") — that drop-off point matters because anything below it is
invisible to the persona, and an objection "answered" below it counts as `weak`,
not `answered`.

### 3. The objection ledger

Go through the persona file's ranked objections, every one:

- `answered` — the page addresses it, above the drop-off point, in a way the
  persona finds credible. Record where.
- `weak` — addressed but not believed (vague, unproven), or buried below the
  drop-off point. Record where and quote the failing line.
- `unanswered` — the page never addresses it. Say where the persona expected it
  (usually: pricing anxiety at the CTA, risk at the form, "why you over X" near
  the proof).

### 4. Credibility flags

Quote the exact lines the persona does not believe as written. The usual
suspects: unnamed "hundreds of customers", suspiciously round numbers with no
source, superlatives ("the best", "the fastest") with nothing behind them,
testimonials with initials-only attribution. Mark each flag `loadBearing: true`
when it props up the hero headline, the pricing, or the primary proof.

### 5. The click decision

One yes or no: does the persona click the primary CTA? One sentence of
reasoning, in the persona's voice. If yes-but-hesitant, say what removed the
last doubt or almost did not.

### Verdict rule

FAIL when any top-3 objection is `unanswered` or a `loadBearing` credibility
flag exists. PASS otherwise; `weak` items ride along as improvements.

### What the challenge never does

- Never rewrites. The `fix` field states what the fix must achieve ("name the
  data-export policy at the CTA"), never the new line itself.
- Never averages two personas into one reader.
- Never judges design aesthetics; it judges whether the reader is convinced.
  Route visual polish to `audit-page` / `build-page`.
- Never runs as a panel. One sourced persona, one pass. If the output feels
  thin, the fix is better sourcing in build mode, not more judges.
