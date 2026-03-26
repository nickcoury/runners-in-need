# Runners In Need

Connecting runners who have extra gear with organizations serving runners in need.

| Environment | URL |
|-------------|-----|
| **Production** | https://runnersinneed.com |
| **Dev** | https://runners-in-need-dev.nickcoury.workers.dev |
| **Local** | http://localhost:4321 |

## Quick Start

```bash
npm install
cp .env.example .env  # Fill in your values
npm run dev            # http://localhost:4321
```

## Stack

- **Astro** — Static-first framework with React islands for interactivity
- **Tailwind CSS** — Utility-first styling
- **Turso** — SQLite database (via Drizzle ORM)
- **Auth.js** — Magic links + OAuth authentication
- **Cloudflare Workers** — Hosting with SSR (free tier)

## Project Structure

```
src/
├── actions/        # Server-side form handlers
├── components/     # React islands and Astro components
├── db/             # Database schema and connection
├── layouts/        # Page layouts
├── lib/            # Shared utilities
├── pages/          # Routes and API endpoints
└── styles/         # Tailwind CSS
```

## Documentation

- [Docs Index](docs/README.md)
- [TODO — Task List](TODO.md) — Prioritized work items
- [CLAUDE.md](CLAUDE.md) — AI agent context (project state, preferences, setup)
- [Product Requirements](docs/PRODUCT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Design System](docs/DESIGN-SYSTEM.md)
- [Market Research](docs/MARKET-RESEARCH.md)
- [Legal Analysis](docs/LEGAL.md)
- [Incident Playbook](docs/INCIDENT-PLAYBOOK.md)
- [Audit Archive](docs/audits/README.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Nick's TODOs](NICK-TODOS.md) — Items needing human decisions

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run check` | Run Astro type and route checks |
| `npm run preview` | Preview production build |
| `npm run test:smoke` | Run self-contained local smoke coverage |
| `npm run test:ci-smoke` | Run preview smoke coverage used in CI |
| `npm run test:prod-smoke` | Run production smoke coverage |
| `npm run verify` | Run the default pre-push typecheck + smoke path |

## Secrets

Copy `.env.example` to `.env` and fill in values. See the example file for all required keys. Keep a backup of your `.env` somewhere secure — it's the only file not tracked in git.

## Long-Term Health

- Use `npm run verify` as the default pre-push path.
- Keep `npm run check` passing so CI can enforce typed route and page health.
- Keep audits and screenshots under `docs/audits/`.
- Update `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, and `README.md` when product behavior or operational expectations change.
