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
| LLM | Claude API (planned, not yet configured) |

## Development

```bash
npm install
cp .env.example .env    # Fill in values
npm run dev              # http://localhost:4321
npm run test:e2e         # 50 Playwright e2e tests (needs dev server running)
npm run build            # Production build
```

Deployment: `main` branch auto-deploys to production via Cloudflare Workers. `dev` branch deploys to dev environment. Env vars managed in Cloudflare Workers dashboard or `wrangler secret put`.

## Current State (as of 2026-03-13)

The app is **functional but pre-launch**. All core features are implemented and wired to a real Turso database. Auth works. 50 e2e tests pass.

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

### What's NOT Built Yet

- LLM partial fulfillment (Anthropic API key not configured)
- Honeypot fields + rate limiting
- Email notifications (expiry reminders, pledge updates)
- Account deletion flow
- Org public profile page
- Shipping address management UI

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
