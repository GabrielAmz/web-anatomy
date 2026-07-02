---
name: webanatomy-setup
description: |
  The foundation step for the whole Web Anatomy pack. Optional context setup. Use when the user says set up Web Anatomy, create context, start a landing page project, capture product context, benchmark my category, or prepare the benchmark skills. Also offer it as an optional preflight when another Web Anatomy workflow lacks product context and better recommendations would depend on ICP, industry, locale, competitors, conversion goal, proof assets, priority pages, or the voice and tone the rework copy should use. Do not require setup before find-examples, research-best-practices, write-page, or audit-page; those skills should continue with conservative assumptions if the user wants speed. Writes `.agents/webanatomy-context.md` as shared context.
metadata:
  version: 0.4.1
---

# Web Anatomy Setup

You are the optional context loader for Web Anatomy. Your job is to capture enough product and market truth that benchmark-backed skills can retrieve better examples and avoid generic CRO advice.

This setup improves recommendation quality, but it is never mandatory. If the user wants a quick audit, examples, or benchmark comparison, let the relevant skill continue from the URL, screenshot, pasted copy, or available context.

This is the **Foundation** the four altitudes (page, audit, section, fix) build on. The more product and market truth it captures, the sharper every downstream skill.

## Step 0 - Check For Updates (best-effort, non-blocking)

Skill packs do not auto-update: a user who installed a while ago is running an old copy until they re-install. Since setup is the natural entry point, do a quick version check here. Keep it best-effort, never block setup on it.

1. Read the installed pack version from `references/pack-version.txt` (resolve relative to this `SKILL.md`).
2. Fetch the latest published version from GitHub: the `tag_name` from `https://api.github.com/repos/GabrielAmz/web-anatomy/releases/latest` (or read the tag at `https://github.com/GabrielAmz/web-anatomy/releases/latest`). Strip a leading `v`.
3. Compare as semver. If the published version is newer than the installed one, tell the user once:

   > Your Web Anatomy skills are v{installed}; v{latest} is out. Update with `npx skills update GabrielAmz/web-anatomy` (or re-run `npx skills add`), then restart your agent so it reloads the skills.

4. If the fetch fails, the network is unavailable, or the versions match, say nothing and continue. Never error, never block. Do this check at most once per setup run.

## Step 1 - Check Existing Context

Look for `.agents/webanatomy-context.md`.

If it exists, read it and summarize:

```markdown
Found Web Anatomy context:
- Product: ...
- ICP: ...
- Industry: ...
- Locale: ...
- Conversion goal: ...
- Priority pages: ...
- Voice and tone: ...

Still accurate, or should we update it?
```

If the user confirms it is accurate, stop. If they want changes, ask only about the changed fields.

If the user provides a URL, fetch or browse it before asking the setup questions. Use the page's hero, meta title, services, nav labels, customer language, and footer to prefill product, industry, competitors, conversion goal, and proof assets where possible.

## Step 2 - Ask The Setup Questions

Ask one question at a time. Do not batch.

1. **Product** - What does the product do, in one concrete sentence?
2. **ICP** - Who buys it? Capture industry, company size, and buyer role.
3. **Industry** - Which benchmark category should examples come from first? Examples: SaaS, AI, Fintech, DevTools, Healthcare, Ecommerce.
4. **Competitors** - Which 3-8 competitors or adjacent best-in-class companies should we compare against?
5. **Conversion goal** - What is the primary page goal? Examples: book a demo, start a trial, join waitlist, contact sales.
6. **Priority pages** - Which page types matter first? Examples: homepage, pricing, persona page, feature page, comparator, use case.
7. **Proof assets** - What proof exists today? Examples: named customers, logos, quotes, metrics, security badges, case studies.
8. **Tech stack** - What runs the site? Framework, CMS, hosting, and analytics if known.
9. **Locale** - What language is the site in, `en` or `fr`? This decides which benchmark locale to search and which language the rework copy is written in. Infer from the URL or copy if the user does not say.
10. **Voice and tone** - How should copy sound? Capture 2-4 words (for example "direct, technical, no hype" or "warm, plain, reassuring") and one line to avoid (for example "no buzzwords, no exclamation marks"). This is the one field that shapes the copy the grounded skills write, so it is worth getting. Leave blank only if the user truly has no preference.
11. **Constraints** - Anything off-limits in the output? Competitors not to name, claims that are not allowed (regulated industries), sensitive topics to avoid.
12. **Page access** - How can I see your page when we work on it? Codebase, a live URL, I browse it, or screenshots only. This sets how reliably the downstream skills can capture the current page.
13. **Benchmark MCP** - Is the Web Anatomy MCP connected? It supplies the live benchmark examples the grounded skills use. If unknown, I can check, or point you to https://docs.webanatomy.ai/quickstart to connect.

Push back once on vague answers. "AI platform for teams" is not enough. "AI analyst that turns customer calls into churn-risk alerts for B2B SaaS CS leaders" is enough.

If the user does not know the industry, infer one from the product and save it anyway. Do not leave industry blank. Use `SaaS` for software/product pages when no better category is available, otherwise use `B2B`.

Do not infer industry from the domain name alone. If a page sells services as an agency, studio, consultancy, collective, broker, or done-for-you provider, save `Agency` as the primary industry and put the served vertical in Benchmark notes.

## Step 3 - Write The Context File

Create `.agents/webanatomy-context.md` with this exact shape:

```markdown
# Web Anatomy context

- **Product**: ...
- **ICP**: ...
- **Industry**: ...
- **Locale**: en | fr
- **Competitors**: ...
- **Conversion goal**: ...
- **Priority pages**: ...
- **Proof assets**: ...
- **Voice and tone**: ... (and one line to avoid)
- **Constraints**: ... (off-limits competitors, claims, topics; "none" if so)
- **Tech stack**: ...
- **Page access**: codebase | live URL | browse | screenshots only
- **MCP**: connected | not connected | unknown
- **Benchmark notes**: ...
- **Confidence and gaps**: which fields are confirmed vs inferred, and what is still unknown

_Last updated: YYYY-MM-DD_
```

The other skills read this file as the source of truth: `Locale` and `Voice and
tone` drive the language and style of the copy they write (see
`references/house-style.md`), `Constraints` keep that output inside the user's
guardrails, and `Confidence and gaps` keeps inferred fields honest rather than
presented as fact.

## Step 4 - Confirm The Next Move

Tell the user the context was saved and suggest the most relevant next skill, by altitude:

- `persona` to deepen the ICP into a sourced reader model: ranked objections, vocabulary, competitor claims (Foundation, like this skill). The context file names who the reader is; the persona captures what stops them from buying.
- `find-examples` for the market view: the best pages in your category and how yours compares (Page altitude)
- `audit-page` to diagnose your current page and get a prioritized fix list (Audit altitude)
- `research-best-practices` for a tiered improvement ladder on one section (Section altitude)
- `write-page` to turn any of those into the grounded rework, or to build a new page (Fix altitude)

## Guardrails

- Do not invent competitors, customer names, or proof assets.
- Do not turn this into a positioning document. Capture facts.
- Do not expose internal benchmark scoring concepts.
- Keep this setup skill short and decisive.
