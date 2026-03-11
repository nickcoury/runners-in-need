# Runners In Need - Technical Architecture

## Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Astro 6 (static-first + React islands) | Static by default, hydrate only interactive parts |
| UI Components | React (via @astrojs/react) | Islands architecture — only loads JS where needed |
| Styling | Tailwind CSS 4 | Utility-first, minimal CSS bundle |
| Hosting | Cloudflare Pages + Workers | Free tier, unlimited bandwidth, zero cold starts |
| Database | Turso (libSQL/SQLite) | 5GB free, no pausing, edge-native |
| ORM | Drizzle | Type-safe, supports Turso natively |
| Auth | Auth.js + Resend | Free forever, magic links + OAuth |
| Bot Prevention | Cloudflare Turnstile | Free, invisible, privacy-respecting |
| Maps | Leaflet + OpenStreetMap | Free, no API key required |
| Geocoding | Nominatim (OSM) | Free, rate-limited (fine for low volume) |
| LLM | Claude API | For partial fulfillment remainder generation |

## Architecture Principles

1. **Static by default** — Most pages (home, browse, about, need listings) are pre-rendered static HTML. No JavaScript shipped unless a component explicitly needs interactivity.

2. **Islands for interactivity** — React components hydrate independently for forms, auth UI, map, and dashboard. Each island loads only when needed (`client:load`, `client:visible`, `client:idle`).

3. **Hybrid SSR** — Dashboard and auth callback pages are server-rendered (`export const prerender = false`). Everything else is static.

4. **Monolith** — Frontend and API routes live in one Astro codebase. No separate backend service. Astro Actions handle form submissions with built-in Zod validation.

5. **Minimal maintenance** — All infrastructure is managed services with generous free tiers. No servers to patch, no databases to restart.

## Page Rendering Strategy

| Page | Rendering | Interactive Islands |
|------|-----------|-------------------|
| Home | Static | None |
| Browse Needs | Static (rebuilt on schedule) | Map, Search, Pledge button |
| About | Static | None |
| Need Detail | Static (rebuilt on change) | Pledge form, Message thread |
| Dashboard | SSR (auth required) | Need editor, Pledge manager |
| Auth pages | SSR | Auth forms |

## Data Model (High Level)

```
Organization
  id, name, location, shipping_address?, verified, admin_user_id

User
  id, email, name, role (donor|organizer|admin), org_id?, created_at

Need
  id, org_id, category_tag (shoes|apparel|accessories|other),
  title, body (free text), extras_welcome (bool),
  location, expires_at, continued_from?,
  status (active|partially_fulfilled|fulfilled|expired),
  created_at, updated_at

Pledge
  id, need_id, donor_id?, donor_email,
  description (free text),
  status (collecting|ready_to_deliver|delivered|withdrawn),
  created_at, updated_at

Message
  id, pledge_id, sender_id, body, created_at

OrganizerRequest
  id, user_id, org_name, org_description, org_url,
  status (pending|approved|denied),
  reviewed_by?, created_at, reviewed_at
```

## Directory Structure

```
src/
├── actions/          # Astro Actions (server-side form handlers)
├── assets/           # Static assets (images, icons)
├── components/       # React islands and Astro components
├── db/               # Drizzle schema and connection
├── layouts/          # Astro page layouts
├── lib/              # Shared utilities (auth, geocoding, etc.)
├── pages/            # Astro pages and API routes
│   ├── api/          # REST endpoints
│   ├── browse.astro
│   ├── about.astro
│   ├── dashboard.astro
│   └── index.astro
└── styles/           # Global CSS (Tailwind imports)
```

## Deployment

Cloudflare Pages auto-deploys from the GitHub repo's main branch. Static pages are served from the CDN edge. SSR pages and API routes run on Cloudflare Workers.

Build command: `npm run build`
Output directory: `dist/`

## Cost Projection

| Service | Monthly Cost |
|---------|-------------|
| Cloudflare Pages + Workers | $0 |
| Turso database | $0 |
| Auth.js (self-hosted logic) | $0 |
| Resend (magic link emails) | $0 (3K emails/mo free) |
| Cloudflare Turnstile | $0 |
| Claude API (LLM calls) | ~$0.01-0.10 |
| **Total** | **~$0/mo** |
