# Runners In Need — AI Agent Context

This file captures everything an AI agent needs to pick up development on this project.

## Project Overview

**Runners In Need** is a two-sided donation platform connecting runners with extra gear to organizations serving runners in need (school coaches, community programs, etc.). Think Craigslist for running gear donations.

- **Live**: https://runnersinneed.com
- **Dev**: https://runners-in-need-dev.nickcoury.workers.dev
- **Repo**: https://github.com/nickcoury/runners-in-need

## Owner

Nick Coury (nickcoury@gmail.com). Solo developer/founder. Experienced engineer.

### Working Preferences

- **Be direct.** Don't summarize what you just did — Nick can read the diff.
- **Triple-check destructive actions.** A previous `--force` flag wiped the entire issue database (44+ issues lost). Before any risky operation: consider consequences, check for rollback, evaluate alternatives.
- **Don't over-engineer.** Keep solutions simple. Don't add error handling for impossible scenarios. Don't create abstractions for one-time operations.
- **Avoid unnecessary additions.** Don't add docstrings, comments, or type annotations to code you didn't change. Don't refactor adjacent code. Don't add features beyond what was asked.
- **Timed tasks.** When Nick asks for work to last a specific duration (e.g., "spend 3 hours"), record the start time programmatically (`date -u > /tmp/task-start.txt`) and check elapsed time periodically. Do not stop before the minimum time has elapsed.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Astro 6 (static + React islands) |
| UI | React + Tailwind CSS 4 |
| Hosting | Cloudflare Workers |
| Database | Turso (libSQL/SQLite) via Drizzle ORM |
| Auth | Auth.js (magic links via Resend + Google OAuth) |
| Bot Prevention | Cloudflare Turnstile |
| Maps | Leaflet + OpenStreetMap |
| Geocoding | Nominatim (OSM) |
| LLM | Claude API (Anthropic, for partial fulfillment suggestions) |

## Development

```bash
npm install
cp .env.example .env    # Fill in values
npm run dev              # http://localhost:4321
npm run test:e2e         # 74+ Playwright e2e tests (needs dev server running)
npm run build            # Production build
```

Deployment: `main` branch auto-deploys to production via Cloudflare Workers. `dev` branch deploys to dev environment. Env vars managed in Cloudflare Workers dashboard or `wrangler secret put`.

Additional env vars beyond `.env.example`: `CRON_SECRET` (authenticates daily cron job), `ANTHROPIC_API_KEY` (LLM partial fulfillment suggestions).

## Current State (as of 2026-03-14)

The app is **functional and feature-complete for launch**. All core features are implemented and wired to a real Turso database. Auth works. 74+ e2e tests pass.

### What's Built

- Browse page with map (Leaflet) + search + category filters
- Need detail pages with pledge forms
- Need posting (organizer-only) and editing
- Pledge system (anonymous or authenticated)
- In-app messaging per pledge
- Dashboard (donor pledges view + organizer needs/pledges view)
- Profile page + user menu
- Admin organizer approval queue
- Auth (magic link via Resend + Google OAuth)
- CSRF protection
- Become-organizer application flow
- Pledge drives (`/drives` page, org opt-in, admin view)
- Org public profile pages (`/org/[id]`)
- Account deletion flow (double-confirm UI)
- Location-based sorting (CF geolocation auto-sort + "Near me" GPS button)
- Email reminder system (expiry reminders via `/api/cron/daily`)
- LLM-assisted partial fulfillment (Claude API)
- Honeypot fields + rate limiting
- Shipping address management UI
- Organizer reapplication after denial (12-month cooldown)
- Stale pledge auto-expiration

### Shared Utilities

- `src/lib/api.ts` — API response helpers and error handling
- `src/lib/html.ts` — HTML email templating
- `src/lib/constants.ts` — App-wide constants

### What's NOT Built Yet

- Full codebase audit and quality pass (see TODO.md)

## Key Documentation

- [Product Requirements (PRD)](docs/PRODUCT.md) — Full spec with CUJs and known gaps
- [Architecture](docs/ARCHITECTURE.md) — Tech decisions and deployment
- [Design System](docs/DESIGN-SYSTEM.md) — UI guidelines
- [Nick's TODOs](NICK-TODOS.md) — Bugs, product decisions, and implementation work items

## TODO — What to Work On

**Check [TODO.md](TODO.md) for the prioritized task list.** That's the source of truth for what needs doing next.

## Directory Structure

```
src/
├── actions/          # Astro Actions (server-side form handlers)
├── components/       # React islands and Astro components
├── db/               # Drizzle schema (schema.ts) and connection (index.ts)
├── layouts/          # Astro page layouts
├── lib/              # Shared utilities (auth, geocoding, etc.)
├── pages/            # Astro pages and API routes
│   ├── api/          # REST endpoints
│   └── auth/         # Auth pages
└── styles/           # Global CSS (Tailwind imports)
tests/                # Playwright e2e tests
drizzle/              # DB migrations
docs/                 # Product docs
```

## Machine Context

Development machine: HP Elite Dragonfly 13.5 Chromebook, 32GB RAM, Intel i7-1265U. Running Linux (Crostini).
