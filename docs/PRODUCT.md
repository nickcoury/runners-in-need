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
- Can pledge anonymously (no account required, just a contact email)
- Authenticated donors get pledges pre-filled with their session info

### Admins
- Approve organizer applications via /admin/requests
- Moderate content
- Manage platform settings

## Core Features

### Need Posting
- Free-form text body with template buttons (shoes, apparel, etc.) that inject example formatting
- Category tag per entry: shoes, apparel, accessories, other
- "Extras welcome" toggle (are additional items beyond the specific request useful?)
- Multiple entries per organization, each with its own expiration
- Location inherited from the organizer's organization record
- Optional shipping address (only visible to donors with accepted pledges)

### Need Editing & Deletion
- Organizers can edit their needs at /needs/[id]/edit
- Deletion is a soft-delete: sets the need status to `expired` rather than removing the record

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
active → expired (soft-delete by organizer)
```

### Browse & Search
- The home page IS the browse page (no separate /browse route)
- Map view with toggle to list/grid view (Leaflet + OpenStreetMap, free)
- Text search by location and keyword
- Filter by category tag
- Sort by distance, recency, urgency

### Communication
- In-pledge messaging threads per need (via /api/messages)
- Messages visible to org members and the pledge donor on the /needs/[id] page
- Email notifications sent on new messages
- Organizer contact info stays private

### Address & Logistics
- Location (required, public): City/state level for map and search
- Shipping address (optional, opt-in): Full address revealed only to accepted pledges
- Guidance text at appropriate flow points for best practices (shipping, drop-off, public meetups)
- Platform does not handle shipping directly — parties coordinate themselves

## Authentication & Trust

### Auth Implementation
- Auth.js (NextAuth v5) with two providers:
  - **Resend magic links** — passwordless email sign-in
  - **Google OAuth** — one-click social sign-in
- CSRF protection implemented (token fetched client-side before auth requests)
- New users created with default role `donor`
- Session-based auth with redirect to intended page after sign-in

### Organizer Signup
- Become-organizer application flow at /become-organizer
- Form collects: organization name, description, optional website URL
- Creates a pending `organizerRequest` record for admin review
- Admin reviews and approves at /admin/requests
- On approval: org created, user promoted to `organizer` role
- Email and validation info are private (admin-only)
- No .edu email requirement (too restrictive for community orgs)

### Donor Signup
- Lightweight: sign in via magic link or Google OAuth
- Option for anonymous pledges with just a contact email (no account required)

### Spam Prevention (layered)
1. Cloudflare Turnstile (invisible CAPTCHA) on pledge forms (when configured)
2. Email verification built into auth flow (magic links are inherently verified)
3. Organizer approval queue (manual admin review)
4. CSRF token validation on auth endpoints
5. Honeypot fields + rate limiting on forms

### Roles
Simple enum: `donor | organizer | admin`
- Enforced via middleware on API routes
- No full RBAC needed for 3 roles

## UI Philosophy
- "Craigslist spirit": functional, minimal, fast, straightforward
- No fancy animations or heavy UI components
- Key pages: Home (browse + search + map), Dashboard, Profile, About
- Dashboard has tabs: My Needs, Incoming Pledges, Account
- Profile page with stats and edit capabilities
- Mobile-friendly but not mobile-first

## Hosting
- Cloudflare Workers (via next-on-pages or OpenNext)
- D1 database (SQLite-compatible)
- Resend for transactional email

## LLM-Assisted Features
- Auto-generate remaining need text after partial fulfillment
- Claude API call on server side (negligible cost at low volume)
- Fallback: copy original text for manual editing if pledge description is vague

## Implementation Status

All features described in this document are implemented and live as of 2026-03-14.

## Critical User Journeys (CUJs)

### CUJ-1: Anonymous Visitor Browses Needs
1. Visitor lands on the home page — sees search bar, category filters, and a grid of need cards.
2. Searches by keyword or filters by category — cards update to match.
3. Toggles between map view and list/grid view.
4. Clicks a need card — navigates to /needs/[id] with full detail, existing pledges, and pledge form.

### CUJ-2: Anonymous Donor Makes a Pledge
1. On /needs/[id], visitor fills out the pledge form: email (required), name (optional), description of what they will donate (required).
2. Cloudflare Turnstile verification runs if configured.
3. Pledge is created with status `collecting`.
4. Org members are notified via email that a new pledge was made.

### CUJ-3: User Signs Up / Signs In
1. User navigates to /auth/signin (or is redirected there when accessing a protected page).
2. Chooses magic link (enters email, receives link via Resend) or Google OAuth.
3. CSRF token is fetched client-side before the auth request is submitted.
4. After authentication, user is redirected to their intended page (or home).
5. New users are created with the default role `donor`.

### CUJ-4: Authenticated Donor Makes a Pledge
1. Same flow as CUJ-2, but the pledge form pre-fills email and name from the user's session.
2. `donorId` is set from the session so pledges appear in the donor's dashboard.

### CUJ-5: Become an Organizer
1. Authenticated user navigates to /become-organizer.
2. Fills out application form: organization name, description, and optional website URL.
3. A pending `organizerRequest` record is created.
4. User sees confirmation that their application is under review.
5. If denied, the applicant can reapply after a 12-month cooldown period.

### CUJ-6: Admin Reviews Organizer Requests
1. Admin navigates to /admin/requests — sees a list of pending organizer applications.
2. Reviews each request and chooses to approve or deny.
3. On approval: an organization record is created, and the applicant's role is promoted to `organizer`.
4. Newly created orgs get location "TBD" with a dashboard banner prompting the organizer to update it.
5. `reviewedBy` is set on the request record for audit trail.
6. Notification email is sent to the applicant about the decision.

### CUJ-7: Organizer Posts a Need
1. Organizer navigates to /post.
2. Fills out the NeedForm: selects category, enters title, writes body text, sets "extras welcome" toggle, and chooses an expiration date.
3. Need is created with the org's location and coordinates.
4. Redirected to /needs/[newId] to see the published need.

### CUJ-8: Organizer Manages Needs (Dashboard)
1. Organizer navigates to /dashboard — My Needs tab shows a card grid of their needs.
2. Clicks edit on a need — navigates to /needs/[id]/edit where they can update details.
3. Clicks delete on a need — soft-delete sets the need status to `expired`.

### CUJ-9: Organizer Manages Pledges
1. Organizer navigates to /dashboard — Incoming Pledges tab shows pledges against their needs.
2. Updates pledge status through the lifecycle: `collecting` → `ready_to_deliver` → `delivered`.
3. When all pledges are delivered, the parent need's status transitions to `fulfilled`.

### CUJ-10: In-Pledge Messaging
1. On /needs/[id], a message form appears for org members or the pledge donor.
2. Messages are sent via /api/messages and stored as a thread.
3. Email notifications are sent to the other party on new messages.
4. Anonymous donors (no account) cannot participate in messaging threads — they coordinate via email.

### CUJ-11: User Profile Management
1. User navigates to /profile — sees their info and activity stats.
2. Can edit their display name.
3. Organizers can also edit their organization's details.
4. Updating an org's location text automatically re-geocodes coordinates.

## Known Gaps

No open gaps. All 13 gaps identified during initial development (GAP-1 through GAP-13) were resolved as of 2026-03-14.
