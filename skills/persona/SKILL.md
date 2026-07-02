---
name: persona
description: |
  The demand-side foundation of Web Anatomy. Build an evidence-based model of the reader (who they are, the trigger that sends them to the page, their ranked objections with sources, the words they use, the proof that convinces them, and the competitors they compare against), then use that persona to challenge any page or draft as that reader would. Use when the user asks to build a persona, model my ideal customer, define who my visitor is, what are my customers' objections, mine reviews for objections, map competitor claims, act as my persona, or to challenge a page — read this page as my customer, cold read my draft, stress test this copy, would my customer buy this, objection check, challenge me on this. Two modes. Build researches the persona into `.agents/webanatomy-persona.md`. Challenge cold-reads a live page, a write-page draft, or a build-page wireframe against the persona's objections and writes a pass/fail handoff that write-page consumes to fix exactly what failed. audit-page and write-page read the persona file when present. Never invents objections; every objection carries a source tag. For market examples use find-examples; for the diagnosis use audit-page; for the grounded rework use write-page.
metadata:
  version: 0.1.0
---

# Persona

You are the reader, not the writer. Every other Web Anatomy skill works the supply
side: what good pages look like (the benchmark), what this page looks like (the
audit), how to write (the copy rules). This skill owns the demand side: a sourced
model of the person the page has to convince, and the ability to read any page as
that person.

The one rule that makes this skill worth running: **a persona is only as good as
its evidence.** An invented persona is the same model wearing a mask; it will
politely agree with the copy it is judging. A sourced persona carries information
the writer did not have: the objections real buyers raise, in the words they use.
That is why every objection in the file carries a source tag, and why build mode
is a research workflow, not a brainstorm.

## Two modes

Detect the mode from the request:

- **Build mode.** Research and write `.agents/webanatomy-persona.md`, the durable
  reader model. Run when the user asks to build or update a persona, capture
  objections, mine reviews, or map competitor claims. Run it once per segment;
  update it when new evidence arrives.
- **Challenge mode.** Cold-read a target (a live URL, a `write-page` draft, a
  `build-page` wireframe, or pasted copy) as the persona, objection by objection,
  and write a pass/fail handoff. Run when the user asks to challenge, stress
  test, or cold-read a page, or right after `write-page` before `build-page`.

Challenge mode needs the persona file. If it does not exist, offer a quick build
first. If the user wants speed, run challenge with a minimal inline persona from
`.agents/webanatomy-context.md` (ICP + conversion goal) and label every judgment
`inferred` in the output; say plainly that a sourced persona would make the
challenge sharper.

## Output Behavior

Build mode writes:

- `.agents/webanatomy-persona.md` — the durable persona (shape below). One file
  per segment; a second segment goes to
  `.agents/webanatomy-persona-<segment>.md`, and the default file stays the
  primary ICP.

Challenge mode writes:

- `.webanatomy/persona/{target}-{YYYY-MM-DD}/challenge.md` — the human-readable
  cold read.
- `.webanatomy/persona/{target}-{YYYY-MM-DD}/challenge.json` — the machine
  handoff `write-page` consumes (schema below).

Chat stays short: the verdict, the top failing objection, and the file paths.

---

## Build mode

### Step 1 — Load context

Read `.agents/webanatomy-context.md` if it exists (product, ICP, industry,
competitors, conversion goal). If it does not, offer `webanatomy-setup` once,
then continue with what the user gives you. The context file names the segment
and the competitors; this skill deepens them into a reader model.

If `.agents/webanatomy-persona.md` already exists, read it, summarize it, and ask
whether to update it rather than rebuilding from scratch. Keep existing
source-tagged objections unless the user contradicts them.

### Step 2 — Ask for the user's real data first

The user's own evidence outranks everything you can mine. Ask once, concretely:

> Do you have any of these? Sales call notes or recordings, lost-deal reasons,
> support tickets, churn or cancellation reasons, onboarding questions, replies
> to cold outreach, or an existing persona doc. Paste or point me at whatever
> exists; even three bullet points from memory of real conversations beat
> anything I can infer.

Everything sourced here is tagged `user-stated`. Push back once on vague answers:
"they worry about price" is not an objection; "two prospects last month asked
what happens to their data if they cancel" is.

### Step 3 — Mine the market

When browser or fetch tools are available, gather outside evidence. The full
method, per source, is in `references/persona-method.md`. In short:

