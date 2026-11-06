---
description: Add an implementation plan (tasks, owners, criterion→test map) to an approved spec
argument-hint: <docs/specs/<slug>.spec.md>
---

Plan the spec $ARGUMENTS following the `planning-specs` skill.

1. Refuse if the spec status is `Draft`: ask the user to approve it first.
2. Read the code each task touches before writing the task.
3. Write the `## Plan` section, set status `Planned` in the spec and in `docs/BACKLOG.md`.
4. Show the task list and risks. **Stop and ask for approval** before any implementation.
