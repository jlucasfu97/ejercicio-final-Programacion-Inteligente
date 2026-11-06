---
name: planning-specs
description: Turn an approved spec into an ordered task list with files, owner (backend/frontend) and the test that proves each acceptance criterion. Use for /plan.
---

# Planning specs

## Steps
1. Read the spec, `docs/ADD.md` and the `CLAUDE.md` of each affected project. Read the code you will touch.
2. If the API contract changes and there is no `## Design` section, ask the `architect` agent first.
3. Order tasks: **API contract → API tests → API code → client model/service → client UI → docs**.
   The client never goes before the API it depends on.
4. Each task: one verifiable step, ≤ ~1 hour, with files and owner.
5. Map every criterion to at least one test.
6. Write the plan into the spec's `## Plan` section and set status `Planned` (spec + BACKLOG).

## Plan format

```markdown
## Plan

### Tasks
- [ ] T1 · backend · `src/services/activity.service.ts` — compute `availableSeats` on read
- [ ] T2 · backend · `tests/activities.spec.ts` — field present, decreases after booking, ignored on write
- [ ] T3 · frontend · `core/models.ts`, `features/activities/*` — show seats, cap form max
- [ ] T4 · docs · README, CHANGELOG, `docs/ADD.md` contract table

### Criterion → test
| # | Criterion (short) | Test |
|---|---|---|
| 1 | field in GET responses | `activities.spec.ts` › "includes availableSeats" |
| 5 | form max = availableSeats | browser check |

### Risks
- {what could break, how to detect it}
```
