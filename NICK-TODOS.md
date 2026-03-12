# Nick's TODOs

Action items that require your manual intervention (dashboard clicks, account setup, product decisions). Everything else is handled by the dev team.

---

## When Ready

### Add Anthropic API Key
For the LLM-assisted partial fulfillment feature. Add `ANTHROPIC_API_KEY` to Cloudflare Pages env vars (Production + Preview) and `.env` when you want this feature enabled.

---

## Environments & URLs

| Environment | URL | Database | Purpose |
|-------------|-----|----------|---------|
| **Production** | https://runnersinneed.com | `runners-in-need` | Live site |
| **Dev** | https://dev.runners-in-need.pages.dev | `runners-in-need-dev` | Persistent test environment (auto-syncs from main) |
| **PR Preview** | `*.runners-in-need.pages.dev` | `runners-in-need-dev` | Per-PR preview (auto-deploys on PRs) |
| **Local** | http://localhost:4321 | Per your `.env` | Local development |

**Dev environment** auto-syncs from main on every push. Use it to test all flows with the dev database. PR previews are ephemeral per-commit.
