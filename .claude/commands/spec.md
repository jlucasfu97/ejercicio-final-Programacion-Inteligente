---
description: Write a spec (feat/bug/chore) with EARS acceptance criteria in docs/specs/
argument-hint: <what to build or fix>
---

Use the `spec-writer` subagent to specify: $ARGUMENTS

If the request changes the API contract or touches both projects, then also ask the `architect` subagent to
add a `## Design` section to the new spec.

Show the user the spec path, the acceptance criteria and any open question. **Stop and ask for approval.**
On approval, set the spec and its `docs/BACKLOG.md` row to `Approved`.
