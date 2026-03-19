# Nick's TODOs

Action items that require your manual intervention.

---

## Pending

### Add Anthropic API Key
For the LLM-assisted partial fulfillment feature. Add `ANTHROPIC_API_KEY` to Cloudflare Workers env vars and `.env` when you want this feature enabled.

### Add CRON_SECRET to GitHub Secrets
Needed for the daily cron workflow to authenticate against the production endpoint.

### Pre-Launch Checklist
See [docs/INCIDENT-PLAYBOOK.md](docs/INCIDENT-PLAYBOOK.md) — Annual Checklist section. Review legal pages, Cloudflare dashboard, and insurance before launch.

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
