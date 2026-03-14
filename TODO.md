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

- [x] **Pledge Drive feature** — `/drives` page, org opt-in, admin view

- [ ] **PROD 500s: apply schema migrations to production Turso DB**
  - New columns (suggestedText, allDeliveredAt, pledgeDriveInterest, shippingAddress, etc.) and pledgeDrives table not yet in prod DB
  - Run `npx drizzle-kit push --force` against production, or apply migration SQL manually
  - Also set new env vars: `CRON_SECRET`, `ANTHROPIC_API_KEY`

- [ ] **Header/footer scroll behavior**
  - Header and footer jump/unstick when scrolling quickly
  - Verify `position: sticky` is used correctly within the root scroller
  - May need `top: 0` / `bottom: 0` and proper stacking context

- [ ] **Improve location UX**
  - Use approximate location (IP-based or browser geolocation API without prompt) to sort needs by proximity by default
  - Add a button to prompt for exact location via browser Geolocation API
  - Show all needs globally but sort closest-first when location is available
  - Let user refine with search/filter from there
  - Consider: IP geolocation on server side (Cloudflare `cf-ipcountry` / `cf-connecting-ip` + GeoIP), browser geolocation on client side with permission prompt

- [ ] **Full codebase audit and quality pass (3+ hours)**
  - Research best practices for AI-assisted code audits first
  - Architecture review: identify duplication, unnecessary complexity, dead code
  - Performance: N+1 queries, unnecessary re-renders, bundle size, lazy loading
  - Code quality: consistent patterns, error handling, type safety
  - UI/UX: minor polish, accessibility, responsive issues
  - Tests: fix brittle tests, add coverage for gaps, improve test infrastructure
  - Record start time programmatically, spend minimum 3 hours
  - Commit and push in small logical blocks throughout
  - Do this LAST — after all other TODOs are complete

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
