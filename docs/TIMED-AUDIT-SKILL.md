# Timed Playwright Usability Audit — Skill Reference

Claude tends to end long-running tasks early, feeling like "enough work" was done. The fix: programmatic time tracking with a hard minimum.

## Setup

At the very start of the audit:

```bash
date +%s > /tmp/audit-start.txt
```

Read `USABILITY-AUDIT.md` before doing anything. Note existing findings so you don't duplicate them.

## Time Checks

Every 15-20 minutes, check elapsed time:

```bash
echo $(( ($(date +%s) - $(cat /tmp/audit-start.txt)) / 60 )) minutes elapsed
```

**Minimum duration: 3 hours (180 minutes).** Do NOT stop before this. If you feel "done", you're not — find more things to test.

## Personas

Use the personas defined in `USABILITY-AUDIT.md`. Cycle through each one. Don't skip any.

## What to Test

- **Every page** on the site, as each persona
- **Form submissions** — valid inputs, invalid inputs, empty submissions, boundary values
- **Mobile viewports** — 375x667 (iPhone SE), 390x844 (iPhone 14)
- **Desktop viewports** — 1280x720, 1920x1080
- **Keyboard navigation** — tab order, focus indicators, skip links
- **Screen reader accessibility** — ARIA labels, heading hierarchy, alt text
- **Error states** — network errors, validation errors, empty states
- **Auth flows** — signed in vs signed out behavior on every page
- **Cross-page navigation** — information architecture, back button, deep links
- **Edge cases** — long text, special characters, rapid clicks, browser resize

## How to Browse

Use the `dev-browser` skill or Playwright directly. Take screenshots of every issue. Actually fill out forms, click buttons, navigate between pages. Don't just look — interact.

## Output

Append new findings to `USABILITY-AUDIT.md`, organized by severity (critical > high > medium > low). Include:

- Date and total duration of the audit
- Screenshots or descriptions of each issue
- Which persona encountered it
- Viewport size when relevant

**Do not duplicate existing findings.** Only add NEW issues.
