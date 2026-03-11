# Runners In Need - TODO

High-level task list. For detailed issue tracking see `bd list` (beads).

## Accounts & Services to Create

- [ ] **Cloudflare account** — For Pages hosting, Workers, Turnstile, and DNS
- [ ] **Turso account** — Database (turso.tech, sign up with GitHub)
- [ ] **Resend account** — Transactional emails for magic links and notifications (resend.com)
- [ ] **Domain name** — Register a domain (e.g., runnersinneed.org) and point DNS to Cloudflare
- [ ] **Claude API key** — For LLM-assisted partial fulfillment feature (console.anthropic.com)
- [ ] **Google OAuth credentials** — For Google sign-in option (console.cloud.google.com)

## Infrastructure Setup

- [ ] Create Turso database (`turso db create runners-in-need`)
- [ ] Configure Cloudflare Pages project (connect GitHub repo)
- [ ] Set up Cloudflare Turnstile site key + secret
- [ ] Configure Resend domain verification (DNS records)
- [ ] Set up custom domain in Cloudflare Pages

## Core Build

- [x] Initialize Astro project with React, Tailwind, Cloudflare adapter
- [x] Basic page structure and layout
- [ ] Drizzle ORM schema + Turso connection
- [ ] Auth.js integration (magic links + Google OAuth)
- [ ] Organizer approval queue (admin review flow)
- [ ] Need creation form with templates
- [ ] Need listing / browse page with search
- [ ] Map integration (Leaflet + OpenStreetMap)
- [ ] Pledge flow (donor pledges gear against a need)
- [ ] In-app messaging (per-pledge threads)
- [ ] Dashboard (organizer: manage needs/pledges, donor: manage pledges)
- [ ] Expiration system (6-month max, reminder emails)
- [ ] Partial fulfillment flow (LLM-assisted remaining need generation)
- [ ] Cloudflare Turnstile on forms

## Polish & Launch Prep

- [ ] Responsive design pass (mobile-friendly)
- [ ] Error pages (404, 500)
- [ ] Loading states and empty states
- [ ] Email templates (notifications, reminders, welcome)
- [ ] Privacy policy page
- [ ] Terms of service page
- [ ] Favicon and Open Graph meta tags
- [ ] Analytics (Cloudflare Web Analytics — free, privacy-friendly)

## Post-Launch

- [ ] Edge cases & moderation tooling (see rin-aai)
- [ ] Abuse prevention refinements
- [ ] Performance monitoring
- [ ] User feedback collection
- [ ] Consider: recurring needs, organization profiles page, donor leaderboard
