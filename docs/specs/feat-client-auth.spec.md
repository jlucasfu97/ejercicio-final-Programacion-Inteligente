# Client authentication: register, login, session

- **Type**: feat · **Project**: client · **Status**: Done
- **Reference**: PRD FR3, FR4, TR3 · ADD ADR7

## Problem

Customers need an account to book, and the session must survive reloads without leaking the token.

## User stories

- As a visitor, I want to register so that I can book seats.
- As a customer, I want to stay logged in after a reload so that I don't retype my password.
- As a customer, I want to return to the page I was on after logging in.

## Acceptance criteria (EARS)

- [x] WHEN a visitor submits the register form with valid data THE client SHALL create the account, log in and open the catalogue.
- [x] IF a register or login field is invalid THEN THE client SHALL show the error under that field once touched or submitted.
- [x] IF the API rejects the email as already registered THEN THE client SHALL show that error on the email field.
- [x] IF the credentials are wrong THEN THE client SHALL show "Email o contraseña incorrectos.".
- [x] WHILE a token is stored and not expired THE client SHALL keep the user logged in across reloads.
- [x] THE client SHALL send the token only to requests for `API_URL`.
- [x] WHEN the API answers 401 THE client SHALL log out and redirect to `/login?returnUrl=…&expired=1`.
- [x] WHEN a guest opens a private route THE client SHALL redirect to login and, after login, back to that route.
- [x] WHILE logged in THE client SHALL redirect `/login` and `/register` to the catalogue.

## Plan

- [x] `core/auth/auth-store.ts`, `auth-interceptor.ts`, `auth-guards.ts`, `testing.ts`.
- [x] `features/auth/login`, `register`, `return-url.ts` (`safeReturnUrl`).
- [x] `core/api-errors.ts` mappings; `shared/field-errors.ts`.

## Verification

Vitest: `auth-store.spec.ts`, `auth-interceptor.spec.ts`, `return-url.spec.ts`, `api-errors.spec.ts`.
Browser walkthrough: register, duplicate email, wrong password, returnUrl, reload.
