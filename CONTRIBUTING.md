# Contributing

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Fill `.env` before testing anything that needs auth, email, Turnstile, or the Turso database.

## Standard Checks

Run these before pushing:

```bash
npm run verify
```

Use these when needed:

- `npm run test:e2e`: full local Playwright suite
- `npm run build`: production build validation
- `npm run test:ci-smoke`: preview smoke coverage used in CI
- `npm run test:prod-smoke`: production smoke coverage after deploy

## Change Expectations

- Keep public routes resilient in local development when secrets are missing.
- Do not commit `.env` or other secret material.
- Prefer updating docs when product behavior, operational steps, or audit locations change.
- Keep audit artifacts under `docs/audits/` instead of the repo root.

## Deploy Notes

- `main` deploys production through GitHub Actions.
- The `dev` branch is fast-forwarded from `main` and deployed to the Cloudflare Workers dev URL.
- CI now runs `npm run build` and preview smoke coverage before production deploy.
