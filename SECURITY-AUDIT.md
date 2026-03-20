# Security Audit — Runners In Need

**Date:** 2026-03-20
**Auditor:** Claw (AI security review)
**Scope:** Full white-box code review + black-box production testing
**Target:** https://runnersinneed.com (Cloudflare Workers, Astro 6, Turso DB)

---

## Executive Summary

The application has **strong security fundamentals**: parameterized queries via Drizzle ORM (no SQL injection), consistent HTML escaping, robust CSRF protection, and defense-in-depth authorization checks. No critical vulnerabilities were found that would allow data theft, account takeover, or privilege escalation.

The main gaps are around **defense-in-depth hardening**: rate limiting was removed during simplification, action tokens are replayable, and a dev fallback secret could theoretically be exploited if env vars are misconfigured.

---

## Findings

### S1: AUTH_SECRET fallback to "dev-secret" [HIGH]

**File:** `src/lib/tokens.ts:6`

```typescript
const secret = getEnv("AUTH_SECRET") || "dev-secret";
```

If `AUTH_SECRET` is not set in production, all HMAC-based action tokens (used for email one-click links like "extend this need" or "mark as fulfilled") become forgeable. An attacker who knows the fallback can craft valid tokens for any need ID.

**Current risk:** LOW in practice — Auth.js itself would fail to start without `AUTH_SECRET`, so the app wouldn't be functional. But `tokens.ts` is independent of Auth.js and could silently fall back.

**Fix:** Remove the fallback. Throw at startup if `AUTH_SECRET` is missing in production:
```typescript
const secret = getEnv("AUTH_SECRET");
if (!secret) throw new Error("AUTH_SECRET is required");
```

---

### S2: No rate limiting on critical endpoints [HIGH]

**Affected:** `/api/pledges` (POST), `/api/messages` (POST), `/api/drives` (POST), `/api/needs/[id]/extend` (GET), `/api/needs/[id]/status` (GET)

