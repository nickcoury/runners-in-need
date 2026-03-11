# Setup Guide for Nick

Step-by-step instructions for creating accounts and providing the secrets needed to get the site live. Once complete, every push to main auto-deploys.

## What I Need From You

For each service below, I've listed what to do and exactly what to give me (or add to the Cloudflare dashboard). If you already have an account, skip to "What to provide."

---

### 1. Cloudflare (REQUIRED — hosting + bot protection)

**If you don't have an account:**
1. Go to https://dash.cloudflare.com/sign-up
2. Sign up (free, no credit card needed)

**What to do:**
1. In the Cloudflare dashboard, go to **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Select the `nickcoury/runners-in-need` repo
3. Build settings:
   - Framework preset: `Astro`
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Deploy — this gives you a `*.pages.dev` URL immediately

**What to provide me:**
- **Account ID**: Found at the bottom-right of the Cloudflare dashboard overview page, or in any Workers/Pages URL: `https://dash.cloudflare.com/<ACCOUNT_ID>/...`
- **API Token**: Create one at https://dash.cloudflare.com/profile/api-tokens → **Create Token** → **Custom token** with these permissions:
  - Account: Cloudflare Pages: Edit
  - Zone: DNS: Edit (only if setting up a custom domain)

I need both of these to set as GitHub secrets so the CI/CD pipeline works:
```
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
```

**Add to GitHub secrets:**
Go to https://github.com/nickcoury/runners-in-need/settings/secrets/actions → **New repository secret** → add both.

---

### 2. Turso (REQUIRED — database)

**If you don't have an account:**
1. Go to https://turso.tech
2. Sign up with GitHub (one click)

**What to do:**
1. Install the CLI: `curl -sSfL https://get.tur.so/install.sh | bash`
2. Login: `turso auth login`
3. Create the database: `turso db create runners-in-need`
4. Get the URL: `turso db show runners-in-need --url`
5. Create a token: `turso db tokens create runners-in-need`

**What to provide me:**
```
TURSO_DATABASE_URL=libsql://runners-in-need-<your-username>.turso.io
TURSO_AUTH_TOKEN=<the-token-from-step-5>
```

I'll use these to run the DB migration (`npm run db:migrate`) and add them to Cloudflare Pages env vars.

**Or:** Give me CLI access by running `turso auth token` and I can manage it directly.

---

### 3. Resend (REQUIRED — magic link emails)

**If you don't have an account:**
1. Go to https://resend.com
2. Sign up (free tier: 3,000 emails/month)

**What to do:**
1. Go to https://resend.com/api-keys
2. Create a new API key (name it "runners-in-need")

**What to provide me:**
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Later (for custom domain):** You'll need to add DNS records to verify your sending domain. I'll walk you through this once you have a domain.

---

### 4. Google OAuth (OPTIONAL — "Continue with Google" sign-in)

**If you don't have a Google Cloud project:**
1. Go to https://console.cloud.google.com
2. Create a new project (name: "Runners In Need")

**What to do:**
1. Go to **APIs & Services** → **OAuth consent screen**
   - User type: External
   - App name: "Runners In Need"
   - Authorized domains: your domain (or `pages.dev` for now)
2. Go to **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**
   - Application type: Web application
   - Authorized redirect URIs: `https://your-site.pages.dev/api/auth/callback/google`

**What to provide me:**
```
GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxx
```

**Note:** This is optional — magic links work without it. You can add this later.

---

### 5. Cloudflare Turnstile (OPTIONAL NOW — bot prevention)

**What to do:**
1. In Cloudflare dashboard → **Turnstile** → **Add site**
2. Site name: "Runners In Need"
3. Domain: your domain or `*.pages.dev`
4. Widget mode: "Managed" (shows checkbox only if suspicious)

**What to provide me:**
```
TURNSTILE_SITE_KEY=0x4xxxxxxxxxxxxxxxxxxxxxxxxx
TURNSTILE_SECRET_KEY=0x4xxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### 6. Claude API (OPTIONAL — LLM-assisted partial fulfillment)

**If you already have an Anthropic account:**
1. Go to https://console.anthropic.com/settings/keys
2. Create a new key

**What to provide me:**
```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxx
```

---

### 7. Auth Secret (I'll generate this)

I'll generate a random secret for session signing:
```bash
openssl rand -base64 32
```
No action needed from you.

---

### 8. Domain Name (WHEN READY)

Not needed for initial development — Cloudflare Pages gives you a `*.pages.dev` URL. When you want a custom domain:

1. Register a domain (e.g., `runnersinneed.org` via Cloudflare Registrar, Namecheap, etc.)
2. Point nameservers to Cloudflare
3. Add the domain in Cloudflare Pages project settings

---

## Priority Order

| # | Service | Urgency | What unlocks |
|---|---------|---------|-------------|
| 1 | **Cloudflare** (account ID + API token) | **Now** | Live site URL, CI/CD auto-deploy |
| 2 | **Turso** (DB URL + token) | **Now** | Database, real data |
| 3 | **Resend** (API key) | **Soon** | Auth/magic links |
| 4 | Google OAuth | Later | "Continue with Google" option |
| 5 | Turnstile | Later | Bot prevention on forms |
| 6 | Claude API | Later | LLM partial fulfillment feature |
| 7 | Domain | When ready | Custom URL |

## Where Secrets Go

| Secret | GitHub Actions | Cloudflare Pages Env Vars | Local .env |
|--------|---------------|--------------------------|------------|
| CLOUDFLARE_ACCOUNT_ID | Yes | — | — |
| CLOUDFLARE_API_TOKEN | Yes | — | — |
| TURSO_DATABASE_URL | — | Yes (Production + Preview) | Yes |
| TURSO_AUTH_TOKEN | — | Yes (Production + Preview) | Yes |
| AUTH_SECRET | — | Yes | Yes |
| RESEND_API_KEY | — | Yes | Yes |
| GOOGLE_CLIENT_ID | — | Yes | Yes |
| GOOGLE_CLIENT_SECRET | — | Yes | Yes |
| TURNSTILE_SITE_KEY | — | Yes | Yes |
| TURNSTILE_SECRET_KEY | — | Yes | Yes |
| ANTHROPIC_API_KEY | — | Yes | Yes |
