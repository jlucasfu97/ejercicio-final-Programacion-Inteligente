---
description: Full AI-driven cycle for one change - spec, plan, implement, verify, commit - with human checkpoints
argument-hint: <what to build or fix>
---

Run the whole workflow for: $ARGUMENTS

1. **Spec**: as `/spec`. ⏸ Wait for the user's approval.
2. **Plan**: as `/plan` on the new spec. ⏸ Wait for the user's approval.
3. **Implement**: as `/implement`.
4. **Verify**: as `/verify`. If anything fails, fix within the plan's scope and verify again (max 2 rounds,
   then stop and report).
5. **Commit**: as `/commit`. ⏸ Wait for confirmation of the message.

Never skip a checkpoint. At the end, give a short summary: spec, commits, tests, anything left in the backlog.
