# TODO — Runners In Need

Prioritized task list. Check items off as you complete them. See [NICK-TODOS.md](NICK-TODOS.md) for items needing human input (product decisions, account setup, etc.).

---

## Completed Work

- [x] **Full codebase audit and quality pass (3+ hours)** — Completed 2026-03-14, 50+ commits
  - 4 audit passes (security, performance, architecture, final sweep)
  - Fixed 3 critical security issues (XSS, timing attacks, auth bypasses)
  - Added 6 DB indexes, removed N+1 queries, optimized data loading
  - Extracted shared utilities (sanitize, constants, auth helpers, API helpers)
  - Added typed App.Locals, removed 20+ `as any` casts
  - Split DashboardTabs into 3 focused components
  - Added security headers (CSP, HSTS, X-Frame-Options, etc.)
  - Added accessibility: ARIA roles, skip-to-content, keyboard nav, focus management
  - Mobile responsive polish, print styles, SEO meta tags
  - Tests: 50 → 74, replaced brittle selectors with data-testid
  - Prerendered static pages, parallelized email sending

---

## Testing

74+ Playwright e2e tests exist covering all Critical User Journeys. Run with:
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
