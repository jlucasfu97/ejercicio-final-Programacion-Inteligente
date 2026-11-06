---
description: Implement the plan of a spec, delegating backend and frontend tasks to their developer agents
argument-hint: <docs/specs/<slug>.spec.md>
---

Implement the spec $ARGUMENTS.

1. Read the spec. It must be `Planned` or `In progress`; set it to `In progress` (spec + BACKLOG).
2. Create the branch if on `main` (`feat/<slug>`, `fix/<slug>`, `chore/<slug>`).
3. Run backend tasks with the `backend-developer` subagent first. Pass it the spec path and the task IDs.
4. Then run frontend tasks with the `frontend-developer` subagent, passing any contract change the backend reported.
5. Do docs tasks yourself (README, CHANGELOG, `docs/ADD.md`).
6. If a task cannot be done as planned, stop and explain; do not improvise scope.

Report tasks done, files changed and test results. Suggest `/verify $ARGUMENTS` next.
