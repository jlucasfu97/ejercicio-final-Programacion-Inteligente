# Agents Instructions

## Product Overview
- ActivityBookings is a backend API for managing activity bookings.
- Users register and authenticate to book activities with capacity constraints.
- Activities have lifecycle statuses: draft → published → confirmed → done/cancelled.
- Bookings trigger automatic payment processing through a mock gateway.
- System prevents overbooking by validating available seats.

## Technical Implementation

### Tech Stack
- **Language**: TypeScript (strict mode)
- **Framework**: Express.js
- **Database**: JSON file-system store at `/db` with seed data (TR6 implemented)
- **Security**: JWT tokens for authentication
- **Testing**: Playwright for E2E tests
- **Logging**: Custom logger utility

### Development workflow

```bash
# Set up the project
npm install

# Build/Compile the project
npm run build

# Run the project
npm run dev          # Development mode
npm run start        # Production mode

# Test the project
npm test             # E2E API tests with Playwright (starts its own server on :3100 over an isolated copy in tests/.db)

# Type-check only
npm run typecheck
```

### Folder structure
```text
.                         # Project root  
├── db/                   # JSON file-system store: entity files + db/seed/
├── src/                  # Source code
│   ├── index.ts          # Express app entry point
│   ├── routes/           # HTTP layer (Express routers)
│   ├── services/         # Business logic layer
│   ├── middleware/       # Express middleware (auth, etc.)
│   ├── types/            # TypeScript type definitions
│   ├── repositories/      # Data access layer (JSON file-based)
│   └── utils/            # Shared utilities
├── client/               # Client type definitions (shared)
├── tests/                # E2E tests (Playwright)
├── specs/                # Acceptance criteria specifications
├── AGENTS.md             # This file
├── ADD.md                # Architectural Design Document
└── PRD.md                # Product Requirements Document
```

## Environment
- Code and documentation must be in English.
- Chat responses must be in the language of the user prompt.
- Sacrifice grammar for conciseness when needed to fit response limits.
- This is a windows environment using git bash terminal.
- Mind the available **agent skills** when performing tasks.
- When using templates, ensure to replace {placeholders} with actual values.
- Follow layered architecture: Routes → Services → Types.
- Use client types from `client/` folder for API contracts.
- Implement JWT authentication middleware for protected routes.
- For TR6: persist via JSON in `db/`; load activity seed data from `db/seed/`.
- Validate all inputs in service layer before processing.
- Return appropriate HTTP status codes (200, 201, 400, 404, 204).

### Naming Conventions

Use slugs with hyphens for any identifiers or non code file names.

Use this table to determine the prefixes :

| Spec        | GitHub Label  | Git Branch    | Commit  |
|-------------|---------------|---------------|---------|
| feat-<slug> | enhancement   | feat/<slug>   | feat:   |
| bug-<slug>  | bug           | fix/<slug>    | fix:    |
| chore-<slug>| chore         | chore/<slug>  | chore:  |

Default git branch is `master` unless specified otherwise.
