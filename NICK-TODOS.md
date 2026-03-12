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
| **Workers Preview** | https://runners-in-need.nickcoury.workers.dev | `runners-in-need` | Direct Workers URL (same deployment) |
| **Local** | http://localhost:4321 | Per your `.env` | Local development |

Deployment is via Cloudflare Workers (not Pages). The `main` and `dev` branches both trigger `wrangler deploy`. Env vars are managed in the Workers project settings in the Cloudflare dashboard.
