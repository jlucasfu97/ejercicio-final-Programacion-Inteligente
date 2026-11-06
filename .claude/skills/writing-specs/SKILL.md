---
name: writing-specs
description: Write a feat/bug/chore specification with problem, user stories, solution outline and EARS acceptance criteria in docs/specs/. Use when specifying any change before coding.
---

# Writing specs

## Steps
1. **Inputs**: type (`feat` | `bug` | `chore`), project (`api` | `client` | `api + client`), title. Ask if missing.
2. **PRD**: find the requirement in `docs/PRD.md`. If absent, add a row (status `Draft`).
3. **Problem**: what hurts today, in 2–4 sentences. For bugs, include how to reproduce.
4. **User stories**: up to 3, "As a … I want … so that …". Skip for pure chores.
5. **Solution outline**: simplest approach, split into API / Client / Data. No code.
6. **Acceptance criteria**: up to 9, strict [EARS](EARS.md). Each must be checkable by a test or a browser check.
7. **Slug**: `<type>-<short-name>`, lowercase, hyphens. Example: `feat-available-seats`.
8. **Write** `docs/specs/<slug>.spec.md` using [the template](spec-template.md); leave `## Plan` pending.
9. **Backlog**: add a row to `docs/BACKLOG.md` with status `Draft`.

## Quality bar
- One spec = one deliverable that can be committed alone.
- Exact texts: API `message` values in English, UI texts in Spanish, quoted.
- No "should", "properly", "fast", "user-friendly". Numbers and names instead.
