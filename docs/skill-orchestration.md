# Skill orchestration

The canonical model for how the Web Anatomy skills fit together. Read this before
changing how skills route, hand off, or chain. Part 1 describes how the pack works
today. Part 2 is the proposed target model (not yet built) that fixes the weaknesses.

---

# Part 1: How it works today

## The mental model: three layers

You do not start at a skill. You start at intent. The skills sort into three layers.

```
webanatomy-setup        (context, once, optional)
        |
        v
  INTENT: "what do you want to do?"     <- the real entry (today: guessed by the LLM)
   improve a page   |   create a page
        |                   |
  BRIEF PRODUCERS: decide what the engine should do
   audit-page              (no clean owner; borrowed from find-examples)
        |                   |
        +---------+---------+
                  v
  ENGINE: write the grounded page         <- runs last, shared by both branches
   improve-page (improve mode | build mode)
                  |
                  v
            grounded output
```

1. Intent (top): improve an existing page, or create a new one. Today nothing owns
   this. The LLM infers it from the user's wording and routes straight to a skill.
2. Brief producers (middle): they decide WHAT the engine should do. Improve has a
   clean one (`audit-page`). Create does not.
3. Engine (bottom): `improve-page`. It executes the brief into grounded copy. It does
   not invent direction. Shared by both branches.

## The brief producers, on two axes

The three non-engine, non-setup skills differ only by whose page they look at and at
what scope.

```
                        WHOSE PAGE?
                 yours              the benchmark (others')
              +--------------+-------------------------------+
   page scope |  audit-page   |  find-examples                |
              |  (diagnosis)  |  (market scan / structure)    |
              +--------------+-------------------------------+
 section scope|   (none)      |  research-best-practices       |
              |               |  (one section, tiered ladder)  |
              +--------------+-------------------------------+
```

- `audit-page` is the only skill that looks at YOUR page. It produces a diagnosis.
- `find-examples` and `research-best-practices` look at the BENCHMARK (what good looks
  like). They differ only by scope: whole page/market vs one section.

## The five skills

| Skill | Layer / altitude | Input | Produces | MCP? | Core guard |
|---|---|---|---|---|---|
| `webanatomy-setup` | Foundation | Q&A | `.agents/webanatomy-context.md` | no | Capture facts, never invent proof/competitors; never expose scoring |
| `audit-page` | Brief producer (Audit) | an existing page | `.webanatomy/audit-page/{target}-{date}/audit.json` | no | Score and recommend are independent tracks; render gates visual items; confirm against the DOM |
| `find-examples` | Brief producer (Page) | industry (+ optional URL) | `.webanatomy/find-examples/.../report-data.json` | yes (degrades) | Resolve industry, never from domain alone; capture the real page in compare |
| `research-best-practices` | Brief producer (Section) | one section type | `.webanatomy/research-best-practices/.../` tiers | yes (degrades) | One section only; route page/market to find-examples; tiers must build |
| `improve-page` | Engine (Fix) | an upstream brief | `.webanatomy/improve-page/.../` copy | yes (degrades) | Executor only; check brief first; never self-diagnose; apply copywriting-rules.md |

## The wires

Skills do not call each other as functions. They chain through shared files plus the
agent following "now run X" prose.

- `.agents/webanatomy-context.md` is the shared product truth. Every skill reads it,
  none blocks on it.
- `audit.json` is the only true machine handoff. `improve-page` reads it (Step 1.5) so
  the rework does not re-diagnose.
- The create-branch structure has no machine handoff. It is carried in conversation.

## Cross-cutting sanity checks (true for every workflow)

1. MCP is optional. Confirm availability, announce the static fallback, never block.
2. Industry and locale are always resolved, never blank, never from the domain alone.
3. Never expose internal scores, thresholds, or raw benchmark fields. Translate to
   plain-English practices.
