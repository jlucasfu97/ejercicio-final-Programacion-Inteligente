---
name: creating-issues
description: >
  Creates an issue based on a provided specification or context.
  To be used to create issues for features, bug corrections, or enhancements.
---

# Creating JSON Issues Skill

When asked for creating a JSON issue, follow these steps:

1. **Capture inputs**:
  - Draft the issue title from the specification or context; if unclear, ask.
  - Identify the repo remote URL from Context. 
  - If not, identify it by using local git commands to get the remote URL.
    - Save the remote URL at [AGENTS.md](AGENTS.md) for later use.
   
2. **Create the JSON issue**:
  - Create the issue in the specs folder naming it `<id>.issue.json`.
  - Set the issue title and body based on the provided specification or context.
  - Add a label `bug` or `enhancement` based on the content.
  - Save the created issue URL for reference and the ID for tracking.

3. **Double-link to specification (if applicable)**:
  - If the issue is created based on a specification file:
    - Add the created issue URL back to the file for traceability.
    - Add the JSON issue file url to the created issue body for context. 

## Example

```json
{
  "title": "Feature: Add new user",
  "body": "Add a new user to the system",
  "steps": [
    {
      "title": "Step 1",
      "description": "Description of the step",
      "tasks": [
        {
          "done": false,
          "title": "Task 1",
          "description": "Description of the task"
        }
      ]
    }
  ],
  "labels": ["feature"]
}
```

