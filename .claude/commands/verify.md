---
description: Verify a spec end to end (tests + browser checks + review) and mark it Done
argument-hint: <docs/specs/<slug>.spec.md>
---

Verify the spec $ARGUMENTS.

1. Use the `tester` subagent: run both suites, map every criterion to evidence, add missing tests, do browser
   checks for UI criteria, stop any server it starts.
2. Use the `reviewer` subagent on `git diff` + the spec.
3. If there is any ❌ or blocker, report it with exact output and stop. Do not mark the spec Done.
4. Otherwise, fill `## Verification` with the traceability table, set status `Done` (spec + BACKLOG + PRD row)
   and check the Definition of Done in `CLAUDE.md`.

Report the table and suggest `/commit`.
