# TODO — Runners In Need

Prioritized task list. See [NICK-TODOS.md](NICK-TODOS.md) for items needing human input.

---

## Remaining

_No open items. All features, bugs, and audit work completed as of 2026-03-14._

---

## Testing

74+ Playwright e2e tests + 5 CI smoke tests + 5 production smoke tests. Run with:
```bash
npm run dev       # start dev server first
npm run test:e2e  # run tests
```

CI smoke tests run automatically on deploy (via GitHub Actions). Production smoke tests run post-deploy against the live site.

---

## Notes for AI Agents

- **Always run tests** (`npm run test:e2e`) after making changes to verify nothing broke
- **Check the PRD** ([docs/PRODUCT.md](docs/PRODUCT.md)) for full feature specs
- **Check NICK-TODOS.md** for items that need human decisions before implementation
- **Deployment**: Push to `main` to deploy to production. Push to `dev` branch for staging.
- **Database**: Turso (remote SQLite). Schema in `src/db/schema.ts`, migrations in `drizzle/`
- **Secrets**: `.env.example` shows all required keys. Never commit `.env` files.
