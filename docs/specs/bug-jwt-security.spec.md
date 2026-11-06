# JWT security fixes

- **Type**: bug · **Project**: api · **Status**: Done
- **Reference**: PRD BR1 · ADD ADR3

## Problem

Tokens were signed with a hardcoded secret, verification accepted any algorithm, the payload was trusted
blindly, the `Bearer` scheme was not enforced and tokens of deleted users still worked.

## Acceptance criteria (EARS)

- [x] THE API SHALL sign and verify tokens with the secret in `JWT_SECRET`.
- [x] IF `JWT_SECRET` is not set THEN THE API SHALL use a random per-process secret and log a warning.
- [x] THE API SHALL accept only HS256 tokens.
- [x] IF the `Authorization` header does not use the `Bearer` scheme THEN THE API SHALL respond 401.
- [x] IF the token payload lacks a valid user id or email THEN THE API SHALL respond 401.
- [x] IF the token refers to a user that does not exist THEN THE API SHALL respond 401.
- [x] IF the token is expired or signed with another secret THEN THE API SHALL respond 401.

## Plan

- [x] `src/utils/jwt.ts`: env secret, `algorithms: ['HS256']`, payload guard.
- [x] `src/middleware/auth.middleware.ts`: `Bearer` check + `userService.getById`.
- [x] README: document `JWT_SECRET`.

## Verification

`tests/users.spec.ts` → "Auth - JWT protection of private endpoints" (forged, `alg: none`, expired,
wrong scheme, deleted user).
