# AstroBookings — Project memory for Claude

Monorepo for the course exercise: a client for the AstroBookings API plus a fixed copy of that API.
Work is **spec-driven**: no code without a spec, no spec without acceptance criteria, nothing "done" without passing tests.

## Map

| Path | What | Own instructions |
|---|---|---|
| `activity-bookings-express/` | REST API (Express 4, TypeScript strict, JWT, JSON store) | `activity-bookings-express/CLAUDE.md` |
| `astrobookings-client/` | Web client (Angular 22, zoneless, signals, Signal Forms) | `astrobookings-client/CLAUDE.md` |
| `docs/PRD.md` | Client product requirements (what and why) | — |
| `docs/ADD.md` | System architecture + ADRs (how) | — |
| `docs/BACKLOG.md` | Every spec and its status | — |
| `docs/specs/` | One spec per unit of work (`feat-`, `bug-`, `chore-`) | — |
| `docs/AI-DRIVEN-DEVELOPMENT.md` | Human guide to this workflow (Spanish) | — |
| `astrobookings-cli.briefing.md` | Original exercise briefing. Read-only | — |

The original backend lives outside this repo (`../activity-bookings-express`). **Never modify it.**

## Workflow (one spec at a time)

1. `/analyze <topic>` — understand the code/problem. Output: findings, no edits.
2. `/spec <request>` — write `docs/specs/<type>-<slug>.spec.md` with EARS criteria; add it to `docs/BACKLOG.md`.
3. `/plan <spec>` — append an implementation plan (tasks + tests per criterion) to the spec.
4. `/implement <spec>` — code the plan task by task, tests alongside.
5. `/verify <spec>` — run all checks, tick acceptance criteria, mark spec `Done`.
6. `/commit` — conventional commit referencing the spec.

`/feature <request>` chains 2–6 and stops for human approval after the spec and after the plan.

Subagents in `.claude/agents/` own each role (analyst, architect, spec-writer, backend-developer,
frontend-developer, tester, reviewer). Skills in `.claude/skills/` hold the reusable how-to.

## Ground rules

- Read the spec before touching code. If the request is not covered by a spec, write one first.
- Smallest change that satisfies the criteria. No speculative features, no drive-by refactors.
- The API contract is the backend code + its Playwright tests. If the client needs something the API lacks,
  write a backend spec; do not fake it in the client.
- A change in one project that affects the other (status codes, error messages, payloads) must update both
  sides and both test suites in the same spec.
- Never edit `db/*.json` by hand in a commit; tests use an isolated DB (`DB_DIR`).
- Code, specs and commit messages in English. Chat answers in the user's language. The client UI is in Spanish.
- Environment: Windows + Git Bash. Ports: API `3000`, client `4200` (use `4300` if busy), API tests `3100`.
  Stop servers you start; on Windows kill the process tree (`taskkill /PID <pid> /T /F`), never all `node.exe`.

## Definition of done

- [ ] Every EARS criterion in the spec is ticked and covered by at least one test.
- [ ] Backend: `npm run typecheck && npm test` green (in `activity-bookings-express/`).
- [ ] Client: `npm run build && npm test -- --watch=false` green (in `astrobookings-client/`).
- [ ] README / CHANGELOG / `docs/ADD.md` updated when behaviour or architecture changed.
- [ ] Spec status `Done` and `docs/BACKLOG.md` updated.

## Naming

| Spec | Branch | Commit |
|---|---|---|
| `feat-<slug>` | `feat/<slug>` | `feat(<scope>):` |
| `bug-<slug>` | `fix/<slug>` | `fix(<scope>):` |
| `chore-<slug>` | `chore/<slug>` | `chore(<scope>):` / `test(<scope>):` |

Scopes: `api`, `client`, `docs`, `repo`. Default branch: `main`.
