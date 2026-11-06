# Activity Status Lifecycle Specification

- **Reference**: [PRD](/PRD.md) FR3, TR1, TR3, TR4.
- **Issue**: [F3-activity-status-lifecycle.issue.json](specs/F3-activity-status-lifecycle.issue.json)
- **Status**: Draft

## Problem Description

The system needs to enforce a proper lifecycle for activities, ensuring that activities transition through statuses in a controlled manner: draft → published → confirmed → done or cancelled. Currently, activities can be created or updated with any status without validation of valid transitions. Without lifecycle management, activities could be set to invalid states (e.g., directly from draft to done), which breaks business logic and prevents proper tracking of activity states throughout their lifecycle.

### User Stories

- As an **activity provider**, I want to **transition my activities through valid status states** so that **the system enforces proper activity lifecycle management**.
- As an **activity provider**, I want to **publish my draft activities** so that **users can discover and book them**.
- As a **system**, I want to **prevent invalid status transitions** so that **activities maintain data integrity and follow business rules**.

## Solution Overview

### User/App interface

- `PATCH /activities/:id/status` - Transition activity status (authenticated, owner only)
- Status transitions validated according to lifecycle rules
- JWT token required in `Authorization: Bearer <token>` header
- Returns HTTP 200 with updated activity on success
- Returns HTTP 400 with error message for invalid transitions
- Returns HTTP 403 if user is not the activity owner
- Returns HTTP 401 if user is not authenticated

### Model and logic

- Activity status lifecycle: `draft` → `published` → `confirmed` → `done` OR `cancelled`
- Additional status: `sold-out` (can be set automatically when capacity is reached, but not part of main lifecycle)
- Valid transitions:
  - `draft` → `published` (activity becomes available for booking)
  - `published` → `confirmed` (activity is confirmed to proceed)
  - `published` → `cancelled` (activity is cancelled before confirmation)
  - `confirmed` → `done` (activity completed successfully)
  - `confirmed` → `cancelled` (activity cancelled after confirmation)
  - `published` → `sold-out` (automatic when capacity reached, or manual)
  - `sold-out` → `confirmed` (if capacity becomes available again)
- Invalid transitions return HTTP 400 with descriptive error message
- Only activity owners can transition status (userId validation)
- Status transition updates the `updatedAt` timestamp
- Service layer validates transitions and enforces business rules

### Persistence

- Activity status stored in existing in-memory Map storage
- Status transitions update the activity's status and updatedAt fields
- No additional storage required

## Acceptance Criteria

- [ ] THE [System] SHALL provide a `PATCH /activities/:id/status` endpoint that accepts a status field in the request body
- [ ] WHEN [an authenticated user transitions their own activity to a valid status] THE [System] SHALL update the activity status, set updatedAt timestamp, and return the updated activity with HTTP 200
- [ ] WHEN [an authenticated user attempts to transition to an invalid status (e.g., draft → done)] THE [System] SHALL return HTTP 400 with an error message describing the invalid transition
- [ ] WHEN [an authenticated user attempts to transition another user's activity] THE [System] SHALL return HTTP 403 with error message
- [ ] WHEN [an unauthenticated user attempts to transition an activity status] THE [System] SHALL return HTTP 401 with error message
- [ ] WHEN [a user attempts to transition a non-existent activity] THE [System] SHALL return HTTP 404 with error message
- [ ] THE [System] SHALL allow transition from `draft` to `published`
- [ ] THE [System] SHALL allow transition from `published` to `confirmed`
- [ ] THE [System] SHALL allow transition from `published` to `cancelled`
- [ ] THE [System] SHALL allow transition from `confirmed` to `done`
- [ ] THE [System] SHALL allow transition from `confirmed` to `cancelled`
- [ ] THE [System] SHALL allow transition from `published` to `sold-out`
- [ ] THE [System] SHALL allow transition from `sold-out` to `confirmed`
- [ ] THE [System] SHALL prevent transition from `draft` directly to `confirmed`, `done`, or `cancelled`
- [ ] THE [System] SHALL prevent transition from `published` directly to `done`
- [ ] THE [System] SHALL prevent transition from `done` to any other status
- [ ] THE [System] SHALL prevent transition from `cancelled` to any other status
- [ ] THE [System] SHALL update the `updatedAt` timestamp when status is transitioned
- [ ] THE [System] SHALL validate that the requested status is a valid ActivityStatus type
