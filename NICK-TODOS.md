# Nick's TODOs

Action items that require your manual intervention (dashboard clicks, account setup, product decisions). Everything else is handled by the dev team.

---

## Blocking — Do These First

### Create Dev Database (Turso)
Separate dev/preview from production so you can test flows without polluting prod data.

```bash
turso db create runners-in-need-dev
turso db show runners-in-need-dev --url
turso db tokens create runners-in-need-dev
```

Then in Cloudflare dashboard → Workers & Pages → runners-in-need → Settings → Environment variables:
- Change the **Preview** environment's `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` to point to `runners-in-need-dev`
- Leave **Production** pointing to the original `runners-in-need` database

This gives you:
- **Production** (`runnersinneed.com`) → prod database
- **Preview** (`*.runners-in-need.pages.dev`) → dev database
- **Local** (`localhost:4321`) → whichever you put in `.env`

### Verify Resend Sending Domain
Without this, magic link emails come from `onboarding@resend.dev` and may hit spam.

1. Resend dashboard → Domains → Add Domain → `runnersinneed.com`
2. Resend shows DNS records to add. Go to Cloudflare dashboard → DNS → runnersinneed.com → Records
3. Add each record Resend provides (MX, TXT for SPF, TXT for DKIM)
4. Back in Resend, click Verify — usually instant since Cloudflare manages DNS

### Update Google OAuth Redirect URI
Google Cloud Console → APIs & Services → Credentials → edit your OAuth client → add:
- `https://runnersinneed.com/api/auth/callback/google`
- `https://runners-in-need.pages.dev/api/auth/callback/google` (for preview)

---

## When Ready

### Add Anthropic API Key
For the LLM-assisted partial fulfillment feature. Add `ANTHROPIC_API_KEY` to Cloudflare Pages env vars (Production + Preview) when you want this feature enabled.

---

## Environments & URLs

| Environment | URL | Database | Purpose |
|-------------|-----|----------|---------|
| **Production** | https://runnersinneed.com | `runners-in-need` | Live site |
| **Preview** | `*.runners-in-need.pages.dev` | `runners-in-need-dev` | Test changes (auto-deploys on PRs) |
| **Local** | http://localhost:4321 | Per your `.env` | Local development |

Preview deploys happen automatically on pull requests. Each PR gets a unique URL.
