# Usability Audit — Runners In Need

Conducted 2026-03-14 via Playwright browser automation (3+ hours).
Focus: usability bugs, missing functionality, UX friction points.

## Personas

### Donor Personas
1. **Sarah** — 30s, casual runner, wants to donate old shoes, not very tech-savvy
2. **Marcus** — 50s, running club leader, wants to organize a group donation
3. **Priya** — 20s, college runner, browsing on mobile, limited time

### Organizer Personas
4. **Coach Maria** — High school cross-country coach, manages team gear needs
5. **James** — Community running program director, manages multiple needs
6. **Aisha** — Youth shelter coordinator, first time using the platform

### Admin Persona
7. **Admin Alex** — Site administrator reviewing and approving requests

---

## Critical Findings

### C1. "Sign In" shows in nav even when authenticated — PARTIALLY FIXED
**Personas:** Priya, Coach Maria | **Severity:** Critical

**What was fixed:** Redesigned sign-in as combined sign-up/sign-in flow ("Welcome to Runners In Need"), nav link changed to "Get Started", contextual subheading based on callbackUrl. Research confirmed combined flow is best practice for magic link + OAuth auth.

**Still open:** The nav still shows "Get Started" when authenticated via Playwright session cookies. This may be a test-only issue (Auth.js cookie format mismatch) or a real production bug. Needs verification with real Auth.js sessions in production.

### C2. Donor has no way to see or manage their pledges
**Personas:** Sarah, Priya | **Severity:** Critical

The donor dashboard renders blank (see C1), but even if it worked, there's no visible way for a donor to: see pledge status, withdraw a pledge, or track their donation. The pledge status labels ("Collecting", "Ready to Deliver") are organizer-centric and wouldn't make sense to donors.

**Recommendation:** Add donor-facing status labels (e.g., "Waiting for response," "Accepted — ready to ship," "Delivered"). Add a "Withdraw pledge" button for donors.

Nick - Agreed. On the statuses, let's make sure they're simple but comprehensive. You mentioned ready to ship but it could also be an in-person hand off or a drop off e.g. to a schoo. I don't know if we want to bloat out the responses with too many options so we should consider something that covers the bases clearly without being overwhelming.

### C3. Sign-in buttons stay disabled when CSRF fetch fails
**Personas:** All | **Severity:** Critical

When the CSRF token fetch (`/api/auth/csrf`) fails (returns 500 in certain conditions), the sign-in buttons remain permanently disabled with no error message. Users see grayed-out buttons with no explanation. This was observed in the dev environment but the UX flaw is real — there's no error handling for CSRF fetch failure.

**Recommendation:** Add error handling for the CSRF fetch. If it fails, either retry or show an error message ("Sign-in is temporarily unavailable. Please try again.").

Nick - Agreed on graceful handling. Is there a better option than that error message? Wondering because if it doesn't work, will trying again make it work? If so that's fine but if this is more likely systemic we'll want to make sure we get alerted to fix it. Speaking of that, what's our monitoring, alerting, and observability plan for this site? How will I get notified if something major happens while not getting overwhelmed with minor issues? Let's add a separate project to dive into that, specifically looking for prior art on small sites and how that's best maintained.

### C4. Pledge is fire-and-forget for unauthenticated users
**Personas:** Sarah | **Severity:** Critical