4. Capture the real page, never an imagined one. "No CTA" must be confirmed in the DOM.
5. `improve-page` never self-diagnoses. It checks for a brief first (audit.json ->
   research-best-practices tier -> find-examples structure), and only falls back to
   inline diagnosis if nothing exists.

## Use cases (what the user types -> what runs -> what they get)

### A. "I have a page" (IMPROVE branch)

1. Audit my page
   - Ask: "What is wrong with my homepage, what should I fix first?"
   - Runs: `audit-page`. Scores, diagnoses section by section, writes `audit.json`.
   - Get: a prioritized fix list. No copy. Works with MCP off.

2. Audit then rewrite
   - Ask: "Improve my pricing page."
   - Runs: `audit-page` -> `improve-page` (improve mode) reads `audit.json`, benchmarks
     the flagged sections, writes copy.
   - Get: copy-paste fixes tied to real examples.

3. Compare to the best
   - Ask: "How does my hero stack up against the top SaaS pages?"
   - Runs: `find-examples` compare mode.
   - Get: a gap read (HIGH/MEDIUM/LOW) plus what is already working.

4. Level up one section
   - Ask: "Make my testimonials best-in-class."
   - Runs: `research-best-practices` -> optionally `improve-page` to apply a tier.
   - Get: a foundational/competitive/best-in-class ladder for that section.

### B. "I want a new page" (CREATE branch)

5. Inspiration / swipe file
   - Ask: "Show me strong B2B pricing sections."
   - Runs: `find-examples` discover mode.
   - Get: a swipe file grouped by pattern.

6. Build a new page
   - Ask: "Build me a new pricing page."
   - Runs today: `find-examples` for a structure -> `improve-page` build mode writes
     each section; `research-best-practices` for per-section depth.
   - Get: a built page with grounded copy. This is the rough path (see weaknesses).

### C. Foundation

7. Set up the project
   - Ask: "Set up Web Anatomy for my product."
   - Runs: `webanatomy-setup`.
   - Get: `.agents/webanatomy-context.md` that every skill reads.

## Weaknesses with the current flow

1. The CREATE branch has no real owner. Improve has `audit-page`. Create borrows its
   "sections + order" from `find-examples`, a swipe-file skill. The create brief is a
   side effect, not an owned job. This is the core gap.
2. Intent is never asked, only guessed. No "what do you want to do" step. Ambiguous
   wording ("work on my pricing page") can route to the wrong skill.
3. The engine is misnamed. `improve-page` also builds new pages. The name hides half
   its job and confuses both users and the LLM router.
4. `find-examples` is overloaded: inspiration, structure-for-build, and compare-vs-yours
   in one skill. It is the fuzziest node and the create branch leans on it most.
5. Two benchmark skills look the same to users. `find-examples` and
   `research-best-practices` both mean "show me what good looks like," differing only
   by scope. Users do not know which to invoke.
6. Only the diagnosis has a machine handoff. `audit.json` is real; the build structure
   is conversational, so it is fragile across context.
7. "Which sections, in what order" is unsupported. If you do not already know the list,
   nothing helps you decide it.
8. Build can fan out MCP calls: one benchmark lookup per section, no cap.

Throughline: the improve side is well-wired, the create side is improvised. Every
weakness is one of two things: the create branch lacks a clean "sections + order"
producer, or the intent layer is missing so routing is a guess.

---

# Part 2: Proposed target model (NOT YET BUILT)

The fix follows one principle: make the create branch symmetric to the improve branch,
and give every node a distinct verb so routing stops being a guess.

```
audit-page   is to  improve mode   what
[new producer] is to  build mode.
```

## Fix 1: a create-side brief producer (proposed name: outline-page)

Add a brief producer for the create branch that mirrors `audit-page`:

- Job: decide the sections and their order for a new page (the "structure"), grounded
  in the benchmark.