The in-memory rate limiter was correctly removed (stateless Workers, it didn't work). Nothing replaced it.

**Attack scenarios:**
- Pledge spam: flood an organizer's dashboard with thousands of fake pledges
- Message spam: flood pledge message threads
- Token brute-force: action tokens include a timestamp prefix, reducing search space

**Mitigations already in place:** Turnstile on anonymous pledges, honeypot fields, auth required for messages.

**Fix:** Use Cloudflare's built-in rate limiting (Workers → Security → Rate Limiting Rules) or Cloudflare WAF custom rules. No code changes needed — this is an infrastructure configuration. Recommended limits:
- `/api/pledges` POST: 10/min per IP
- `/api/messages` POST: 30/min per authenticated user
- `/api/needs/*/extend` GET: 5/min per IP
- `/api/needs/*/status` GET: 5/min per IP

---

### S3: Action tokens are not single-use [MEDIUM]

**File:** `src/lib/tokens.ts`

Action tokens embedded in emails (extend need, mark fulfilled) are HMAC-based and valid for 30 days. They are not consumed on use — clicking the same link twice performs the action twice (idempotent for extend, but not for status changes).

**Risk:** If an email is forwarded or intercepted, anyone with the link can trigger the action for the full 30-day window.

**Current mitigation:** Actions are generally idempotent (extending an already-active need is a no-op). The partial fulfillment flow has an idempotency guard (F159 fix).

**Fix (if desired):** Store token hashes in DB, mark as consumed after first use. Or reduce TTL to 7 days.

---

### S4: Cron endpoint leaks configuration state [MEDIUM]

**File:** `src/pages/api/cron/daily.ts:17-18`

```typescript
if (!cronSecret) {
  return json(500, { error: "CRON_SECRET not configured" });
}
```

**Black-box verified:** Production returns HTTP 500 for `/api/cron/daily`, confirming `CRON_SECRET` is not set. This tells attackers the cron system is misconfigured. The error message should not reveal internal state.

**Fix:** Return a generic 403 regardless of whether the secret is configured:
```typescript
const cronSecret = getEnv("CRON_SECRET");
const provided = new URL(request.url).searchParams.get("token") || request.headers.get("x-cron-secret");
if (!cronSecret || provided !== cronSecret) {
  return json(403, { error: "Forbidden" });
}
```

Also: set `CRON_SECRET` in the Cloudflare Workers dashboard so the cron job actually runs.

---

### S5: CRON_SECRET comparison is not timing-safe [LOW]

**File:** `src/pages/api/cron/daily.ts:25`

```typescript
if (provided !== cronSecret) {
```

String `!==` comparison leaks timing information. In practice, this is very low risk (network jitter dwarfs comparison timing on a remote Workers endpoint), but it's a cheap fix.

**Fix:**
```typescript
const encoder = new TextEncoder();
const a = encoder.encode(provided ?? "");
const b = encoder.encode(cronSecret);
if (a.byteLength !== b.byteLength || !crypto.subtle.timingSafeEqual(a, b)) {
  return json(403, { error: "Forbidden" });
}
```

---

### S6: CSP allows 'unsafe-inline' for scripts [LOW]

**File:** `src/middleware.ts:54`

Required because Astro inlines scripts for prerendered static pages. This weakens XSS protection but is mitigated by:
- React auto-escapes all rendered content
- Astro templates auto-escape interpolated values
- `escapeHtml()` used in all email templates
- No raw HTML injection points found in the entire codebase

**Fix (future):** Nonce-based CSP or disable prerendering for pages with interactive scripts. Not urgent given the mitigations.

---

### S7: Pledge drive creation doesn't verify organizer role [LOW]

**File:** `src/pages/api/drives.ts:9-10`

```typescript
const session = requireAuth(locals);
```

Uses `requireAuth` (any authenticated user) instead of `requireOrganizer`. Any logged-in donor can create a pledge drive.

**Risk:** Low — pledge drives are public-facing events, and the data stored is non-sensitive. But it's inconsistent with the organizer-gated model.

**Fix:** Use `requireOrganizer(locals)` if drives should be org-only, or document this as intentional.

---

## Verified Secure

These areas were specifically tested and found to be properly secured:

| Area | Verification |
|------|-------------|
| **SQL Injection** | All queries use Drizzle ORM parameterized queries. Zero raw SQL. |
| **XSS (Stored)** | User content escaped via `escapeHtml()` in emails and `React.createElement` auto-escaping in components. |
| **XSS (Reflected)** | `callbackUrl` param tested with `https://evil.com` — not rendered in page content. Astro auto-escapes template values. |
| **CSRF** | Origin header validation + Sec-Fetch-Site fallback. Tested: cross-origin POST blocked. |
| **IDOR** | All endpoints verify ownership: `pledge.donorId === user.id` or `need.orgId === user.orgId`. |
| **Auth Bypass** | Protected routes return 401/redirect. Admin routes check `role === "admin"` at middleware + handler level. |
| **Open Redirect** | `callbackUrl` validated by Auth.js (same-origin only). Referer redirect in messages.ts extracts pathname only. |
| **Session Security** | Database-backed sessions via Auth.js. Cookies are HttpOnly, Secure, SameSite=Lax (Auth.js defaults). |
| **Data Exposure** | `/api/needs` exposes only public fields (no emails, addresses, user IDs). Shipping addresses only shown to pledgers when org opts in. |
| **Email Header Injection** | Resend uses REST API (JSON body), not raw SMTP. CRLF in user fields cannot inject headers. |
| **Mass Assignment** | All endpoints extract specific fields from form data. No bulk assignment from request body. |
| **Privilege Escalation** | Organizer approval requires admin action. Role field cannot be set via form submission. |
| **Clickjacking** | `X-Frame-Options: DENY` set on all responses. |
| **HSTS** | `Strict-Transport-Security: max-age=31536000; includeSubDomains` in production. |

---

## Production Black-Box Results

| Test | Result |
|------|--------|
| `GET /api/health` | 200 — returns `{"status":"ok","db":"connected","version":"726dfca"}` |
| `GET /api/needs` | 200 — returns public need data only, no PII |
| `GET /api/cron/daily` | 500 — leaks "CRON_SECRET not configured" (S4) |
| `GET /api/cron/daily?token=test` | 500 — same (secret not configured, doesn't reach comparison) |
| `GET /dashboard` (unauth) | Redirects to `/auth/signin` — correct |
| `GET /admin` (unauth) | Redirects to `/auth/signin` — correct |
| `GET /auth/signin?callbackUrl=https://evil.com` | No XSS, evil.com not rendered — correct |
| `GET /needs/9n96tnB43mrG` | Shows public need data + donor names (by design), no PII leak |

---

## Priority Actions

**P0 — Do now:**
1. **S4:** Set `CRON_SECRET` in Cloudflare Workers dashboard (cron job is currently non-functional)
2. **S4:** Fix error response to not leak config state
3. **S1:** Remove `"dev-secret"` fallback in `tokens.ts`

**P1 — This sprint:**
4. **S2:** Configure Cloudflare rate limiting rules (no code change needed)
5. **S5:** Use timing-safe comparison for CRON_SECRET

**P2 — Backlog:**
6. **S3:** Consider single-use tokens or shorter TTL
7. **S7:** Decide if pledge drives should require organizer role
8. **S6:** Investigate nonce-based CSP (Astro limitation)

---

## Methodology

1. **Threat model** — identified assets (user emails, shipping addresses, session tokens), threat actors (spammers, scrapers, phishers), and attack surfaces (public API, email links, auth flow)
2. **White-box code review** — read all 17 API endpoints, middleware, auth config, token system, email templates, database schema, and client-side scripts
3. **Black-box production testing** — tested 8 endpoints/pages against live site for data exposure, auth bypass, and error handling
4. **Agent-assisted deep analysis** — 3 specialized agents audited input validation, auth/session/access control, and email/infrastructure in parallel
