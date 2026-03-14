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

- [ ] **GAP-2: Need status never transitions on pledge delivery**
  - When all pledges reach `delivered`, the need stays `active`
  - Nothing triggers `fulfilled` or `partially_fulfilled` status
  - Decision needed from Nick: automatic vs organizer confirmation (see NICK-TODOS.md)

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

- [ ] **Account deletion flow (GAP-9)**
  - GDPR/CCPA requirement
  - Nick needs to decide if this is MVP-blocking (see NICK-TODOS.md)

- [ ] **Org public profile page (GAP-12)**
  - `/org/[id]` page so donors can learn about organizations
  - Nick needs to decide if MVP-blocking (see NICK-TODOS.md)

- [ ] **Allow organizer reapplication after denial (GAP-5)**
  - Currently denied applicants see permanent "denied" banner, can't reapply
  - Nick needs to choose: allow reapply, show "contact us", or auto-expire denial

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