1. **Review mining** — read reviews of the competitors named in the context file
   (G2, Capterra, Trustpilot, app stores). Complaints about a competitor are
   objections your page inherits; praise reveals table stakes; "switched from /
   switched to" sentences reveal triggers. Tag `review-mined`, with the source.
2. **Competitor FAQ mining** — the questions competitors chose to answer on
   their pricing and landing pages are the objections the market already raises.
   Tag `review-mined`, with the URL.
3. **Community language** — threads where the ICP talks shop (Reddit, HN,
   niche forums, LinkedIn comments). Harvest vocabulary verbatim: the words they
   use for the problem, and the marketing words that make them sneer.

If no browsing is available, say so, skip this step, and mark the gap in
`Confidence and gaps`. Do not simulate quotes.

### Step 4 — Map competitor claims

For the 2-4 competitors the persona actually compares (from the context file or
Step 3), capture each one's live page and extract: the headline promise, the
proof types shown, the pricing posture, and the claims everyone makes. This map
has two consumers: `write-page` uses it as a claims-parity check (never ship a
headline three competitors already own), and the persona's "why you over X"
objection comes straight from it.

### Step 5 — Synthesize and rank

Distill the evidence into 5-8 objections, ranked by how often and how strongly
they appear. Quality bar for each objection: a sentence the reader would say out
loud, not a category. "Will this break our HubSpot sync?" is an objection;
"integration concerns" is a label. Every objection gets a source tag:

- `user-stated` — from the user's own data (Step 2). Strongest.
- `review-mined` — from reviews, FAQs, or community threads, with the source.
- `inferred` — your judgment. Allowed, but labeled, and never in the top 3
  unless the user confirms it.

Capture the buying committee only when one exists (the economic buyer who asks
about ROI and price, the security reviewer, the manager who has to roll it out).
One line and one objection each. A solo-buyer product gets no committee section;
do not invent one.

### Step 6 — Write the file and confirm

Write `.agents/webanatomy-persona.md` with this exact shape:

```markdown
# Web Anatomy persona

- **Handle**: The <role> who <situation>
- **Who**: role, company type and size, day-to-day context
- **Trigger**: the event that sends them to the page
- **Alternatives**: the status quo + the 2-4 competitors they actually compare
- **Proof that convinces**: ranked evidence types (named customers, hard numbers,
  a demo they can try, security page, ...)
- **Vocabulary**: words they use for the problem (verbatim) / words that make
  them bounce
- **Buying committee**: only when relevant — who else says no, one objection each
- **Confidence and gaps**: what is user-stated vs mined vs inferred; what is
  still unknown

## Objections (ranked)

1. "<objection, in the reader's words>" — [user-stated|review-mined|inferred]
   <source: link, or "sales calls", or "judgment">
2. ...

## Competitor claims map

| Competitor | Headline promise | Proof shown | Pricing posture | Table-stakes claims |
|---|---|---|---|---|

_Last updated: YYYY-MM-DD_
```

Summarize the top 3 objections in chat and ask the user to confirm or correct
the ranking; they know their market. Then point at the three places the persona
now plugs in: `audit-page` gains an objection-coverage check, `write-page`
writes objection-led copy in the reader's vocabulary, and challenge mode
stress-tests any draft.

---

## Challenge mode

One agent, one pass. The value is the persona's objections, not a jury; do not
spawn panels of judges.

### Step 1 — Load the persona and the target

Read `.agents/webanatomy-persona.md` (or the minimal inline fallback, labeled).
Then get the target:

- **Live URL** — capture it properly before judging: wait for network idle,
  dismiss consent overlays, scroll the full page, and verify presence or absence
  in the DOM, never from a screenshot alone (the same capture recipe as
  `audit-page` Step 2).
- **A `write-page` draft** — read the most recent
  `.webanatomy/write-page/{page}-*/report-data.json` and judge the written
  copy in its recommendations.
- **A `build-page` wireframe** — read `wireframe.html` top to bottom.
- **Pasted copy** — judge what is given; note what you could not see.

### Step 2 — The cold read

Read the page in order, once, as the persona, following the protocol in
`references/persona-method.md`. Produce four things:

1. **The five-second read.** Cover everything below the fold. As the persona:
   what is this, is it for me, why would I care? If any answer is "unclear",
   that is a finding on the hero.
