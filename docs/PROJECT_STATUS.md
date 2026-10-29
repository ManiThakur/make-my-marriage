# Project Status

**Last updated:** 2026-10-29
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

**Follow-up:** The current development network's public IP is not on the Atlas project IP Access List, so database access from this network requires an Atlas allowlist entry. Wedding planning features beyond initial setup and the starter dashboard remain to be implemented.

## Environment note

On this Windows environment, Turbopack exits during CSS compilation, so local
development uses the supported Webpack fallback. Recheck Turbopack after the
local Node.js or Next.js toolchain is updated.
