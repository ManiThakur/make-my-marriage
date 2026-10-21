# Application / Codebase Architecture

This document translates the approved product, system, database, and API
designs into a small Next.js App Router codebase plan. It does not supersede
those documents.

## Boundaries

- `src/app` owns pages, layouts, and REST Route Handler entry points.
- `src/components` is for UI shared across multiple areas of the product.
- `src/modules/<domain>` owns domain validation, business rules, and the
  Mongoose models for that domain. Add a separate persistence helper only when
  it materially improves a module; avoid empty or boilerplate layers.
- `src/lib/db` owns the shared connection lifecycle, not domain behavior.
- `src/lib/http` will hold shared API response/error mapping when routes are
  implemented. `src/lib/security` will hold cross-cutting session, cookie,
  token, and origin-check helpers.
- `tests` will contain unit, database integration, and end-to-end tests as
  those layers are added.

## Request flow

Private REST requests authenticate the session, resolve the user's current
wedding membership, validate route/query/body input with Zod, call the domain
service using trusted tenant context, and return the documented response
envelope. Database operations on wedding-owned records must include the
resolved `weddingId`; the client never supplies tenant authority.

Public invitation and gallery routes resolve unpredictable tokens and return
only the public data needed for that experience. They do not create organizer
sessions.

## Initial implementation order

1. App shell, environment handling, database connection, and quality tooling.
2. Users, password hashes, server-side sessions, memberships, and atomic
   wedding creation.
3. Wedding details, events, tasks, and dashboard.
4. Guests, stable invitation links, RSVP, and email jobs.
5. Expenses, vendors, and vendor discovery.
6. Public wedding website and livestream display.
7. Organizer photo lifecycle using R2; public gallery and QR later, in line
   with the dated gallery implementation clarification in the design docs.

## Decisions still open

- Session duration and rotation policy, password-hash parameters, and shared
  rate-limit storage.
- MongoDB environment and transaction-capable integration-test setup.
- CI provider and deployment environment policy.