- Input: intent + a section list (user-picked, or recommended from benchmark winners).
- Output: a machine handoff `structure.json`, the create-branch analog of `audit.json`.
- Hand off: offers the engine the same way `audit-page` does ("want write-page to build
  this structure?").

Why a producer and not a front-door orchestrator: a producer has a distinct verb
(outline / plan a page) that does not collide with build or improve, so it coexists
with the engine exactly the way `audit-page` already does. A front door that branches
"create vs improve" would have to out-compete the engine for the same verb, which is
the routing collision flagged in eng review.

This fixes weaknesses 1, 4 (unloads structure off find-examples), 6 (machine handoff),
and 7 (a clear owner for sections + order).

Name candidates: `outline-page` (clearest, parallels audit-page), `plan-page`,
`structure-page`.

## Fix 2: rename the copy engine [DECIDED]

`improve-page` does both improve and build. Rename it to `write-page` (approved): it writes the
grounded COPY (per-section words + per-section design moves), for an existing page
(improve) or a new one (create). Keep the description triggers broad during migration;
the real change is the directory name plus a `validate-skills.sh` pass and a VERSIONS
entry.

This fixes weakness 3 and removes the main reason the create branch felt bolted on.

## Fix 4: a terminal assembler (build-page) [NEW] — both branches

A page needs three things: structure, copy, and design. `outline-page`/`audit-page` give
structure, `write-page` gives copy. `build-page` is the terminal step that produces the
DELIVERABLE: a shareable wireframe = structure + copy + a coherent page-level design
system (type scale, color direction, spacing, component style), assembled top to bottom.
This is the original "wireframe with the right copy you can share" goal.

`build-page` runs on BOTH branches. It is optional for improve (stop at write-page for
just the copy fixes, or continue to build-page for the shareable improved wireframe) and
the natural end for create.

**Design coherence = single exemplar (decided).** A design system cannot be averaged from
benchmark sections of different companies (their type/color/spacing clash). `build-page`
always derives the system from ONE coherent source:

- CREATE: one benchmark page the user likes (surfaced via `find-examples`). Its look only.
- IMPROVE: the user's OWN current page. It already has a coherent design language; keep it.

The exemplar drives DESIGN only. Structure still comes from the user's chosen sections
(`outline-page`) or the existing page (`audit-page`); copy comes from `write-page`.
`build-page` skins that structure + copy with the exemplar's look. It does not copy the
exemplar's content.

Why a distinct skill and not over-split: its job (page-level design synthesis from one
exemplar + assembly into a wireframe) is genuinely different from writing copy, the same
way `audit-page` differs from `write-page`. The over-split trap is avoided by one rule:

- **build-page REUSES write-page's references, it does not re-query the benchmark** for
  copy. `write-page` already selected a benchmark example per section (its `refIds`);
  `build-page` reads the single design exemplar plus those for composition. No double
  copy-lookup per section.

## Fix 3: the create branch is now a 3-step chain; outline-page owns the entry

The verbs:

```
set up   -> webanatomy-setup
find     -> find-examples
audit    -> audit-page
research -> research-best-practices
outline  -> outline-page      [new]
write    -> write-page        [renamed copy engine]
build    -> build-page        [new, create-terminal]
```

Routing nuance: the create branch is a chain (outline -> write -> build), so the user's
entry phrase ("build me a pricing page") must START the chain, not jump to the last
step. Resolve it the way improve already auto-chains (improve auto-runs audit first):

- `outline-page` owns the create entry. "Create / build me a page" routes to
  outline-page, which then chains forward to write-page and build-page automatically.
- `build-page`'s own triggers stay narrow ("apply a design system", "assemble the
  page", "give me design guidelines for this structure") so it does not hijack the
  entry phrase.

With that, no separate front-door node is needed: outline-page is the de facto entry
for create, audit-page for improve.

## Target model

```
webanatomy-setup
   |
   v
                 IMPROVE                         CREATE
   audit-page (your page -> audit.json)   outline-page (sections+order -> structure.json)
            |                                      |
            v                                      v
   write-page (improved copy)              write-page (new copy)
            |                                      |
            v                                      v
   build-page (assemble wireframe,         build-page (assemble wireframe,
   exemplar = your current page)            exemplar = a benchmark page you like)
   [optional]                                      |
            |                                      v
            v                              shareable wireframe (structure + copy + design)
   shareable improved wireframe

   find-examples  -> market scan / compare / surfaces the design exemplar for create
   research-best-practices -> one section, tiers (feeds either branch)
```

## What this implies for eng (create vs update)

```
CREATE
  skills/outline-page/SKILL.md        create entry + brief producer (sections+order
                                       -> structure.json). Distinct "outline" verb;
                                       owns the "build me a page" entry, chains forward.
  skills/build-page/SKILL.md          terminal assembler (BOTH branches): single-exemplar
                                       design system + assemble structure+copy+design into
                                       a shareable wireframe. Exemplar = a benchmark page
                                       (create) or the user's own page (improve). REUSES
                                       write-page's refIds (no copy re-query). Narrow
                                       triggers so it does not hijack the create entry.

UPDATE
  skills/improve-page/  -> write-page  rename the copy engine; add structure.json as a
                                       recognized brief source; hand off to build-page
                                       in the create chain.
  skills/find-examples/SKILL.md        narrow back to inspiration + compare; route
                                       "build from a structure" to outline-page.
  README.md                            altitude table + the three-layer model + the
                                       3-step create chain.
  VERSIONS.md                          version entry.

VALIDATE
  validate-skills.sh                   must stay green (name=dir, description has no
                                       unquoted ": ", body < 500 lines).
```

## Dry-run results (2026-06-18, live MCP)

Ran the create flow by hand against the live benchmark (Developer Tools): `search_pages`
-> pick sections -> `search_sections` per section -> wrote grounded copy. Findings:

- **Grounding: strong.** `search_sections` returns concrete, copy-ready per-section
  `strengths`. The copy written from them cites real examples by name. This part works.
- **Structure: the benchmark exposes NONE.** `search_pages` and `get_page` return scores
  and prose bullets but no section list and no order. You cannot look up "the winning
  structure." Order must come from elsewhere.
- **Shape: no wireframe.** The flow produces per-section copy, not an assembled page.
- **Rate limiting is real:** hit "too many MCP requests" on the 3rd rapid call. A
  per-section build (8 sections = 8+ calls) will throttle. Cap + space + batch.
- **Thin results happen:** hero search returned `score_floor_relaxed: true`. The build
  flow must degrade gracefully (broaden industry / note it), not assume a full top set.

### Resolved decisions

1. **outline = LIGHT (preamble/thin step), DECIDED.** There is no benchmark structure to
   orchestrate, so "decide sections + order" is not a heavy skill. Source the order from
   the chosen exemplar's section sequence + an archetype default, let the user tweak. Do
   NOT build a heavy `outline-page` skill; make it a thin step in front of write-page.

2. **build-page output = renderable wireframe, DECIDED.** Current output is per-section
   copy, not a page. The single-exemplar design makes a coherent rendered wireframe
   possible, so build-page produces that (the shareable artifact).

3. **The single exemplar does double duty, DECIDED.** The one exemplar homepage (picked
   via `find-examples`) supplies BOTH the structure (its section order) and the design
   (for build-page). `search_sections` supplies per-section copy. Clean handoff = one
   page reference, no re-scan.

### Create flow (final)

```
find-examples (pick ONE exemplar homepage)
   -> outline (LIGHT: adopt its section order, user tweaks)
   -> write-page (per-section copy, grounded via search_sections; cap + space the calls)
   -> build-page (assemble renderable wireframe in the exemplar's design)
```

## Still open before building

- **MCP call budget (weakness #8, now confirmed real).** Decide the cap (~6-7 sections)
  and whether to batch or sequentially space `search_sections` calls. Build this in from
  the start; the live run throttled at 3 rapid calls.
- **Thin-result handling.** Define the fallback when a section returns
  `score_floor_relaxed: true` or too few examples (broaden industry, lower floor, or note
  the gap in the output).
