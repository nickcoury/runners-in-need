# Nick's TODOs

Action items that require your manual intervention (dashboard clicks, account setup, product decisions). Everything else is handled by the dev team.

---

## Critical Bugs (Should Fix Before Launch)

### GAP-1: Authenticated donor pledges are orphaned
The pledge API never sets `donorId` from the session — only uses form data. This means:
- Donor dashboard shows zero pledges (queries by `donorId`)
- Authenticated donors can't message on their own pledges
- **Fix**: Set `donorId` from session in `/api/pledges` when user is logged in

### GAP-2: Need status never transitions on pledge delivery
When all pledges reach `delivered`, the need stays `active`. Nothing triggers `fulfilled` or `partially_fulfilled`.
- **Decision needed**: Should this be automatic or require organizer confirmation?

### GAP-7: `reviewedBy` never set on approve/deny
Admin approval/denial doesn't record who reviewed. The column exists but is always null.
- Quick fix in `/api/admin/approve-request.ts` and `deny-request.ts`

---

## Product Decisions Needed

### Denied organizer reapplication (GAP-5)
Currently, denied applicants see a permanent "denied" banner and cannot reapply. Options:
1. Allow reapplication after denial (add "Apply Again" button)
2. Show a "Contact us to discuss" message
3. Auto-expire denial after 30 days

### Org onboarding after approval (GAP-6)
Approved orgs get location "TBD". Organizers need to know to update their profile.
- Add a dashboard banner when org location is "TBD"?
- Or require location at approval time?

### Account deletion (GAP-9)
No delete account flow exists. Needed for GDPR/CCPA?
- **Decision**: Is this MVP-blocking or post-launch?

### Org public profile page (GAP-12)
No `/org/[id]` page exists. Donors see org name on needs but can't view the org's profile.
- **Decision**: Needed for MVP?

### Anonymous donor limitations
Anonymous pledges can't use messaging. Only contact is via `donorEmail` visible in organizer dashboard.
- **Decision**: Is this acceptable, or should we prompt anonymous donors to create accounts?

---

## Implementation TODO (Dev Team)

### High Priority
- [ ] Fix GAP-1: Set donorId from session in pledge API
- [ ] Fix GAP-2: Transition need status when pledges deliver
- [ ] Fix GAP-7: Set reviewedBy on approve/deny
- [ ] Fix GAP-8: Re-geocode lat/lng when org location is updated
- [ ] Add pledge description length validation (currently unbounded)
- [ ] Add notification email when organizer request is approved/denied (GAP-13)
- [ ] Add dashboard banner when org location is "TBD" (GAP-6)

### Medium Priority
- [ ] Expiration reminder emails (1 month, 2 weeks, day-of)
- [ ] One-click refresh to extend need expiration
- [ ] Stale pledge auto-expiration (30 days no update)
- [ ] Shipping address management UI (schema exists, no UI)
- [ ] Honeypot fields on forms
- [ ] Rate limiting on API endpoints

### Low Priority / Post-Launch
- [ ] LLM-assisted partial fulfillment (needs Anthropic API key)
- [ ] Account deletion flow
- [ ] Org public profile page (`/org/[id]`)
- [ ] Allow organizer reapplication after denial

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

50 Playwright e2e tests covering all Critical User Journeys (CUJs). Run with:
```bash
npm run dev     # start dev server first
npm run test:e2e  # run tests
```

Tests cover: browsing, pledge forms, auth redirects, navigation, static pages, organizer application flow. Tests that require auth (dashboard, posting, messaging) verify redirect behavior only.
