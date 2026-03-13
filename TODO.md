# TODO — Runners In Need

Prioritized task list. Check items off as you complete them. See [NICK-TODOS.md](NICK-TODOS.md) for items needing human input (product decisions, account setup, etc.).

---

## Critical Bugs (Fix Before Launch)

These are broken features that affect core user journeys.

- [ ] **GAP-1: Authenticated donor pledges are orphaned**
  - The pledge API (`/api/pledges`) never sets `donorId` from the session — only uses form data
  - Donor dashboard shows zero pledges (queries by `donorId`)
  - Authenticated donors can't message on their own pledges
  - Fix: Set `donorId` from session in the pledge creation endpoint when user is logged in

- [ ] **GAP-2: Need status never transitions on pledge delivery**
  - When all pledges reach `delivered`, the need stays `active`
  - Nothing triggers `fulfilled` or `partially_fulfilled` status
  - Decision needed from Nick: automatic vs organizer confirmation (see NICK-TODOS.md)

- [ ] **GAP-7: `reviewedBy` never set on approve/deny**
  - Admin approval/denial doesn't record who reviewed
  - The column exists but is always null
  - Quick fix in `/api/admin/approve-request.ts` and `deny-request.ts`

---

## High Priority

- [ ] **GAP-8: Re-geocode lat/lng when org location is updated**
  - Profile page lets orgs update location text but coordinates stay stale
  - Map shows wrong position after location change

- [ ] **Pledge description length validation**
  - Currently unbounded — donors can submit empty or excessively long descriptions
  - Add min/max length validation

- [ ] **GAP-13: Notification email when organizer request is approved/denied**
  - Applicants must check back manually — no email sent on decision

- [ ] **GAP-6: Dashboard banner when org location is "TBD"**
  - Approved orgs get location "TBD" with no prompt to set a real location
  - Needs inherit a meaningless location; map shows wrong position

---

## Medium Priority

- [ ] **Email reminder system for expiring needs**
  - Reminders at: 1 month before, 2 weeks before, expiration day
  - One-click refresh link to extend need expiration

- [ ] **Stale pledge auto-expiration**
  - Pledges with no update in 30 days should auto-expire or prompt withdrawal

- [ ] **Honeypot fields on forms**
  - Anti-spam measure for pledge and application forms

- [ ] **Rate limiting on API endpoints**
  - Prevent abuse of pledge creation, messaging, etc.

- [ ] **Shipping address management UI**
  - Schema exists in DB but no UI to manage it
  - Address should only be visible to donors with accepted pledges

---

## Low Priority / Post-Launch

- [ ] **LLM-assisted partial fulfillment**
  - Auto-generate remaining need text after partial delivery
  - Requires `ANTHROPIC_API_KEY` in Cloudflare Workers env vars
  - Claude API call on server side; fallback: copy original text for manual editing

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
