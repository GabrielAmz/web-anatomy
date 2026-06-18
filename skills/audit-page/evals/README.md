# audit-page evals

Test prompts and assertions for the `audit-page` skill, in the schema the
Anthropic skill-creator harness expects (`evals.json` with `skill_name` + `evals`,
each eval carrying `prompt`, `expected_output`, `files`, and `assertions`).

## What these check

The audit has two tracks. The **score** is mechanical (a fixed rubric and
formula), and the **handoff** (`audit.json`) has a fixed schema, so both are
objectively gradeable. The assertions here target only those verifiable parts:

- the handoff is written and valid, with the right `schema` string,
- the score and the six-category scorecard are present and in range,
- the priority gradient holds (at most one or two P0s),
- `startHere` matches a real recommendation section,
- section tags come from the taxonomy,
- the output leaks no internal item IDs, weights, or thresholds, and contains no
  copy rewrites,
- the run hands off to write-page.

The **recommendations themselves are subjective** (is this the highest-leverage
fix?). Judge those qualitatively in the skill-creator review viewer, not with
assertions. Forcing assertions onto judgment calls produces non-discriminating
checks that pass regardless of quality.

## How to run

These are run by the Anthropic skill-creator skill, which lives in its own repo
and owns the runner, grader, and benchmark viewer. Point it at this skill and this
eval set; it spawns with-skill and baseline (no-skill) runs, grades the
assertions, and opens a review viewer. This repo does not vendor that harness.

`passed` is `null` until a run grades it; the grader fills `passed` (true/false)
and `evidence`.
