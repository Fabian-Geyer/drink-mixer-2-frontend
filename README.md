# drink-mixer-2-frontend

This is one of my hobby projects developed in my free time.
The machine is able to perfectly mix drinks based on a database of recipes.
This repository contains the frontend code used as an interface to the user.

## Stack

Vue 3 + TypeScript, built with Vite. UI components from
[shadcn-vue](https://www.shadcn-vue.com/) on Tailwind CSS v4. Pinia for local
UI state, [TanStack Query](https://tanstack.com/query) for server state.
Vitest for unit tests, Playwright for e2e tests. Package manager is pnpm.

Targets a fixed 800x480 touchscreen (Raspberry Pi kiosk) - see
`REQUIREMENTS.md` for the full brief.

## Setup

Requires Node.js >=20.19 and [pnpm](https://pnpm.io/). If you don't have
pnpm yet, enable it via Node's built-in Corepack:

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

Install dependencies:

```bash
pnpm install
```

Copy the example env file and adjust if needed (defaults point at a backend
running locally on `http://127.0.0.1:5055`):

```bash
cp .env.example .env
```

## Running the app

The frontend expects the [backend](../backend) to be running separately
(see `backend/README.md` - typically `uv run uvicorn coma2.main:app --port
5055` from `backend/`, after `uv run alembic upgrade head`).

Start the dev server:

```bash
pnpm dev
```

Serves at `http://localhost:5173` with hot reload. Bound to `0.0.0.0` so it's
also reachable from another device on the network (e.g. testing against the
Pi's touchscreen from a laptop).

## Building

```bash
pnpm build      # type-checks and builds to dist/
pnpm preview    # serve the production build locally
```

## Linting, formatting, type-checking

```bash
pnpm lint         # eslint --fix
pnpm format       # prettier --write src/
pnpm type-check   # vue-tsc --build
```

## Testing

Unit/component tests (Vitest):

```bash
pnpm test:unit
```

End-to-end tests (Playwright, runs against a real dev server it starts
itself). First-time setup needs the browser binaries:

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

All e2e specs run under a `kiosk-800x480` project (`playwright.config.ts`)
matching the real device viewport.

## Project status

Work in progress rewrite (see `REQUIREMENTS.md`). Currently in place: the
app shell, dark kiosk theme, and bottom navigation between Order / Barkeeper
/ Status / Settings - the screens themselves are still placeholders.
