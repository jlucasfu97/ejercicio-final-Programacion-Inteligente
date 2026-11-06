# EARS cheat sheet

Easy Approach to Requirements Syntax: one testable sentence per criterion.

## Rules
- Keywords in UPPERCASE: `WHEN`, `WHILE`, `WHERE`, `IF … THEN`, `THE`, `SHALL`.
- Subject is always `THE <system>`: `THE API`, `THE client`, `THE booking form`, `THE catalogue`.
- Only `SHALL`. Never should / must / will / can / may.
- Concrete values: status codes, messages, limits, routes.

## Patterns

| Pattern | Template | Example |
|---|---|---|
| Ubiquitous | THE <s> SHALL <behaviour> | THE API SHALL accept only HS256 tokens. |
| Event | WHEN <event> THE <s> SHALL <response> | WHEN a booking succeeds THE client SHALL show "Reserva confirmada: N plazas". |
| State | WHILE <state> THE <s> SHALL <behaviour> | WHILE logged out THE detail page SHALL hide the booking form. |
| Optional | WHERE <feature> THE <s> SHALL <behaviour> | WHERE dark mode is preferred THE client SHALL use the dark palette. |
| Unwanted | IF <condition> THEN THE <s> SHALL <response> | IF participants exceed available seats THEN THE API SHALL respond 400. |
| Complex | WHILE <state> WHEN <event> THE <s> SHALL <response> | WHILE logged in WHEN the API answers 401 THE client SHALL log out. |

## Checklist line format
`- [ ] <criterion>` — ticked (`[x]`) only by the tester with evidence.
