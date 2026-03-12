# Nick's TODOs

Action items that require your manual intervention (dashboard clicks, account setup, product decisions). Everything else is handled by the dev team.

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
