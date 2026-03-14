# TODO — Runners In Need

Prioritized task list. Check items off as you complete them. See [NICK-TODOS.md](NICK-TODOS.md) for items needing human input (product decisions, account setup, etc.).

---

## Critical Bugs (Fix Before Launch)

These are broken features that affect core user journeys.

- [x] **GAP-1: Authenticated donor pledges are orphaned**
  - The pledge API (`/api/pledges`) never sets `donorId` from the session — only uses form data
  - Donor dashboard shows zero pledges (queries by `donorId`)
  - Authenticated donors can't message on their own pledges
  - Fix: Set `donorId` from session in the pledge creation endpoint when user is logged in

- [x] **GAP-2: Need status transitions on pledge delivery**
  - Auto-fulfills 60 days after all pledges delivered, with reminders at 30/45/55 days
  - One-click email buttons: Fulfilled, Partially Fulfilled (copies to new need), Not Fulfilled

- [x] **GAP-7: `reviewedBy` never set on approve/deny**
  - Already implemented — both endpoints set `reviewedBy: session.user.id`

---

## High Priority

- [x] **GAP-8: Re-geocode lat/lng when org location is updated**

- [x] **Pledge description length validation** (5–2000 chars, client + server)

- [x] **GAP-13: Notification email when organizer request is approved/denied**

- [x] **GAP-6: Dashboard banner when org location is "TBD"**

---

## Medium Priority

- [x] **Email reminder system for expiring needs** (via `/api/cron/daily`, needs `CRON_SECRET` env var)

- [x] **Stale pledge auto-expiration** (30-day inactivity, runs in daily cron)

- [x] **Honeypot fields on forms** (pledge + organizer application)

- [x] **Rate limiting on API endpoints** (30 req/min per IP on mutations, in-memory)

- [x] **Shipping address management UI** (organizer dashboard Account tab + need detail display)

---

## Low Priority / Post-Launch

- [x] **LLM-assisted partial fulfillment** (src/lib/llm.ts, needs `ANTHROPIC_API_KEY` env var, stores in `suggestedText` column)

- [x] **Account deletion flow (GAP-9)** — MVP-blocking, double-confirm UI

- [x] **Org public profile page (GAP-12)** — `/org/[id]` page + profile editing tabs

- [x] **Organizer reapplication after denial (GAP-5)** — 12-month cooldown

- [ ] **Pledge Drive feature**
  - "Organize a Pledge Drive" button encouraging running groups/orgs to hold donation events at club runs, races, etc. to collect larger amounts of gear
  - Organizations can opt into interest for pledge drives, allowing them to be contacted during/after drives to receive gear not on their specific requests
  - Enables larger-scale collections that are less targeted but higher volume

---

## Testing

50 Playwright e2e tests exist covering all Critical User Journeys. Run with:
```bash
npm run dev       # start dev server first
npm run test:e2e  # run tests
```

No unit tests yet. Integration tests cover: browsing, pledge forms, auth redirects, navigation, static pages, organizer application flow. Auth-required tests (dashboard, posting, messaging) verify redirect behavior only.

---

## Notes for AI Agents

- **Always run tests** (`npm run test:e2e`) after making changes to verify nothing broke
- **Check the PRD** ([docs/PRODUCT.md](docs/PRODUCT.md)) for full feature specs and known gaps
- **Check NICK-TODOS.md** for items that need human decisions before implementation
- **Deployment**: Push to `main` to deploy to production. Push to `dev` branch for staging.
- **Database**: Turso (remote SQLite). Schema in `src/db/schema.ts`, migrations in `drizzle/`
- **Secrets**: `.env.example` shows all required keys. Never commit `.env` files.
