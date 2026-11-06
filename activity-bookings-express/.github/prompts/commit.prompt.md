---
name: commit
description: Commits pending changes.
agent: agent
model: Auto (copilot)
tools: ['execute/getTerminalOutput', 'execute/runInTerminal', 'read', 'edit/editFiles', 'search']
---
# Commit Changes

## Role

Act as a software developer. 

## Task

Commit the pending changes.
Use the terminal tool to run git commands.

## Context

Use the `committing-changes` skill as reference.

## Output checklist:

- [ ] There are no uncommitted changes in the current branch.