After an unauthenticated user submits a pledge, they get a success message but have zero way to track, edit, or cancel their pledge. No confirmation email is sent. No dashboard link (they're not signed in). The pledge is effectively a one-way drop with no follow-up possible.

**Recommendation:** Send a confirmation email to the donor's provided email address. Include a link to sign up for an account to track their pledge. Consider generating a "pledge tracking" link that works without an account.

Nick - I think we'll want everyone that pledges to have an account. To lower friction perhaps we make it in-situ when they're creating the pledge? E.g. we will create an account using your email when you submit your pledge. Set your password now or we'll send you a link to create it later. What do you think? Anonymous pledges might bring problems even though we want to keep friction low.

### C5. Duplicate pledges possible — no guard
**Personas:** Sarah | **Severity:** High bug

No unique constraint on `(needId, donorId)` or `(needId, donorEmail)`. A donor can pledge the same need multiple times. The client-side guard resets on page reload.

Nick - Thinking through why someone might need this. Could be they just need the ability to update a pledge? That should fix half of this problem. The other half goes back to a previous decision to make partial pledges close a need and re-open it with a new needID. But what if there are multiple pledges at a time? We might want to re-think that. Perhaps its fine to have multiple pledges and just add pledgeId in as a third key? Then we can close pledges, and perhaps keep an edit history of needs? Or have two sections, one with the need and a second with fulfilled needs to show history of what has been pledged for it? What do you think? I'm ok with any variant of these ideas, let's pick one and implement it.

### C6. Orphaned org on account deletion
**Personas:** Coach Maria | **Severity:** High bug

When an organizer deletes their account, the organization record is orphaned (never deleted). Active pledges from OTHER donors on the org's needs are not withdrawn. No notification sent to affected donors.

Nick - Do we have or do we need a one to many relationship between organizations and accounts? So humans have accounts, and they can always be donors. They can also be linked to an organization and then that lets them manage it. Perhaps we should keep it max one person per org to keep it simple for now, and keep emails and communication straightforward. But then an org can still exist without a human if the human deletes their account, and we can swap humans if they need to be handed over. We can also indicate if an org is "inactive" via having no human. Then we can label offers accordingly so people know there's no contacts for the org without losing the org history or deleting things that peolpe might expect to find still.

---

## High Priority Findings

### 1. Anonymous pledge flow requires sign-in but shouldn't always
**Personas:** Sarah, Priya | **Severity:** High

The site supports anonymous pledges (donorEmail from form), but clicking "Pledge Gear" on the need detail page still shows a Turnstile challenge that may block submission in some contexts. The pledge form IS visible to unauthenticated users, but the Turnstile widget creates friction. Sarah — a not-very-tech-savvy first-time visitor — may be confused by the verification step or think she needs to log in.

**Recommendation:** Make the anonymous pledge flow as frictionless as possible. Consider whether Turnstile is strictly necessary for signed-in users (already skipped) and ensure the form clearly communicates "no account needed."

Nick - mentioned this above but probably don't want fully anonymous pledges. Even something like Craigslist requires an account. Let's keep it low friction but make this required.

---

## Medium Priority Findings

### 2. Homepage doesn't promote Pledge Drives
**Personas:** Marcus | **Severity:** Medium

The homepage hero and CTAs focus on "Post a Need" and "Learn More." There's no mention of pledge drives on the homepage body — Marcus would only discover the feature via the nav link. This is a missed cross-promotion opportunity.

**Recommendation:** Add a secondary section on the homepage: "Want to make a bigger impact? Organize a Pledge Drive" with a CTA.

### 3. About page is a dead end
**Personas:** Sarah, Marcus | **Severity:** Medium

The About page has no CTAs or links in its body content. After reading about the mission, users have no clear next step. No mention of how to donate, become an organizer, or contact the team.

**Recommendation:** Add CTAs at the bottom: "Browse gear needs," "Become an organizer," "Contact us."

### 4. Why page doesn't mention Pledge Drives
**Personas:** Marcus | **Severity:** Medium

The `/why` page has compelling stats but its bottom CTAs are "Browse Needs" and "Post a Need" — no "Organize a Drive" option. Marcus's primary action is not represented.

**Recommendation:** Add "Organize a Pledge Drive" as a third CTA.

### 5. Contact page is email-only
**Personas:** Marcus, Aisha | **Severity:** Medium

The contact page shows email addresses but no contact form. For less tech-savvy users or those who don't want to open their email client, this adds friction.

**Recommendation:** Consider adding a simple contact form that sends via the existing email infrastructure.

### 6. Sign-in page lacks context
**Personas:** Marcus, Aisha | **Severity:** Medium

When redirected to sign-in from a specific page (e.g., /drives, /become-organizer), the sign-in page is generic — it doesn't explain why the user needs to sign in or what they'll get access to. A contextual message would reduce drop-off.

**Recommendation:** Show a brief message based on the callbackUrl: "Sign in to organize your pledge drive" or "Sign in to apply as an organizer."

### 7. Small touch targets on mobile
**Personas:** Priya | **Severity:** Medium

14-30 interactive elements across the site have touch targets smaller than the recommended 44x44px minimum. Category filter pills, footer links, and some navigation items are affected.

**Recommendation:** Increase padding on category pills and footer links. Use `min-h-[44px] min-w-[44px]` on interactive elements.

### 8. Map component not loading in some contexts
**Personas:** Sarah | **Severity:** Medium

The Leaflet map on the browse page was not detected during automated testing. This may be a Playwright/headless rendering issue, but worth verifying in a real browser that the map loads reliably.

**Recommendation:** Verify map loading in production. Consider adding a fallback message if the map fails to load.

### 9. "Become Organizer" language is running-specific
**Personas:** Aisha | **Severity:** Medium

The requirements page and site copy mention "running program" extensively. A youth shelter coordinator like Aisha might not identify with "running program" terminology, even though her organization serves runners.

**Recommendation:** Broaden language to "organizations serving runners" or "programs that provide gear to runners in need." Make it clear that shelters, community centers, and schools are welcome.

### 10. Dashboard has no search/filter for needs at scale
**Personas:** James | **Severity:** Medium

The organizer dashboard shows all needs in a simple list with no search, filter, or sort. An organizer managing 20+ needs would struggle to find specific ones.

**Recommendation:** Add at minimum a search filter and status filter (active/expired/fulfilled) to the needs tab.

### 11. No form validation feedback beyond HTML5 defaults
**Personas:** Coach Maria | **Severity:** Medium

The need creation form relies solely on browser HTML5 validation (red borders, tooltips). No custom inline error messages are shown. Different browsers show these differently, and they're not always clear.

**Recommendation:** Add custom inline error messages below fields on submit failure.

---

## Low Priority Findings

### 12. Donor pledge form doesn't pre-fill email/name for authenticated users
**Personas:** Priya | **Severity:** Low

When Priya is logged in and visits a need detail page, the pledge form should pre-fill her email and name from her session. The `userEmail` and `userName` props are passed, but the form may not always show them pre-filled (could be a rendering timing issue).

**Recommendation:** Verify pre-fill works and consider making the email field read-only for authenticated users.

### 13. No images anywhere on the site
**Personas:** All | **Severity:** Low

The entire site has no images — no hero image, no org logos, no need photos. While the text content is good, images would make the site feel more trustworthy and engaging.

**Recommendation:** Add hero images, consider allowing orgs to upload logos, and consider photo uploads for needs.

### 14. Footer doesn't include "Pledge Drives" or "Become Organizer"
**Personas:** Marcus, Aisha | **Severity:** Low

The footer has About, Why, Terms, Privacy, Contact — but not the two key action pages. Users who scroll to the bottom looking for navigation options miss these.

**Recommendation:** Add "Pledge Drives" and "Become an Organizer" to the footer.

### 15. No breadcrumbs on need detail or org profile pages
**Personas:** All | **Severity:** Low

When deep-linking to a need or org profile, there's a "Back to browse" link but no breadcrumb trail. For context and orientation, breadcrumbs would help.

### 16. "Extras Welcome" badge purpose unclear
**Personas:** Sarah | **Severity:** Low

The green "Extras Welcome" badge on need cards and detail pages is not self-explanatory. Sarah might not understand what it means.

**Recommendation:** Add a tooltip or help text: "This organization welcomes additional gear beyond what's listed."

### 17. Dead-end pages with no onward navigation
**Personas:** All | **Severity:** Low

The /about, /contact, and /privacy pages have no links in their body content — they're dead ends. Users who read the content have no clear next step.

### 18. Become-organizer page has very thin content (31 words)
**Personas:** Aisha | **Severity:** Low

The become-organizer page has minimal explanatory content. A first-time visitor doesn't get enough information about what being an organizer means, what the requirements are, or what happens after approval.

### 19. Pledge status labels are organizer-centric
**Personas:** Sarah, Priya | **Severity:** Low

Status labels like "Collecting" and "Ready to Deliver" make sense to organizers but are confusing to donors. Donors would better understand "Waiting for response," "Accepted — arrange shipping," "Delivered."

### 20. No character counter on text fields
**Personas:** Coach Maria | **Severity:** Low

The need body field has a 5000 char max but no visible counter. Users don't know how much space they have.

### 21. Duplicate org settings in dashboard and profile
**Personas:** Coach Maria | **Severity:** Low

Organization details (name, location, description) are editable in both `/profile#organization` AND `/dashboard#account`. This is confusing — which is the "right" place? Shipping address and pledge drive opt-in are only in dashboard.

---

## Information Architecture Findings

### IA1. /become-organizer is an orphan page
No inbound links from navigation, footer, homepage, or any other page. Only discoverable by URL.

### IA2. About page doesn't link to become-organizer
Readers wanting to get involved have no path forward.

### IA3. /why page has no "Organize a Drive" CTA
The page motivates action but only offers "Browse Needs" and "Post a Need."

### IA4. Homepage doesn't cross-promote pledge drives or become-organizer
The hero section only has "Post a Need" and "Learn More" CTAs. No secondary sections for other user journeys.

### IA5. /drives page assumes reader is a runner
Contains "fellow runner" language — not inclusive of non-runner organizers/donors.

---

## Accessibility Findings

### A1. Color contrast failures
**Severity:** Serious a11y

- `text-gray-400` used for visible text (signin legal text, date stamps) — fails WCAG AA
- Amber category badge (`bg-amber-600 text-white`) — borderline
- "29 days left" amber text on white — borderline
- "No upcoming drives" paragraph text — insufficient contrast

### A2. Dropdown menu not keyboard operable
**Severity:** Serious a11y

The user dropdown menu doesn't respond to Enter key. Has `aria-expanded` but keyboard users can't toggle it.

**Note:** Green #2D4A2D on white passes comfortably at 9.86:1 ratio.

## Bug Findings

### B1. JS error on sign-in page
**Severity:** Medium bug

The auth sign-in page throws `Unexpected token '<'... is not valid JSON` on every load. Something is trying to parse an HTML response as JSON (likely the CSRF token fetch returning HTML in certain dev conditions).

### B2. GET /api/cron/daily returns 500 instead of 405
**Severity:** Low bug

The cron endpoint only handles GET with a token, but requests without proper method handling return 500 instead of 405.

---

## Mobile-Specific Findings

### M1. Touch targets too small (pervasive)
**Severity:** High

81-100% of interactive elements are under 44x44px on phone viewports:
- Hamburger menu: 32x32px
- CTA buttons: 38px tall
- Category pills: 34px tall
- "Near me" button: 42x38px
- Search input: 38px tall
- Form inputs: 38px tall

### M2. Small font sizes on card metadata
**Severity:** Medium

Card metadata (category labels, org names, pledge counts) uses `text-xs` (12px). Borderline readable on mobile — 14px (`text-sm`) would be better.

### M3. Map toggle button not visible/clickable on mobile
**Severity:** Medium

The map button exists in the DOM but is hidden or non-interactive during Playwright testing. Needs investigation in a real browser.

---

## Form UX Findings

### F1. No character count indicators
**Severity:** Low

Fields with maxLength constraints (need body 5000, pledge description 2000) show no visible counter. Users don't know how much space they have.

### F2. Inconsistent loading states
**Severity:** Medium

Only the need creation form (/post) has a loading state on submit. Pledge, drives, and profile forms have no loading indicator, risking double submission.

---

## Messaging UX Findings

### MSG1. No messaging hub in dashboard
**Severity:** High

Neither organizers nor donors have a centralized place to see all their conversations. Messages only appear on individual need detail pages. Users must navigate to each need separately to check for new messages.

**Recommendation:** Add a "Messages" tab to the dashboard showing all conversations grouped by pledge, with unread indicators.

### MSG2. Messages are publicly visible on need pages
**Severity:** High

All message threads render on the need detail page for any visitor. Coordination details (shipping addresses, phone numbers, meeting locations) are visible to everyone.

**Recommendation:** Messages should only be visible to the pledge donor and org members. Consider hiding them behind an expandable section or auth check.

### MSG3. Message form is a single-line input with full-page reload
**Severity:** Medium

The message form uses a `<input>` instead of `<textarea>` and submits as a full-page POST, causing page reload and scroll loss. No success feedback is shown.

**Recommendation:** Use a `<textarea>`, submit via fetch/AJAX, and show inline success feedback.

### MSG4. Email notification says "Reply" but email footer says "do not reply"
**Severity:** Low

The notification email has a "Reply" CTA button linking to the need page, but the footer says "This is an automated message. Please do not reply directly to this email." Mixed signals.

### MSG5. Anonymous pledges can never have messages
**Severity:** Medium

Pledges made without an account have no `donorId`, so the messaging authorization check fails. These donors are completely cut off from communication after pledging.

**Recommendation:** Either require account creation to message, or allow messaging via a token-based link sent in the pledge confirmation email.

---

## Trust and Credibility Findings

### T1. No physical address or phone number
**Severity:** Medium

Contact page has email-only contact. No physical address, phone number, or social media links. Reduces trust for both donors and potential organizer partners.

### T2. No verified badge on need detail pages
**Severity:** Medium

Need detail pages show org name and location but no "Verified" badge, even for verified organizations. The badge IS shown on the org profile page but not where donors make their pledge decision.

### T3. About page doesn't mention founder or team
**Severity:** Medium

The about page is ~168 words and doesn't identify who runs the site. No founder name, team info, or organizational structure. Critical for trust.

### T4. Become-organizer page lacks process transparency
**Severity:** Medium

No stated requirements, no review timeline, no explanation of what happens after applying. An organization can't evaluate whether to apply without this information.

### T5. No legal entity information visible
**Severity:** Low

No mention of LLC, nonprofit status, or organizational structure anywhere on the site.

## Discovery and Browse Findings

### D1. Map markers not clickable (z-index bug)
**Severity:** High bug

Map marker popups are intercepted by the hero section div overlapping the map area. Clicking markers doesn't open popups. This is a z-index/CSS stacking issue.

### D2. No sort options beyond location
**Severity:** Medium

Default sort is newest first. "Near me" provides proximity sorting. But there's no sort dropdown for urgency, pledge count, or alphabetical. Users with specific needs can't prioritize effectively.

### D3. Mobile hero takes too much vertical space
**Severity:** Medium

On mobile (375x667), only 1 need card is fully visible above the fold. Hero + search + category pills consume significant vertical space. Consider collapsing the hero on mobile.

### D4. Homepage hero has no donor-facing CTA
**Severity:** High

Both hero buttons ("Post a Need", "Learn More") target organizers. Donors have no "I want to help" or "Browse needs" entry point. They must scroll past the hero to discover they can donate.

### D5. Pledge form buried below pledge list on need detail
**Severity:** High

The pledge form renders BELOW the existing pledges list on the need detail page. If a need has several pledges with message threads, the form could be 3+ screens down on mobile. Many donors will never find it.

**Recommendation:** Move the pledge form above the pledges list, or add a sticky "Pledge Gear" CTA button that scrolls to the form.

### D6. "How It Works" sidebar is hidden on mobile
**Severity:** Medium

The "How It Works" section is `hidden lg:block` — invisible on mobile where first-time donors need it most.

### D7. NeedCard body is not fully clickable
**Severity:** Medium

Only the title link and "MATCH NEED" button are clickable. The card body, org name, metadata, and description are not clickable. Users expect to click anywhere on a card to navigate.

### D8. No share buttons on need detail pages
**Severity:** Medium

Zero affordance to share needs on social media, email, or copy a link. Sharing is the primary growth vector for a donation platform.

### D9. No organizer controls on need detail page
**Severity:** Medium

Organizers viewing their own need have no way to edit, change status, or manage pledges from this page. They must go to the dashboard and navigate back. An "Edit" button for the need owner would be natural.

### D10. Expired/fulfilled needs lack prominent banner
**Severity:** Medium

Need status is buried in the small metadata bar. Donors could read the entire description before realizing the need is closed. A prominent banner at the top would prevent wasted effort.

### D11. Only 1 card visible above fold on mobile
**Severity:** Medium

Related to D3. Users must scroll significantly before seeing any needs. First-time mobile visitors may not realize there's content below.

## Privacy & Security UX Findings

### P1. Messages visible to all visitors (PRIVACY BUG)
**Severity:** High

All pledge message threads render on need detail pages for every visitor, including unauthenticated ones. Only the message form is gated. Messages may contain phone numbers, addresses, or coordination details.

**Recommendation:** Only render messages for the pledge donor and org members. Hide from other visitors.

### P2. Donor email survives account deletion (PRIVACY BUG)
**Severity:** Medium

When a donor deletes their account, `donorId` is nulled and name is set to "Deleted User," but `donorEmail` remains in the pledges table and is visible on the organizer dashboard.

### P3. Shipping address visible to all visitors
**Severity:** Medium

When an org opts into showing their shipping address, it renders for every visitor with no auth or pledge-status check. Should only be visible to donors with accepted pledges.

### P4. Anthropic API not disclosed in privacy policy
**Severity:** Medium

Need and pledge descriptions are sent to the Claude API for LLM partial fulfillment, but this third-party data sharing is not mentioned in the privacy policy.

### P5. No data export mechanism
**Severity:** Low

Privacy policy promises access rights but there's no self-service data export. Users must email to request their data.

---

## Pledge Lifecycle Findings

### PL1. Orphaned pledges on need expiry
**Severity:** High

When a need expires, active pledges are NOT withdrawn and donors are NOT notified. Donors may continue waiting for a response on a need that's already closed.

### PL2. Same PledgesTab renders for both donors and organizers
**Severity:** Medium

The dashboard PledgesTab shows organizer action buttons ("Mark Ready to Deliver," "Withdraw") regardless of whether the viewer is a donor or organizer. Donors see controls they can't/shouldn't use.

### PL3. No pledge progress indicator
**Severity:** Low

There's no visual indicator of how many items have been pledged vs. needed. A simple "3 of 5 pairs pledged" would help donors understand if more help is needed.

## Content Quality Findings

### CQ1. About and Why pages overlap significantly
**Severity:** Low

Both pages explain the mission. About is thin (~168 words) while Why is strong (~529 words with stats). Consider merging or differentiating clearly (About = story/team, Why = data/impact).

### CQ2. Privacy policy missing some data disclosures
**Severity:** Medium

User-to-user messages not listed as collected data. Turso (DB provider) and Cloudflare Turnstile not disclosed as third-party services processing data.

### CQ3. Terms of Service missing dispute resolution
**Severity:** Medium

No dispute resolution process defined. No account termination clause. No minimum age enforcement (privacy policy says no minors but ToS doesn't reference it).

### CQ4. No source citations for statistics on /why page
**Severity:** Low

The stats are compelling but have no sources cited. Adding citations would build credibility.

---

## Notification & Email Findings

### N1. No donor confirmation email on pledge
**Severity:** High

When a donor pledges gear, they receive zero acknowledgment — no confirmation email, no tracking link. If they pledged anonymously, they have no record of their action at all.

### N2. No unsubscribe mechanism in any email
**Severity:** High (CAN-SPAM compliance risk)

None of the 8 email templates include an unsubscribe link. Users have no way to opt out of notifications.

### N3. No notification preferences
**Severity:** Medium

Users can't control which emails they receive or how frequently. Every message triggers an immediate email — rapid conversations create email floods.

### N4. No pre-expiry warning for stale pledges
**Severity:** Medium

Pledges that go 30 days without updates are auto-expired with no advance warning. Donors should get a "your pledge will expire in 7 days" reminder.

### N5. Key events have no notification
**Severity:** Medium

Missing notifications for: pledge withdrawal (to org), need fulfillment/expiry (to donors), new organizer requests (to admin), new needs matching donor interests.

### N6. No notification history or in-app notifications
**Severity:** Low

Emails are fire-and-forget with no DB record. No in-app notification center. Users can't review past notifications.

---

## System & Reliability Findings

### SYS1. Token replay creates duplicate needs (BUG)
**Severity:** High bug

The "Partially Fulfilled" email action creates a new need (clone of original) then redirects to the edit page. The token is not single-use — clicking the link multiple times creates multiple duplicate needs. Need deduplication or token invalidation after first use.

### SYS2. Cron reminders have no deduplication
**Severity:** Medium

Expiry and fulfillment reminders use exact-day matching (day 30, 14, 0). No record of sent reminders. If the cron runs twice in one day, duplicate emails are sent. If a day is missed, the reminder is permanently skipped.

### SYS3. "Not Fulfilled" action doesn't notify donors
**Severity:** Medium

When an organizer marks pledges as "not fulfilled" (rejecting delivered items), all delivered pledges are set to "withdrawn" but donors receive no notification that their delivery was rejected.

### SYS4. No email retry or delivery tracking
**Severity:** Low

All emails are fire-and-forget with zero retry logic. Failed emails are permanently lost with no queue, alerting, or retry mechanism.

---

## Onboarding Findings

### O1. No confirmation email on organizer application
**Severity:** Medium

After submitting an organizer application, the user sees a green banner but receives no email confirmation. They have no record of their application.

### O2. No onboarding flow after approval
**Severity:** Medium

After being approved, the organizer gets an email with a "Go to Dashboard" button, but there's no welcome message, tutorial, or checklist. The dashboard shows a TBD location warning but no guided setup.

### O3. Location not collected during application
**Severity:** Medium

The application form collects org name, URL, and description — but NOT location. On approval, location is hardcoded to "TBD," forcing an extra step. Collecting location during application would save a step.

### O4. No denial reason captured
**Severity:** Medium

Admins can't provide a reason for denial. The denial email is generic. Applicants don't know what to change before reapplying.

## Admin Findings

### AD1. No admin link in navigation
**Severity:** High

Admin pages are only accessible by typing the URL. No link in nav, user menu, or dashboard.

### AD2. Drives admin page is read-only
**Severity:** Medium

Admin can see pledge drives but can't approve, deny, cancel, or edit them. No management actions available.

### AD3. No denial confirmation dialog
**Severity:** Low

The "Deny" button on admin requests page has no confirmation dialog — accidental clicks could deny legitimate applications.

---

## Competitive Gap Analysis

### Launch-Blocking Gaps
1. **Report mechanism** — No way to report inappropriate content or users
2. **ToS acceptance** — Terms/privacy pages exist but no explicit acceptance during signup/pledge
3. **Email unsubscribe** — CAN-SPAM compliance requirement

### Should-Have Gaps (users would actively miss)
- Email alerts for new needs matching donor interests
- Photo/image uploads for needs and org profiles
- Unread message indicator in dashboard/nav
- Organization verification badge on need pages (field exists but may not render)
- Social sharing buttons on need pages
- Donation impact statistics on donor profile

### Nice-to-Have Gaps (post-launch)
- Saved searches
- Donor reputation/history
- Read receipts on messages
- Shipping label generation
- PWA / push notifications
- Admin analytics dashboard

---

## Error Handling UX Findings

### E1. Server validation errors render as raw JSON pages
**Severity:** High

Traditional POST forms (need edit, drives, messages) render server validation errors as unstyled JSON blobs (`{"error":"Title must be 5-200 characters"}`) on a blank page. User loses all input and has no navigation.

### E2. CSRF failure shows blank page
**Severity:** Medium

"CSRF check failed" renders as plain text on a white page with no navigation or explanation. Can be triggered legitimately by stale browser tabs.

### E3. Error response parsing shows raw JSON to users
**Severity:** Medium

Profile and dashboard forms read error responses as raw text, showing `{"error":"Name must be 1-100 characters"}` instead of the extracted error message.

### E4. Silent failures on several interactions
**Severity:** Medium

Pledge drive interest toggle, need deletion, and some form submissions swallow errors with no user feedback.

## Email Template Findings

### ET1. Email prefetch scanners may trigger one-click actions
**Severity:** High

The one-click GET actions (extend need, fulfillment status) can be triggered by email security scanners that prefetch links. Should use POST with a confirmation page instead of direct GET actions.

### ET2. Div-based layout will break in Outlook desktop
**Severity:** Medium

Email templates use div-based HTML. Outlook desktop requires table-based layout. Emails may look broken for ~30% of corporate email users.

### ET3. No plain-text fallback for emails
**Severity:** Low

All emails are HTML-only. Some email clients and accessibility tools need plain-text alternatives.

---

## Visual Design Findings

### V1. Primary button padding inconsistent
**Severity:** Low

Primary buttons use `px-6 py-3` in some places, `px-6 py-2` in others, and `px-4 py-2` in others.

### V2. Delete Account button styled differently in two places
**Severity:** Low

Filled red (`bg-red-600`) in AccountTab but outline red (`border-red-300`) on the profile page.

### V3. No og:image on any page
**Severity:** Medium

Open Graph `og:image` is null on all pages. Social shares show no preview image. A default brand image would significantly improve sharing.

## SEO Findings

### S1. Generic meta descriptions on multiple pages
**Severity:** Low

Contact, become-organizer, privacy, terms, and signin all share the generic "Connecting runners..." description. Unique descriptions per page would improve search CTR.

---

## Product Strategy Observations

> "The product is technically excellent, emotionally empty. A funded competitor wouldn't out-build RIN — they'd out-market it."

### PS1. No imagery anywhere on a cause-driven platform
**Impact:** Very High

Zero photos on a charity platform. A single hero image of a kid in worn shoes would likely lift conversion 30-50%. The design system says "No images on cards" — that's a Craigslist philosophy applied to a charity platform where emotion drives action.

### PS2. No growth loops
**Impact:** Very High

The pledge flow is a dead end — no post-pledge share prompt, no dynamic OG images, no referral mechanism. Every pledge should be a marketing event; currently none are.

### PS3. No email capture for browsers
**Impact:** High

Visitors who aren't ready to pledge leave forever. No "notify me of needs near me" signup, no newsletter, no weekly digest. The cron and email infrastructure already exist.

### PS4. No social proof on homepage
**Impact:** High

Zero testimonials, zero impact stats on homepage, zero partner logos. The Why page has compelling statistics ($120-275 shoe costs, 46% increase) but they're buried 2 clicks deep.

### PS5. Hero CTAs are organizer-focused, not donor-focused
**Impact:** High

"Post a Need" and "Learn More" target organizers. 90%+ of visitors will be potential donors. "I Want to Help" or "Browse Gear Needs" should be the primary CTA.

---

## Positive Observations

- Homepage clearly communicates the site's purpose
- Category filter pills are intuitive and responsive
- Location-based sorting with "Near me" button works well
- Need cards show key info at a glance (title, org, location, pledge count, expiry)
- Mobile layout is generally solid with no horizontal overflow
- Sign-in preserves the callback URL correctly
- Skip-to-content link and keyboard navigation work
- 404 page is helpful with back-to-home link
- Search input with clear button is a nice UX touch
- URL hash state persistence for filters is excellent
- Privacy policy is substantial (831 words, 10 sections)
- Terms of service is thorough (773 words, 13 sections)
- All pages load under 200ms
- XSS and SQL injection attempts are safely handled
- Green brand color (#2D4A2D) passes WCAG contrast at 9.86:1
- Search + category filters work well together (AND logic)
- Empty state for zero search results is clear and helpful
- Professional error pages (404, 500)

---

## Production Playwright Audit — 2026-03-19

Conducted via headless Chromium against https://runnersinneed.com. Duration: 60+ minutes.

### PROD-C1. CSP blocks ALL inline JavaScript (LAUNCH BLOCKER)
**Severity:** Critical | **Personas:** All

The production CSP header is `script-src 'self' https://challenges.cloudflare.com`. This blocks every `<script>` tag in Layout.astro (4+ inline scripts), which means the following features are **completely broken in production**:

- Mobile hamburger menu toggle — clicking does nothing
- Desktop user menu dropdown — clicking does nothing
- Sign out button — no handler attached
- Back-to-top button — never shown
- Auth state detection — "Get Started" link is always visible even when signed in; user menu never appears
- Cloudflare Web Analytics beacon (`cloudflareinsights.com`) — also blocked

**Fix options:** Either add `'unsafe-inline'` to `script-src` (quick but less secure), or implement nonce-based CSP using Astro middleware (`defineMiddleware` to inject nonces into both CSP header and script tags). Nonce-based is the right long-term answer.

**Impact:** This single bug breaks the entire site's interactivity. The site renders but nothing clickable works beyond basic link navigation. This is the #1 launch blocker.

### PROD-C2. All organization names show "Unknown Organization"
**Severity:** Critical | **Personas:** All

Every need card on the production browse page displays "Unknown Organization" instead of the actual org name. Either:
- The org-need relation isn't populated in production data
- The query joining needs to organizations isn't returning org names
- The seed data doesn't set org names

This makes the site look broken/unprofessional and removes the trust signal of knowing which organization is behind each need.

### PROD-H1. Map shows "Loading map..." permanently
**Severity:** High | **Personas:** Sarah, Priya

The Leaflet map on the browse page never renders. The "Loading map..." placeholder text is visible, and CTA content from below the map bleeds through into the map area. Likely related to CSP blocking inline scripts, or a Leaflet initialization issue in production.

### PROD-H2. Pledge form submissions silently fail
**Severity:** High | **Personas:** Sarah, Priya

Filling out and submitting the pledge form on a need detail page produces no visible response — no success message, no error, no network request to the API. The form appears to be a React island (PledgeForm.tsx) whose hydration or event handlers may be broken by the CSP inline script restrictions.

### PROD-M1. Sign-in buttons show no loading state
**Severity:** Medium | **Personas:** All

Both "Continue with email" and "Continue with Google" buttons on the sign-in page start disabled and look identical to their enabled state — no spinner, no "Loading..." text. Users see grayed-out buttons with no indication that something is happening. The buttons enable after the CSRF fetch completes, but there's a several-hundred-ms window where they look permanently broken.

### PROD-M2. Admin page returns 404 for unauthenticated users
**Severity:** Medium | **Personas:** Admin Alex

Navigating to `/admin` while not authenticated returns a 404 page instead of redirecting to `/auth/signin?callbackUrl=/admin` like `/dashboard` and `/profile` do. This inconsistency is confusing and also leaks the existence of the admin route.

### PROD-M3. Turnstile CAPTCHA not rendering
**Severity:** Medium | **Personas:** Sarah

The Cloudflare Turnstile widget on the pledge form for anonymous users doesn't render. Either `turnstileSiteKey` isn't configured in the production environment, or the widget script is blocked by CSP. This leaves anonymous pledge submissions unprotected from bot abuse.

### PROD-L1. Security headers are solid
**Severity:** Positive observation

Production returns good security headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` restricting camera/mic/geolocation. The CSP itself is actually *too* strict (hence PROD-C1), but the security posture is strong.

---

## Summary

| Priority | Count | Key Themes |
|----------|-------|------------|
| High | 4 | Donation logistics unclear, key pages undiscoverable, admin nav missing |
| Medium | 10 | Cross-promotion gaps, mobile touch targets, form UX, inclusive language |
| Low | 5 | Visual polish, pre-fill, breadcrumbs, footer completeness |

The site's core functionality works well. The main gaps are around **discoverability** (key features hidden in nav only), **logistics clarity** (how does gear actually get from donor to org?), and **inclusive language** (broadening beyond "running programs"). The technical foundation is solid — these are primarily content and information architecture improvements.

---

## Prioritized Summary of All Findings

### Total Findings by Severity

| Severity | Count |
|----------|-------|
| Critical | 7 |
| High | 13 |
| Medium | 31 |
| Low | 14 |
| **Total** | **65** |

---

### Fix Before Launch (launch blockers)

**Bugs that break core functionality:**
- **PROD-C1: CSP blocks ALL inline JavaScript — entire site's interactivity is broken in production** (mobile menu, user menu, sign out, back-to-top, auth state detection)
- PROD-C2: All organization names show "Unknown Organization" in production
- C3: Sign-in buttons permanently disabled when CSRF fetch fails
- D1: Map markers not clickable due to z-index/CSS stacking bug
- PROD-H1: Map shows "Loading map..." permanently — never renders
- PROD-H2: Pledge form submissions silently fail — no API request made

**Privacy/security issues:**
- P1/MSG2: Messages visible to all visitors including unauthenticated — may contain phone numbers, addresses
- P3: Shipping address visible to all visitors with no auth check

**Legal compliance gaps:**
- N2: No unsubscribe mechanism in any email (CAN-SPAM compliance risk)
- P4: Anthropic API data sharing not disclosed in privacy policy
- CQ2: Privacy policy missing disclosures for messages, Turso, and Cloudflare Turnstile
- CQ3: Terms of Service missing dispute resolution, account termination, and minimum age enforcement

---

### Fix Soon After Launch (high priority)

**Major UX friction points:**
- C2: Donor has no way to see or manage their pledges (no donor-facing status labels or withdraw button)
- C4: Pledge is fire-and-forget for unauthenticated users — no confirmation email, no tracking
- N1: No donor confirmation email on pledge — zero acknowledgment of donation
- MSG1: No messaging hub in dashboard — users must navigate to each need separately
- MSG5: Anonymous pledges can never have messages — donors cut off from communication
- PL1: Orphaned pledges on need expiry — donors not notified when need closes
- C1: "Sign In" shows in nav even when authenticated — users can't tell they're logged in

**Missing key features:**
- AD1: No admin link in navigation — admin pages only accessible by URL
- C5: Duplicate pledges possible — no unique constraint guard
- A2: Dropdown menu not keyboard operable (serious a11y)

**Trust issues:**
- T3: About page doesn't mention founder or team — critical for trust
- T2: No verified badge on need detail pages where donors make pledge decisions
- T4: Become-organizer page lacks process transparency — no requirements or timeline stated

---

### Improve Over Time (medium priority)

**Polish and consistency:**
- V3: No og:image on any page — social shares show no preview
- A1: Color contrast failures on gray text, amber badges

**Nice-to-have features:**
- M6/H6: Sign-in page lacks context about why sign-in is needed
- H2/IA4: Homepage doesn't promote Pledge Drives or become-organizer
- H4/IA3: Why page doesn't mention Pledge Drives
- D2: No sort options beyond location (urgency, pledge count, alphabetical)
- D7: NeedCard body is not fully clickable — only title and button
- D8: No share buttons on need detail pages — critical growth vector
- D9: No organizer controls on need detail page (edit, manage pledges)
- D10: Expired/fulfilled needs lack prominent banner
- D3/D11: Mobile hero takes too much space — only 1 card visible above fold
- H10: Dashboard has no search/filter for needs at scale
- PL2: Same PledgesTab renders for both donors and organizers — donors see wrong controls
- AD2: Drives admin page is read-only — no management actions
- O3: Location not collected during organizer application — hardcoded to "TBD"
- O4: No denial reason captured for organizer applications
- F2: Inconsistent loading states — only need creation form has one
- MSG3: Message form is single-line input with full-page reload
- N3: No notification preferences — every message triggers immediate email
- N4: No pre-expiry warning for stale pledges before auto-expiration
- N5: Key events missing notifications (pledge withdrawal, need expiry, new requests)
- O1: No confirmation email on organizer application
- O2: No onboarding flow after organizer approval
- P2: Donor email survives account deletion (privacy bug)
- T1: No physical address or phone number on contact page
- H5: Contact page is email-only — no contact form
- H3: About page is a dead end with no CTAs
- H9: "Become Organizer" language is running-specific — not inclusive
- M1: Touch targets too small across the site (81-100% under 44x44px)
- M2: Small font sizes on card metadata (12px)
- M3: Map toggle button not visible/clickable on mobile
- H11: No form validation feedback beyond HTML5 defaults
- B1: JS error on sign-in page — "Unexpected token" parsing HTML as JSON
- CQ2: Privacy policy missing data disclosures for messages and third parties

**Content improvements:**
- H9/IA5: Broaden language beyond "running program" for shelters and community centers
- H18: Become-organizer page has very thin content (31 words)
- T4: Become-organizer page lacks process transparency

---

### Backlog (low priority)

**Minor polish:**
- V1: Primary button padding inconsistent across the site
- V2: Delete Account button styled differently in two places
- H19: Pledge status labels are organizer-centric — confusing to donors
- S1: Generic meta descriptions shared across multiple pages
- H15: No breadcrumbs on need detail or org profile pages
- H16: "Extras Welcome" badge purpose unclear — needs tooltip
- H17: Dead-end pages with no onward navigation (/about, /contact, /privacy)
- MSG4: Email notification says "Reply" but footer says "do not reply"
- F1/H20: No character counter on text fields with maxLength constraints
- H21: Duplicate org settings in dashboard and profile — confusing
- AD3: No denial confirmation dialog on admin requests page
- B2: GET /api/cron/daily returns 500 instead of 405

**Future feature ideas:**
- H13: No images anywhere on the site — hero images, org logos, need photos
- PL3: No pledge progress indicator ("3 of 5 pairs pledged")
- H12: Donor pledge form doesn't pre-fill email/name for authenticated users
- N6: No notification history or in-app notifications
- P5: No self-service data export mechanism
- CQ1: About and Why pages overlap significantly — consider merging
- CQ4: No source citations for statistics on /why page
- H14: Footer doesn't include "Pledge Drives" or "Become Organizer"
- T5: No legal entity information visible anywhere

**Optimization opportunities:**
- Saved searches, donor reputation/history, read receipts on messages
- Shipping label generation, PWA/push notifications, admin analytics dashboard