2. **The scroll narrative.** Walk the page in order. At each section: what the
   persona is thinking, which objection just got answered (or raised), and where
   attention drops. Name the exact drop-off point.
3. **The objection ledger.** For every ranked objection in the file: `answered`
   (where, and does the answer convince), `weak` (addressed but not believed, or
   buried below the drop-off point), or `unanswered`.
4. **The credibility flags.** Claims the persona does not believe as written
   (unnamed "customers", round numbers with no source, superlatives), quoting
   the exact line.

End with the click decision: would the persona click the primary CTA, yes or no,
and the one sentence of reasoning.

### Step 3 — Verdict

- **FAIL** when any top-3 objection is `unanswered`, or a credibility flag hits
  a load-bearing claim (the hero headline, the pricing, the primary proof).
- **PASS** otherwise. `weak` items and non-load-bearing flags are listed as
  improvements, not blockers.

The persona judges; it never rewrites. No alternative headlines, no fixed copy
in the output; the `fix` field states what the fix must achieve, in one line.
Writing is `write-page`'s job.

### Step 4 — Write the handoff

`challenge.json`, exact shape:

```json
{
  "schema": "webanatomy.persona-challenge.v1",
  "target": "<url or draft path>",
  "personaFile": ".agents/webanatomy-persona.md",
  "personaInline": false,
  "verdict": "PASS|FAIL",
  "fiveSecondRead": { "what": "...", "forMe": "...", "care": "..." },
  "dropOff": { "section": "...", "why": "..." },
  "objections": [
    {
      "objection": "...",
      "source": "user-stated|review-mined|inferred",
      "coverage": "answered|weak|unanswered",
      "where": "<section or null>",
      "failingLine": "<exact line, when one exists>",
      "fix": "<what the rewrite must achieve, one line>"
    }
  ],
  "credibility": [
    { "claim": "<exact line>", "why": "...", "loadBearing": true }
  ],
  "wouldClick": { "answer": false, "cta": "...", "why": "..." },
  "notes": "capture method + anything not seen"
}
```

`challenge.md` is the readable cold read: verdict on top, the scroll narrative,
the ledger as a table, the flags, the click decision.

### Step 5 — Hand off

On FAIL, offer `write-page` with this handoff: it rewrites only the
`unanswered`/`weak` objections and the load-bearing flags, keeps everything that
passed, and then offers to re-run this challenge on the result. On PASS, the
natural next step is `build-page`. Loop challenge -> write-page at most twice;
if a third round still fails, the problem is upstream (positioning or proof, not
words) — say so and route to `find-examples` or a talk with the user.

---

## Reference patterns

- **The FAQ as an objection inventory.** The scored FAQ sections in the Web
  Anatomy benchmark (https://www.webanatomy.ai/best-landing-pages/sections) are
  exactly this: the questions each company chose to answer are the objections
  their market actually raises. Mine competitors' FAQs the same way.
- **Review mining sources.** G2 (https://www.g2.com), Capterra
  (https://www.capterra.com), Trustpilot (https://www.trustpilot.com). A
  competitor's 3-star reviews are the densest objection source: real buyers
  explaining what almost stopped them.

## Guardrails

- **Reader, not writer.** The persona never produces copy. Challenge output
  states what a fix must achieve, never the fixed line itself.
- **No invented evidence.** Every objection carries a source tag; `inferred` is
  allowed but labeled and outranked. Never fabricate quotes, reviews, or names.
- **Not a demographic sheet.** "35-44, urban, tech-savvy" is fluff. The payload
  is objections, vocabulary, trigger, and proof preferences.
- **One persona per run.** Challenge as one reader. If two segments matter,
  run challenge twice against two files; never blend them into an average
  reader who exists nowhere.
- **No judge panels.** One grounded persona pass beats five ungrounded hats.
  If the user asks for the CFO, that is the buying committee inside this file,
  not a separate skill.
- **House style.** Follow `webanatomy-setup/references/house-style.md` in all
  output: no em-dashes, "The X..." not "Your X...", never expose framework
  internals. Answer in the user's language.

## Related skills

- `webanatomy-setup` — the product-truth file this skill deepens.
- `audit-page` — reads the persona file for its objection-coverage check.
- `write-page` — reads the persona for objection-led angles and vocabulary, and
  consumes `challenge.json` to fix exactly what failed.
- `build-page` — the step after a PASS.
