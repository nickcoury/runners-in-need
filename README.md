# Runners In Need

Connecting runners who have extra gear with organizations serving runners in need.

**Live site:** https://runners-in-need.pages.dev

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
- **Cloudflare Pages** — Hosting (free tier)

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

- [Product Requirements](docs/PRODUCT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Design System](docs/DESIGN-SYSTEM.md)
- [Market Research](docs/MARKET-RESEARCH.md)
- [Legal Analysis](docs/LEGAL.md)
- [Incident Playbook](docs/INCIDENT-PLAYBOOK.md)
- [Setup Guide](SETUP-GUIDE.md)
- [TODO](TODO.md)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Secrets

Copy `.env.example` to `.env` and fill in values. See the example file for all required keys. Keep a backup of your `.env` somewhere secure — it's the only file not tracked in git.
