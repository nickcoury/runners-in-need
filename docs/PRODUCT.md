# Runners In Need - Simple PRD

## Product Summary

Runners In Need is a two-sided donation platform for running gear.

It connects:

- Donors who have usable shoes, apparel, and accessories
- Verified organizations that support runners and need gear for their athletes or members

The product is built around direct matching. Organizations post specific needs. Donors browse those needs, pledge what they can provide, and coordinate delivery with the organization.

## Problem

Running is relatively low-cost compared with many sports, but gear is still a real barrier. Shoes, warm layers, sports bras, socks, spikes, and race gear are expensive. At the same time, many runners accumulate usable gear they no longer need.

Today, those two sides are poorly connected:

- Organizations usually ask for help through generic fundraising or offline outreach
- Donors often have gear to give but do not know who needs it
- Existing donation programs tend to be bulk, indirect, or not running-specific

## Product Goal

Make it easy to move usable running gear from people who have it to programs that need it, with enough trust, specificity, and communication to make fulfillment realistic.

## Users

### Donors

- Anonymous donors can pledge with an email address only
- Signed-in donors can manage pledges in a dashboard
- Typical donors are individual runners, run clubs, stores, race communities, and supporters

### Organizers

- Verified organizers post and manage needs for a school, nonprofit, or community running program
- Organizers manage delivery settings, shipping options, and incoming pledges

### Admins

- Review organizer applications
- Review pledge drive submissions
- Moderate access to the supply side of the marketplace

## Core Product Principles

- Specific requests beat generic fundraising
- Public browsing should be easy and fast
- Donating should not require account creation
- Trust is enforced on the organizer side, not the donor side
- Coordination happens directly between donor and organizer
- The UI should be simple, legible, and operationally clear

## Main User-Facing Areas

### 1. Home / Browse

The homepage is the browse experience.

It supports:

- Search by keyword
- Category filtering
- List and map views
- Distance sorting using browser geolocation or Cloudflare location headers
- Mobile and desktop browse toggles

Each need card shows:

- Category
- Title
- Organization
- Location
- Short description
- Pledge count
- Time remaining
- Link to the need detail page

### 2. Need Detail

Each need detail page is the core conversion page for donors.

It includes:

- Full need description
- Organization name and location
- Delivery options and optional shipping instructions
- Existing pledges
- In-thread messages when the viewer is allowed to participate
- Pledge form
- Copy-link sharing action

### 3. Authentication

Users can sign in with:

- Email magic link
- Google OAuth

Authentication is used to:

- Access the dashboard and profile
- Post needs
- Apply to become an organizer
- Participate in certain logged-in workflows

Donors are not required to sign in before making a pledge.

### 4. Become an Organizer

Signed-in users can apply to become organizers.

The form collects:

- Organization name
- Organization description
- Optional public URL

Applications are reviewed by admins. Approved users are promoted to organizer and receive an organization record.

### 5. Post a Need

Verified organizers can create needs.

A need includes:

- Category
- Title
- Description
- Extras welcome toggle
- Expiration window
- Delivery methods and instructions

Needs inherit the organization’s location and map coordinates.

### 6. Dashboard

The dashboard is role-aware.

Organizer dashboard:

- My Needs
- Incoming Pledges
- Account

Donor dashboard:

- My Pledges
- Account

Organizers use the dashboard to manage needs and pledge status.
Donors use it to review the pledges associated with their account.

### 7. Profile

Signed-in users can:

- Update their display name
- View personal stats
- Sign out
- Delete their account

Organizers can also manage public organization details from profile/account surfaces.

### 8. Organization Profile

Each organization has a public page showing:

- Name
- Verification state
- Location
- Description
- Active needs

This page exists to build donor trust and help repeat giving.

### 9. Pledge Drives

The product includes a pledge drive layer for larger collection events.

Users can:

- Browse upcoming and past pledge drives
- Submit a pledge drive proposal when signed in

Admins can review all submitted drives.
Organizations can opt into receiving pledge-drive donations.

### 10. About / Why / Contact / Legal / Error Pages

These support trust and comprehension:

- `/about` explains the product and routes users to their next action
- `/why` explains the market need and product rationale
- `/contact`, `/terms`, and `/privacy` support legitimacy and operations
- `/404` and `/500` provide branded recovery states

## Important Behaviors

### Need Lifecycle

Needs move through these states:

- `active`
- `partially_fulfilled`
- `fulfilled`
- `expired`

Important rules:

- Needs expire automatically
- Organizers can edit needs
- Soft deletion marks a need as expired instead of removing it
- Expired or fulfilled needs no longer accept new pledges

### Pledge Lifecycle

Pledges move through these states:

- `collecting`
- `ready_to_deliver`
- `delivered`
- `withdrawn`

Important rules:

- Anonymous donors can create pledges
- Signed-in donors attach a `donorId` to their pledge
- Organizers manage operational status changes
- Donors receive status emails when the pledge changes

### Partial Fulfillment

When a pledge is delivered but a need is not fully resolved:

- The original need can move to `partially_fulfilled`
- The system can generate suggested “remaining need” text
- Organizers can continue the request instead of starting from scratch

This is one of the product’s most important workflow details because it keeps real-world fulfillment messy but manageable.

### Messaging

Messaging is attached to pledges inside a need.

Allowed participants:

- Organization members for that need
- The authenticated donor tied to the pledge

Anonymous donors do not participate in in-app messaging threads. Their follow-up path is email-based.

### Delivery and Shipping

Organizations can configure how donations should be handed off:

- Shipping
- Drop-off
- Meet-up
- Other custom instructions

Optional shipping addresses can be stored and shown where appropriate.

### Geographic Relevance

Location matters in browse and fulfillment.

The product supports:

- Public city/state display
- Stored coordinates for map placement
- Distance-based sorting
- Automatic re-geocoding when organization location changes

### Reminders and Automation

A daily cron endpoint handles operational automation:

- Need expiry reminders
- Automatic expiration of overdue needs
- Withdrawal of stale pledges
- Fulfillment reminders
- Auto-closing needs that remain fully delivered for a long period

## Trust, Safety, and Access Rules

### Roles

- `donor`
- `organizer`
- `admin`

### Access Model

- Public users can browse public content
- Auth is required for dashboard, profile, posting, admin, and organizer application flows
- Admin-only pages are protected in middleware and again at page level

### Anti-Abuse

The system uses multiple layers:

- Organizer approval queue
- CSRF protection
- Honeypot fields
- Turnstile on anonymous pledge/auth flows when configured
- Verified email identity for authenticated users

## Non-Goals

The product does not:

- Handle payments
- Handle shipping transactions or labels
- Run a generalized marketplace for all sports
- Replace local organizer judgment about what is actually useful

## Success Criteria

The product is successful when:

- Donors can understand the mission quickly
- Public browsing feels active and trustworthy
- Anonymous pledging is low-friction
- Organizers can post specific needs and actually fulfill them
- The system supports repeat use without creating operational chaos

## Current Product Shape

As implemented today, Runners In Need is a functioning operational marketplace with:

- Public browse, map, and search
- Anonymous and authenticated pledging
- Organizer verification
- Need posting and editing
- Pledge messaging and status tracking
- Organizer and donor dashboards
- Public organization profiles
- Pledge drives
- Admin review tools
- Automated lifecycle reminders

This is not a concept doc. It describes the product that currently exists and the behaviors that matter most to preserve as it evolves.
