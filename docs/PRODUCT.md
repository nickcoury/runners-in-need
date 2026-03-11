# Runners In Need - Product Requirements

## Vision

A two-sided platform connecting runners who have extra gear with organizations serving runners in need. Inspired by organizations that collect race medals for kids' exercise programs and by direct shoe donations to underprivileged schools.

## User Types

### Organizers (Demand Side)
- High school coaches, volunteer organizations, community running programs
- Post specific gear needs on behalf of their runners
- Manage incoming pledges, confirm deliveries

### Donors (Supply Side)
- Individual runners, run clubs, corporate groups
- Browse needs by location and category
- Pledge gear and coordinate delivery

### Admins
- Approve organizer applications
- Moderate content
- Manage platform settings

## Core Features

### Need Posting
- Free-form text body with template buttons (shoes, apparel, etc.) that inject example formatting
- Category tag per entry: shoes, apparel, accessories, other
- "Extras welcome" toggle (are additional items beyond the specific request useful?)
- Multiple entries per organization, each with its own expiration
- Location (required, city-level) for map display and search
- Optional shipping address (only visible to donors with accepted pledges)

### Expiration & Freshness
- Maximum 6-month expiration on all needs
- One-click refresh via email (extends by original duration, capped at 6 months from now)
- Reminder emails at 1 month before expiry, 2 weeks before, and on expiration day
- Expired needs auto-archive (not deleted)

### Fulfillment Flow
1. Donor browses needs and makes a **Pledge** (what they plan to donate)
2. Pledge lifecycle: `collecting` → `ready_to_deliver` → `delivered`
3. Organizer confirms delivery to close a pledge
4. **Partial fulfillment**: Original need is marked `partially_fulfilled`, and an LLM auto-generates a new "remaining need" for the organizer to approve with one click
5. The original need, fulfillment pledge, and new remaining need are linked as a chain
6. Stale pledges (no update in 30 days) can be auto-expired or withdrawn by the organizer

### Need Lifecycle
```
active → partially_fulfilled → (new remaining need created) → fulfilled
active → fulfilled (if fully delivered)
active → expired (if not refreshed before expiration)
```

### Browse & Search
- Map view (Leaflet + OpenStreetMap, free)
- Text search by location and keyword
- Filter by category tag
- Sort by distance, recency, urgency

### Communication
- In-app messaging threads per pledge (no email proxy)
- Email notifications link back to on-site threads
- Organizer contact info stays private

### Address & Logistics
- Location (required, public): City/state level for map and search
- Shipping address (optional, opt-in): Full address revealed only to accepted pledges
- Guidance text at appropriate flow points for best practices (shipping, drop-off, public meetups)
- Platform does not handle shipping directly — parties coordinate themselves

## Authentication & Trust

### Organizer Signup
- Email + organization name + public validation link (website, social media showing association)
- Admin reviews and approves (approval queue)
- Email and validation info are private (admin-only)
- No .edu email requirement (too restrictive for community orgs)

### Donor Signup
- Lightweight: email + name
- Option for anonymous pledges with just a contact email (no account required)

### Spam Prevention (layered)
1. Cloudflare Turnstile (invisible CAPTCHA) on registration and need-creation
2. Email verification built into auth flow
3. Organizer approval queue (manual admin review)
4. Honeypot fields + rate limiting on forms

### Roles
Simple enum: `donor | organizer | admin`
- Enforced via middleware on API routes
- No full RBAC needed for 3 roles

## UI Philosophy
- "Craigslist spirit": functional, minimal, fast, straightforward
- No fancy animations or heavy UI components
- Key pages: Home, Browse (map + search), About, Dashboard
- Mobile-friendly but not mobile-first
- Static pages by default, server-rendered only where needed (dashboard, auth)

## LLM-Assisted Features
- Auto-generate remaining need text after partial fulfillment
- Claude API call on server side (negligible cost at low volume)
- Fallback: copy original text for manual editing if pledge description is vague
