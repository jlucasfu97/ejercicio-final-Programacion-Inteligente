# JSON File-System Store Specification

- **Reference**: [PRD](/PRD.md) TR6, [ADD](/ADD.md) ADR6.
- **Issue**: [TR6-json-file-system-store.issue.json](specs/TR6-json-file-system-store.issue.json)
- **Status**: Draft

## Problem Description

The system currently uses in-memory Map-based storage, which means all data is lost when the server restarts. This is acceptable for initial development but limits the system's usefulness for demos, testing, and development workflows. The system needs persistent storage that survives server restarts while remaining simple and dependency-free. Additionally, the system should start with predefined seed data (especially activities) to enable immediate testing and demos without manual setup.

### User Stories

- As a **developer**, I want **data to persist across server restarts** so that **I don't lose test data and can resume development sessions**.
- As a **tester**, I want **the system to start with predefined activities** so that **I can immediately test booking flows without manual setup**.
- As a **demo presenter**, I want **consistent seed data on every startup** so that **I can demonstrate the system with realistic examples**.

## Solution Overview

### User/App interface

- No new API endpoints required; existing endpoints continue to work
- Data persistence happens transparently in the service layer
- Application startup loads seed data from `db/seed/` directory
- All create/update/delete operations persist to JSON files in `db/` directory

### Model and logic

- Create a repository/data access layer that abstracts storage operations
- Services continue to use the same interface; storage implementation is hidden
- On application startup:
  - Load seed data from `db/seed/activities.json` (and other seed files if present)
  - Load persisted data from `db/activities.json`, `db/bookings.json`, `db/users.json`, `db/payments.json`
  - Merge seed data with persisted data (seed data provides defaults, persisted data takes precedence)
- On create/update/delete operations:
  - Write changes to corresponding JSON file in `db/` directory
  - Use atomic write pattern (write to temp file, then rename) to avoid corruption
  - Maintain in-memory state for fast reads
- Entity files store arrays of entities (e.g., `activities.json` contains `Activity[]`)
- Seed files are read-only; runtime writes only go to entity files in `db/`

### Persistence

- **Location**: `db/` folder at project root
- **Entity files**: 
  - `db/activities.json` - Array of Activity entities
  - `db/bookings.json` - Array of Booking entities
  - `db/users.json` - Array of User entities
  - `db/payments.json` - Array of Payment entities
- **Seed data**: 
  - `db/seed/activities.json` - Predefined activities loaded on startup
  - Additional seed files can be added for other entities if needed
- **Load strategy**: 
  - Read seed files on startup and merge with persisted entity files
  - Seed data provides baseline; persisted data overrides seed data
  - Load into in-memory Maps for fast access during runtime
- **Write strategy**: 
  - On create/update/delete, serialize in-memory Maps to JSON arrays
  - Write to temporary file first, then atomically rename to target file
  - Handle file I/O errors gracefully with logging

## Acceptance Criteria

- [ ] THE [System] SHALL create a `db/` directory at project root if it does not exist
- [ ] THE [System] SHALL create a `db/seed/` directory if it does not exist
- [ ] THE [System] SHALL provide a seed data file `db/seed/activities.json` with at least 3 predefined activities
- [ ] WHEN [the application starts] THE [System] SHALL load seed data from `db/seed/activities.json` if it exists
- [ ] WHEN [the application starts] THE [System] SHALL load persisted data from `db/activities.json`, `db/bookings.json`, `db/users.json`, and `db/payments.json` if they exist
- [ ] WHEN [loading data on startup] THE [System] SHALL merge seed data with persisted data, with persisted data taking precedence over seed data
- [ ] WHEN [an activity is created, updated, or deleted] THE [System] SHALL persist the change to `db/activities.json`
- [ ] WHEN [a booking is created, updated, or deleted] THE [System] SHALL persist the change to `db/bookings.json`
- [ ] WHEN [a user is created, updated, or deleted] THE [System] SHALL persist the change to `db/users.json`
- [ ] WHEN [a payment is created, updated, or deleted] THE [System] SHALL persist the change to `db/payments.json`
- [ ] WHEN [persisting data to JSON files] THE [System] SHALL use atomic write pattern (write to temp file, then rename) to avoid corruption
- [ ] WHEN [a JSON file write fails] THE [System] SHALL log the error and continue operation (data remains in memory)
- [ ] THE [System] SHALL maintain backward compatibility with existing service interfaces
- [ ] WHEN [the application restarts] THE [System] SHALL restore all persisted data from JSON files
- [ ] THE [System] SHALL ensure seed files in `db/seed/` are never modified by runtime operations
