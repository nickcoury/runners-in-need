# Runners In Need - TODO

High-level task list. For detailed issue tracking see `bd list` (beads).

## Accounts & Services (Nick)

- [x] **Cloudflare account** — Pages hosting, Workers, Turnstile, DNS
- [ ] **Turso account** — Database (turso.tech, sign up with GitHub). See SETUP-GUIDE.md step 2.
- [ ] **Resend account** — Magic link emails (resend.com). See SETUP-GUIDE.md step 3.
- [ ] **Google OAuth credentials** — Optional, for "Continue with Google". See SETUP-GUIDE.md step 4.
- [ ] **Domain name** — Register and point DNS to Cloudflare (when ready)
- [ ] **Claude API key** — For LLM-assisted partial fulfillment (later)

## Infrastructure Setup (Nick)

- [x] Configure Cloudflare Pages project (GitHub Actions auto-deploy working)
- [ ] Create Turso database and provide URL + token
- [ ] Run DB migration (`npm run db:migrate`) once Turso is connected
- [ ] Configure Resend domain verification (DNS records)
- [ ] Set up Cloudflare Turnstile site key + secret
- [ ] Set up custom domain in Cloudflare Pages

## Core Build (done = scaffolded with mock data, wired = connected to real backend)

- [x] Initialize Astro project with React, Tailwind, Cloudflare adapter
- [x] Basic page structure and layout (home, browse, about, post, contact, privacy)
- [x] Need card component with category badges, expiry, pledge count
- [x] Browse page with category filters, card grid, sidebar (map + urgent needs)
- [x] Need detail page with pledge list, message threads, pledge form
- [x] Need creation form with category templates
- [x] Map integration (Leaflet + OpenStreetMap)
- [x] Dashboard with tabs (My Needs, Incoming Pledges, Account)
- [x] Pledge form with error handling and loading state
- [x] Auth pages (sign-in, error)
- [x] Mobile-responsive nav with hamburger menu
- [x] Error pages (404, 500)
- [x] Favicon and Open Graph meta tags
- [x] Focus-visible keyboard accessibility styles
- [ ] **Wire up Drizzle ORM + Turso** (schema exists, needs connection + migration)
- [ ] **Wire up Auth.js** (config exists, needs Resend API key)
- [ ] **Replace mock data with real DB queries** on browse, detail, dashboard pages
- [ ] **Wire up Astro Actions** to real DB (createNeed, createPledge, etc.)
- [ ] In-app messaging (per-pledge threads — UI exists, needs backend)
- [ ] Organizer approval queue (admin review flow)
- [ ] Expiration system (6-month max, reminder emails)
- [ ] Partial fulfillment flow (LLM-assisted remaining need generation)
- [ ] Cloudflare Turnstile on forms

## Hardening & Productionalization

- [ ] **Input sanitization** — Validate all user inputs server-side, not just Zod schemas
- [ ] **Rate limiting** — Add rate limits to form submissions (Cloudflare rate limiting or custom)
- [ ] **CSRF protection** — Verify origin headers on form POSTs
- [ ] **Content Security Policy** — Add CSP headers (allow leaflet CDN, block inline scripts)
- [ ] **Image upload** — Need photos for needs (Cloudflare R2 or Images)
- [ ] **Search functionality** — Wire up the search bar in the header (currently non-functional)
- [ ] **Pagination** — Browse page needs pagination for when there are many needs
- [ ] **Empty states** — Show helpful messages when no needs/pledges exist
- [ ] **Loading skeletons** — Show loading states while React islands hydrate
- [ ] **Error boundaries** — Add React error boundaries around islands
- [ ] **Email templates** — Styled transactional emails (pledge notifications, magic links)
- [ ] **Terms of service page** — Legal page
- [ ] **Analytics** — Cloudflare Web Analytics (free, privacy-friendly, one script tag)
- [ ] **Sitemap** — Generate sitemap.xml for SEO
- [ ] **robots.txt** — Add robots.txt allowing crawlers
- [ ] **Structured data** — Add JSON-LD for needs (helps Google understand the content)
- [ ] **Performance** — Audit Lighthouse score, optimize images, lazy-load map
- [ ] **Status enum consistency** — Align status values between schema, actions, and components

## Testing

- [ ] **Build verification** — `npm run build` passes (currently green)
- [ ] **Manual smoke test** — Visit all pages on live site, check for broken links
- [ ] **Form validation** — Test form submissions with invalid data
- [ ] **Mobile testing** — Test hamburger menu, card layout on small screens
- [ ] **SSR pages** — Verify /needs/[id], /post, /auth/* render without errors
- [ ] **Map rendering** — Verify Leaflet loads and markers display correctly
- [ ] **Accessibility audit** — Run axe or Lighthouse accessibility checks
- [ ] **Integration tests** — Once DB is connected: create need, create pledge, update status flows

## Post-Launch

- [ ] Edge cases & moderation tooling (see rin-aai)
- [ ] Abuse prevention refinements
- [ ] Performance monitoring
- [ ] User feedback collection
- [ ] Consider: recurring needs, organization profiles page, donor leaderboard
