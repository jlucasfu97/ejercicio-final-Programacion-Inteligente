---
description: Commit the current spec's changes with a Conventional Commit message
argument-hint: [docs/specs/<slug>.spec.md]
---

Commit following the `committing-changes` skill. Spec: $ARGUMENTS (if empty, infer it from the branch name).

Show `git status` and the proposed file list + message first. Commit after the user confirms. Do not push.
