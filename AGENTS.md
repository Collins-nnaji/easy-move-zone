# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is a Next.js 16 (App Router, Turbopack) real estate platform targeting Nigeria/Africa. It is a single service — no Docker, no local database, no microservices.

### Standard commands

See `package.json` scripts: `npm run dev`, `npm run build`, `npm run lint`, `npm start`.

### Key caveats

- **No lockfile**: The repo has no `package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml`. `npm install` generates a fresh lockfile each time.
- **Graceful degradation**: All external services (Neon PostgreSQL, OpenAI, iDrive E2, Resend, Twilio) are optional. When env vars are missing, the app falls back to in-memory seed data and hardcoded AI responses. The app is fully browsable without any secrets.
- **Database migrations**: SQL files under `db/` are run against a remote Neon instance via `node scripts/run-sql-file.mjs <file>`. This requires `DATABASE_URL` or `NEON_DATABASE_URL` and is not needed for local dev with seed data.
- **Middleware deprecation warning**: Next.js 16 emits `The "middleware" file convention is deprecated. Please use "proxy" instead.` during build — this is expected and non-blocking.
- **Dev server port**: Defaults to 3000 (`npm run dev`).
