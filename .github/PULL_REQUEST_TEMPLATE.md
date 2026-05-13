## What kind of contribution?

- [ ] New skill
- [ ] Update to existing skill
- [ ] Docs / README
- [ ] Bug fix in validate-skills.sh or tooling

## If new skill, the 5-step checklist

- [ ] Slug is `wa-<verb>-<noun>` (e.g., `wa-pricing-revamp`) or `play-<strategy-slug>` for strategic plays
- [ ] Directory name exactly matches the `name:` field in `SKILL.md` front matter
- [ ] `description:` is 200-400 words, dense with trigger phrases the user would actually type, ending with cross-references to related skills
- [ ] Body is under ~5000 tokens / 500 lines — push detail into `references/`
- [ ] Loads `wa-page-context` at Step 1 (every Web Anatomy skill that touches a page should)
- [ ] Includes at least one **Reference pattern** — a real company doing this well, with a teardown link or URL

## What does this skill do?

A 2-3 sentence summary of the intent. What does the user say to invoke it? What does it produce?

## Test plan

- [ ] Ran `./validate-skills.sh` — passes
- [ ] Manually invoked from Claude Code on a real project — produces sensible output
- [ ] Cross-references to related skills are valid (no dead links to skills that don't exist)
