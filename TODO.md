# TODO — Runners In Need

Prioritized task list. Check items off as you complete them. See [NICK-TODOS.md](NICK-TODOS.md) for items needing human input (product decisions, account setup, etc.).

---

## Remaining Work

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

72+ Playwright e2e tests exist covering all Critical User Journeys. Run with:
```bash
npm run dev       # start dev server first
npm run test:e2e  # run tests
```

No unit tests yet. Integration tests cover: browsing, pledge forms, auth redirects, navigation, static pages, organizer application flow, quality/SEO checks. Auth-required tests (dashboard, posting, messaging) verify redirect behavior only.

---

## Notes for AI Agents

- **Always run tests** (`npm run test:e2e`) after making changes to verify nothing broke
- **Check the PRD** ([docs/PRODUCT.md](docs/PRODUCT.md)) for full feature specs and known gaps
- **Check NICK-TODOS.md** for items that need human decisions before implementation
- **Deployment**: Push to `main` to deploy to production. Push to `dev` branch for staging.
- **Database**: Turso (remote SQLite). Schema in `src/db/schema.ts`, migrations in `drizzle/`
- **Secrets**: `.env.example` shows all required keys. Never commit `.env` files.

---

## Completed

All items below were completed as of 2026-03-14.

- [x] GAP-1: Authenticated donor pledges are orphaned
- [x] GAP-2: Need status transitions on pledge delivery
- [x] GAP-7: `reviewedBy` never set on approve/deny
- [x] GAP-8: Re-geocode lat/lng when org location is updated
- [x] Pledge description length validation
- [x] GAP-13: Notification email when organizer request is approved/denied
- [x] GAP-6: Dashboard banner when org location is "TBD"
- [x] Email reminder system for expiring needs
- [x] Stale pledge auto-expiration
- [x] Honeypot fields on forms
- [x] Rate limiting on API endpoints
- [x] Shipping address management UI
- [x] LLM-assisted partial fulfillment
- [x] Account deletion flow (GAP-9)
- [x] Org public profile page (GAP-12)
- [x] Organizer reapplication after denial (GAP-5)
- [x] Pledge Drive feature
- [x] PROD 500s fix
- [x] Header/footer scroll behavior fix
- [x] Improve location UX
