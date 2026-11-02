# Project Status

**Last updated:** 2026-11-02
**Active branch:** `dev`

This document tracks completed major milestones and material follow-up items.
Update it when a major feature or project milestone is completed.

## Completed

### Initial application scaffold

**Status:** Complete
**Recorded:** 2026-10-26  
**Commit:** `a77004d` — `Create initial application scaffold`

- Set up the Next.js App Router with TypeScript and Tailwind CSS.
- Added project configuration, npm scripts, environment example, and architecture documentation.
- Added the approved product, system, database, and API design documents to `docs/`.
- Pushed the initial scaffold to `origin/dev`.

### Homepage

**Status:** Complete
**Recorded:** 2026-10-26

- Added the responsive landing page with the Make My Marriage identity and the headline “Plan the wedding. Enjoy the moments.”
- Added page metadata, global styling, and navigation to signup and login.
- Homepage calls to action now reflect the active server-side session and take signed-in users to their wedding workspace or setup.
- Verified the page returned HTTP 200 and included its expected title and headline.
- TypeScript type checking passed. No automated tests were run.

### Authentication and wedding setup

**Status:** Complete
**Recorded:** 2026-10-28

- Added signup, login, and logout flows with Argon2 password hashes and HTTP-only session cookies.
- Added MongoDB user, session, wedding, and membership persistence, plus the initial wedding setup form and dashboard route.
- Verified signup and login pages return HTTP 200, the configured MongoDB Atlas database connects, and a synthetic signup appears in the `users` collection.
- Switched `npm run dev` to Webpack because Turbopack's CSS compilation worker exited on this Windows environment.

### Wedding onboarding experience

**Status:** Complete
**Recorded:** 2026-10-29

- Implemented the approved Stitch wedding setup and welcome screens, including wedding details, live identity preview, and the first post-setup workspace overview with a readiness roadmap.
- Added cleanup for a partially created wedding if its initial membership cannot be created.
- The user reviewed and approved the feature. TypeScript type checking passed; `npm test` reported that no test files are configured.

**Follow-up:** The current development network's public IP is not on the Atlas project IP Access List, so database access from this network requires an Atlas allowlist entry. Task planning, family invitations, and other wedding planning modules remain to be implemented.

### Wedding events planner

**Status:** Implemented; runtime review pending
**Recorded:** 2026-11-02

- Added the responsive, Stitch-based events timeline, empty state, event form, and archive confirmation.
- Added wedding-scoped event CRUD APIs and MongoDB persistence. Events can be archived without deleting their records.
- Connected the dashboard celebration step to `/events` and show completion progress when events exist.
- TypeScript type checking passed. Automated tests were not run for this change.

**Follow-up:** End-to-end database verification from this development network still requires its IP to be added to the Atlas project IP Access List.

### Edit wedding details

**Status:** Implemented; runtime review pending
**Recorded:** 2026-11-02

- Implemented the approved Stitch edit form, responsive workspace summary, unsaved-changes confirmation, and save-success state.
- Added an admin-only, wedding-scoped update endpoint for couple names, wedding date, destination, venue, and subtitle. A wedding date can be left unset; changing it does not move existing celebration dates.
- Type checking and browser/database verification were not run for this change.

**Follow-up:** Database-backed verification still depends on MongoDB connectivity from the current development network.

### Family & team invitations

**Status:** Implemented; runtime review pending
**Recorded:** 2026-11-02

- Added the approved Stitch-based member directory, invitation form, shareable-link confirmation, and public invitation acceptance page with responsive layouts.
- Added wedding-scoped invitation persistence, hashed single-use tokens, seven-day expiry, admin-only creation and revocation, and email-matched signup/login continuation.
- Added member roster and pending invitation views, role selection, and a dashboard entry point.
- Added mock and Resend email providers. Local development defaults to an in-memory mock that does not deliver externally; the generated link remains available as a manual fallback.
- Added provider tests for mock capture, message rendering, Resend request formatting, missing credentials, and safe failure handling.
- Verification: all 5 targeted Vitest tests passed; `npm run typecheck` passed. Resend was not contacted.

**Follow-up:** Real email delivery requires `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, and a verified `RESEND_FROM_EMAIL` in local/production environment configuration. Runtime review of database-backed invitation creation still requires MongoDB connectivity. Acceptance uses a guarded invitation claim with a compensating status reset if membership creation fails, so the flow works with standalone MongoDB deployments that do not support transactions.

## Environment note

On this Windows environment, Turbopack exits during CSS compilation, so local
development uses the supported Webpack fallback. Recheck Turbopack after the
local Node.js or Next.js toolchain is updated.
