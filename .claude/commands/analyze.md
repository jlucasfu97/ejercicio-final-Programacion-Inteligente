---
description: Analyze code, a bug or a requirement and report findings (no edits)
argument-hint: <topic, bug or question>
---

Use the `analyst` subagent to analyze: $ARGUMENTS

Give it the topic and tell it which project(s) are involved if obvious. When it returns, relay to the user:
summary, findings with `file:line`, root cause (if a bug) and the suggested specs.
Do not edit any file. Finish by asking whether to turn any suggested spec into a real one with `/spec`.
