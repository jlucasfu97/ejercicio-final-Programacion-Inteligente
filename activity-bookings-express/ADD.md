# ActivityBookings Architectural Design Document

A RESTful backend API built with Express.js and TypeScript that manages activity bookings, user authentication, and payment processing through a mock gateway. The system follows a layered architecture pattern with clear separation between HTTP handling, business logic, and data models.

### Table of Contents
- [Stack and tooling](#stack-and-tooling)
- [Systems Architecture](#systems-architecture)
- [Software Architecture](#software-architecture)
- [Data storage and seed data](#data-storage-and-seed-data)
- [Architecture Decisions Record (ADR)](#architecture-decisions-record-adr)

## Stack and tooling

### Technology Stack
- **Runtime**: Node.js
- **Language**: TypeScript (strict mode)
- **Framework**: Express.js
- **Authentication**: JWT (JSON Web Tokens)
- **Data Storage**: JSON file-system store at `/db` (project root), with seed data for activities
- **Validation**: Custom validation in service layer
- **Logging**: Custom logger utility
- **Development**: tsx for TypeScript execution
- **Build Tool**: TypeScript compiler (tsc)

### Development Tools
- **Package Manager**: npm
- **Type Checking**: TypeScript compiler (`tsc`)
- **Development Server**: tsx (TypeScript execution)
- **Scripts**:
  - `dev`: Run development server with hot reload
  - `build`: Compile TypeScript to JavaScript
  - `start`: Run production build
  - `typecheck`: Type checking only
- **Environment**: Windows with Git Bash terminal
- **Version Control**: Git (default branch: master)

## Systems Architecture

The ActivityBookings API is a monolithic backend service that exposes RESTful endpoints for activity and booking management. The system handles user authentication, activity lifecycle management, booking creation with capacity validation, and payment processing.

### Main Components

1. **HTTP Layer (Routes)**: Express.js routers that handle HTTP requests, extract request data, validate input, and return appropriate responses
2. **Business Logic Layer (Services)**: Domain services that implement business rules, validation, and orchestrate operations
3. **Domain Models (Types)**: TypeScript type definitions representing domain entities (User, Activity, Booking)
4. **Authentication Middleware**: JWT token validation middleware protecting authenticated routes
5. **Payment Gateway Adapter**: Mock payment gateway integration for processing payments

### Component Interactions

```
Client Request
    ↓
Express App (index.ts)
    ↓
Authentication Middleware (JWT validation)
    ↓
Route Handler (routes/*.ts)
    ↓
Service Layer (services/*.ts)
    ↓
Domain Models (types/*.ts)
    ↓
Response
```

### Architecture Diagram (C4 Model - Level 1: System Context)

```
┌─────────────┐
│   Client    │
│  (Frontend) │
└──────┬──────┘
       │ HTTP/REST
       │
┌──────▼──────────────────────────────┐
│   ActivityBookings API               │
│  ┌────────────────────────────────┐  │
│  │  Authentication (JWT)          │  │
│  │  Activity Management           │  │
│  │  Booking Management            │  │
│  │  Payment Processing (Mock)     │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

## Software Architecture

### Layered Architecture Pattern

The application follows a three-layer architecture with clear separation of concerns:

```
┌─────────────────────────────────┐
│   Routes Layer (HTTP)           │  ← Request/Response handling
│   - Request validation          │
│   - Status code management      │
│   - Error formatting            │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│   Services Layer (Business)     │  ← Business logic
│   - Domain rules                │
│   - Validation                  │
│   - Orchestration               │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│   Types Layer (Domain Models)   │  ← Data structures
│   - Entity definitions          │
│   - DTOs                        │
│   - Type guards                 │
└─────────────────────────────────┘
```

### Project Structure

```
├── db/                          # JSON file-system store (TR6)
│   ├── seed/                    # Seed (sample) data loaded on init
│   │   └── activities.json      # Predefined activities for dev/demos
│   ├── activities.json          # Persistent activity data (when TR6 implemented)
│   ├── bookings.json            # Persistent booking data (when TR6 implemented)
│   ├── users.json               # Persistent user data (when TR6 implemented)
│   └── payments.json            # Persistent payment data (when TR6 implemented)
└── src/
│   ├── index.ts                 # Express app setup, middleware, route registration
│   ├── routes/                  # HTTP layer - one file per resource
│   │   ├── auth.ts              # Authentication routes (register, login)
│   │   ├── activities.ts        # Activity CRUD operations
│   │   └── bookings.ts          # Booking operations
│   ├── services/                # Business logic - one service per domain
│   │   ├── auth.service.ts      # Authentication and JWT token management
│   │   ├── activity.service.ts  # Activity business logic and lifecycle
│   │   ├── booking.service.ts   # Booking creation with capacity validation
│   │   └── payment.service.ts   # Payment processing (mock gateway)
│   ├── middleware/              # Express middleware
│   │   └── auth.middleware.ts   # JWT token validation
│   ├── types/                   # Type definitions - one file per domain
│   │   ├── user.ts              # User entity and DTOs
│   │   ├── activity.ts          # Activity entity and DTOs
│   │   ├── booking.ts           # Booking entity and DTOs
│   │   └── payment.ts           # Payment-related types
│   ├── repositories/            # Data access layer
│   │   ├── base.repository.ts   # Repository interface
│   │   └── json.repository.ts   # JSON file-based implementation
│   └── utils/                   # Shared utilities
│       ├── logger.ts            # Logging utility
│       ├── file-storage.ts       # File I/O utilities
│       └── data-loader.ts       # Startup data loading
```

### Design Patterns

- **Layered Architecture**: Separation of HTTP, business logic, and data layers
- **Service Pattern**: Business logic encapsulated in service classes
- **Repository Pattern**: Data access abstraction (in-memory Map-based initially; JSON file-system at `/db` per TR6)
- **Middleware Pattern**: JWT authentication as Express middleware
- **Adapter Pattern**: Mock payment gateway adapter for external integration
- **Null Object Pattern**: NULL_* constants for safe defaults (from client types)

### Data Flow

1. **Authentication Flow**:
   - User registers/logs in → Service validates credentials → JWT token generated → Token returned to client

2. **Activity Management Flow**:
   - Authenticated request → Route extracts data → Service validates and processes → Activity created/updated → Response returned

3. **Booking Flow**:
   - Authenticated request → Route extracts booking data → Service validates capacity → Payment processed → Booking created → Response returned

### Error Handling

All API error responses follow a standardized format to ensure consistency across endpoints:

```typescript
interface ErrorResponse {
  message: string;        // Summary of the error
  errors: ValidationError[];  // Array of field-specific validation errors
}

interface ValidationError {
  field: string;          // Field name (for validation errors)
  message: string;        // Field-specific error message
}
```

**Error Response Rules**:
- All error responses use the `ErrorResponse` format with `message` and `errors` fields
- For validation errors: `message` provides a summary (e.g., "Validation failed"), `errors` contains field-specific details
- For non-validation errors: `message` describes the error, `errors` is an empty array
- HTTP status codes indicate error categories:
  - `400`: Bad Request (validation errors, invalid input)
  - `401`: Unauthorized (authentication required or failed)
  - `403`: Forbidden (authorization failure)
  - `404`: Not Found (resource doesn't exist)
  - `402`: Payment Required (payment processing failure)
  - `500`: Internal Server Error (unexpected server errors)

**Implementation**:
- Error types are defined in `src/types/error.ts`
- Routes construct `ErrorResponse` objects before sending error responses
- Services return validation errors as arrays of `ValidationError` objects
- Middleware (e.g., authentication) uses the same error format

### Data Storage and Seed Data (TR6)

Persistence uses a JSON file-system store under `/db` at project root:

- **Location**: `db/` folder. Entity files: `activities.json`, `bookings.json`, `users.json`, `payments.json`.
- **Seed data**: `db/seed/activities.json` holds sample activities. On startup, the app loads seed data (at least activities) so there are predefined activities for development, demos, and tests. Seed files are read-only; runtime writes go to the entity files in `db/`.
- **Load strategy**: Read JSON on startup; optionally merge or replace in-memory state from seed. Services continue to use repository-style access; the store implementation hides whether data comes from memory, seed, or persisted JSON.
- **Write strategy**: On create/update/delete, persist changes to the corresponding `db/*.json` file. Use atomic write patterns (e.g. write to temp then rename) to avoid corruption.

The system uses a repository pattern with `JsonRepository` implementation that provides file-based persistence while maintaining in-memory Maps for fast access during runtime.

## Architecture Decisions Record (ADR)

### ADR 1: Layered Architecture Pattern
- **Decision**: Adopt a three-layer architecture (Routes → Services → Types) instead of MVC or hexagonal architecture
- **Status**: Accepted
- **Context**: The project requires clear separation between HTTP handling and business logic. The layered approach simplifies testing, maintenance, and aligns with Express.js patterns. The team has existing skills in this pattern.
- **Consequences**: 
  - Clear separation of concerns improves maintainability
  - Services can be tested independently of HTTP layer
  - Easy to swap data storage implementation later
  - Slight overhead in request/response transformation

### ADR 2: In-Memory Data Storage (Initial)
- **Decision**: Use in-memory Map-based storage for initial implementation instead of a database
- **Status**: Accepted
- **Context**: This is a training/demo project. In-memory storage simplifies setup, eliminates database dependencies, and allows focus on business logic and API design. Data persistence is not a requirement for the initial scope.
- **Consequences**:
  - No database setup required, faster development
  - Data lost on server restart (acceptable for demo)
  - Easy migration to database later by replacing service implementations
  - Not suitable for production without persistence layer

### ADR 3: JWT-based Authentication
- **Decision**: Use JWT tokens for authentication instead of session-based or OAuth
- **Status**: Accepted
- **Context**: JWT provides stateless authentication suitable for REST APIs. Simple to implement, no server-side session storage needed, and tokens can be validated without database lookups.
- **Consequences**:
  - Stateless authentication scales well
  - Tokens can be validated without database queries
  - Token revocation requires additional mechanism (not in initial scope)
  - Tokens must be stored securely on client side

### ADR 4: Mock Payment Gateway
- **Decision**: Integrate with a mock payment gateway instead of real payment providers
- **Status**: Accepted
- **Context**: Real payment integration requires merchant accounts, compliance, and complex error handling. Mock gateway allows testing payment flows without external dependencies and costs.
- **Consequences**:
  - No real payment processing costs during development
  - Payment flows can be tested without external services
  - Easy to simulate success/failure scenarios
  - Must be replaced with real gateway for production use

### ADR 5: TypeScript with Strict Typing
- **Decision**: Use TypeScript with strict mode and avoid `any` types
- **Status**: Accepted
- **Context**: TypeScript provides type safety, better IDE support, and catches errors at compile time. Strict mode enforces best practices and prevents common pitfalls.
- **Consequences**:
  - Compile-time type checking reduces runtime errors
  - Better developer experience with autocomplete and refactoring
  - Requires type definitions for all data structures
  - Slightly longer compilation time

### ADR 6: JSON File-System Store at `/db` with Seed Data
- **Decision**: Use JSON files in a `/db` folder at project root as the persistence layer, with seed (sample) data for activities so the app starts with predefined activities.
- **Status**: Implemented
- **Context**: PRD TR6. Need simple, dependency-free persistence for dev/demos. File-system JSON avoids a DB setup while enabling persistence across restarts. Seed data ensures activities exist out of the box for booking flows and E2E tests.
- **Consequences**:
  - No database dependency; `db/` is versionable and portable
  - Seed data in `db/seed/` provides consistent baseline for development and testing
  - Single-writer workload; not suitable for concurrent multi-process writes
  - Atomic writes (temp + rename) recommended to avoid partial writes
  - Migration path: introduce a repository layer that reads/writes JSON; swap from in-memory to file-based implementation
