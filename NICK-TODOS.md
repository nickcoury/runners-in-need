# Nick's TODOs

Action items that require your manual intervention (dashboard clicks, account setup, product decisions). Everything else is handled by the dev team.

---

## Critical Bugs — All Fixed (2026-03-14)

- [x] **GAP-1**: `donorId` now set from session in pledge API
- [x] **GAP-2**: Need status transitions to `fulfilled` when all pledges are delivered
- [x] **GAP-7**: `reviewedBy` set on approve/deny

---

## Product Decisions — All Resolved (2026-03-14)

- [x] **GAP-5 (Reapplication)**: Denied applicants can reapply after 12-month cooldown
- [x] **GAP-6 (Org onboarding)**: Dashboard banner shown when org location is "TBD"
- [x] **GAP-9 (Account deletion)**: Full delete account flow with double-confirm UI
- [x] **GAP-12 (Org profile)**: Public org profile page at `/org/[id]`
- **Anonymous donors**: Acceptable as-is — contact via `donorEmail` in organizer dashboard

---

## Implementation TODO — All Complete (2026-03-14)

### High Priority
- [x] Fix GAP-1: Set donorId from session in pledge API
- [x] Fix GAP-2: Transition need status when pledges deliver
- [x] Fix GAP-7: Set reviewedBy on approve/deny
- [x] Fix GAP-8: Re-geocode lat/lng when org location is updated
- [x] Add pledge description length validation
- [x] Add notification email when organizer request is approved/denied (GAP-13)
- [x] Add dashboard banner when org location is "TBD" (GAP-6)

### Medium Priority
- [x] Expiration reminder emails (1 month, 2 weeks, day-of)
- [x] One-click refresh to extend need expiration
- [x] Stale pledge auto-expiration (30 days no update)
- [x] Shipping address management UI
- [x] Honeypot fields on forms
- [x] Rate limiting on API endpoints

### Low Priority / Post-Launch
- [x] LLM-assisted partial fulfillment
- [x] Account deletion flow
- [x] Org public profile page (`/org/[id]`)
- [x] Allow organizer reapplication after denial (12-month cooldown)

---

## When Ready

### Add Anthropic API Key
For the LLM-assisted partial fulfillment feature. Add `ANTHROPIC_API_KEY` to Cloudflare Workers env vars and `.env` when you want this feature enabled.

---

## Environments & URLs

| Environment | URL | Database | Purpose |
|-------------|-----|----------|---------|
| **Production** | https://runnersinneed.com | `runners-in-need` | Live site |
| **Dev** | https://runners-in-need-dev.nickcoury.workers.dev | `runners-in-need-dev` | Test environment (auto-syncs from main) |
| **Local** | http://localhost:4321 | Per your `.env` | Local development |

Deployment is via Cloudflare Workers (not Pages). `main` deploys to production, `dev` branch deploys to the dev environment. Env vars are managed per-environment in the Workers project settings (or via `wrangler secret put VAR --env dev`).

---

## Integration Tests

74+ Playwright e2e tests covering all Critical User Journeys (CUJs). Run with:
```bash
npm run dev     # start dev server first
npm run test:e2e  # run tests
```

Tests cover: browsing, pledge forms, auth redirects, navigation, static pages, organizer application flow. Tests that require auth (dashboard, posting, messaging) verify redirect behavior only.
