---
name: committing-changes
description: Create a Conventional Commit for the current spec after checks pass. Use for /commit.
---

# Committing changes

## Preconditions
- `/verify` passed for the spec (or the change is docs-only).
- Not on `main`: create `feat/<slug>`, `fix/<slug>` or `chore/<slug>` first.
- `git status` reviewed: no `db/*.json` changes from manual testing, no `tests/.db`, `dist/`, reports.

## Message
```text
<type>(<scope>): <imperative summary, ≤ 72 chars>

<why, 1–3 lines>

Spec: docs/specs/<slug>.spec.md
```
Types: `feat`, `fix`, `test`, `docs`, `refactor`, `chore`. Scopes: `api`, `client`, `docs`, `repo`.
A spec touching both projects may be one commit per project.

## Steps
1. `git add` only the files of this spec (list them; never `git add -A` blindly).
2. Commit with the message above. Never `--no-verify`.
3. Do not push or open a PR unless the human asks.
