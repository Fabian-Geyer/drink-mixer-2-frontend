# Frontend Rewrite — Requirements

Status: draft, agreed on branch `refactor-frontend` (companion backend branch: `add-status-endpoint`).

## Goal

Full rewrite of the CocktailMachineV2 frontend on modern, mainstream tooling, purpose-built for its actual deployment target: a fixed 7" 800x480 touchscreen on a Raspberry Pi, running as a kiosk.

## Stack

- **Vue 3** (kept from the old app) — not switching to React.
- **shadcn-vue + Tailwind CSS** instead of Quasar's component kit. Headless, composable components over a component-kit black box.
- **Vite** as the build tool (via shadcn-vue's standard scaffold, not the Quasar CLI).
- **Pinia** for UI-only state (e.g. active screen, PIN-gate unlocked state, keyboard visibility).
- **TanStack Query (Vue Query)** for all server state — cocktails, ingredients, slots, machine status. Replaces the hand-rolled `fetch` + try/catch pattern in the old Pinia stores (`src/stores/cocktails.ts` etc.) with proper caching, refetch, and loading/error states.
- **pnpm** as package manager.
- **Vitest** (+ Vue Testing Library) for unit/component tests.
- **Playwright** for e2e tests — and as the tool used during development to drive a real browser against the running dev server and visually verify UI at the actual 800x480 kiosk viewport.
- On-screen keyboard component (e.g. `simple-keyboard` or similar) for text entry, since the kiosk has no physical keyboard attached.

## Screens

1. **Order screen** (public/default) — browse available cocktails (only ones makeable given current slot contents), select one, trigger the machine to mix it.
2. **Barkeeper/admin screen** — CRUD for ingredients and cocktail recipes; assign ingredients to physical slots. Gated behind a PIN.
3. **Settings screen** — machine configuration (backend URL, etc.). Gated behind a PIN.
4. **Live machine status screen** — real-time view of what the machine is doing (mixing in progress / idle / error, slot levels). New capability — did not exist in the old app.

## Auth model

No user accounts. The Order screen is open to anyone at the kiosk. Barkeeper and Settings screens sit behind a simple PIN/passcode gate (client-side gate is acceptable for v1 — this is a single trusted physical device, the PIN is to stop casual guests from editing config, not a real security boundary).

## Kiosk / device constraints

- Target viewport: **800x480**, fixed physical size (Raspberry Pi Shield 7" LCD touchscreen).
- Must remain reasonably responsive/usable outside that exact viewport (not pixel-locked), but 800x480 is the viewport all visual QA happens against.
- Touch-first: large tap targets, no hover-dependent UI, no reliance on right-click/keyboard shortcuts.
- **Dark theme**, large touch targets, minimal chrome — appliance/kiosk look, not a general-purpose web app look.

## Live status: backend implication

The current backend (`coma2`, FastAPI) is REST-only — no push channel. This rewrite includes adding a **WebSocket or SSE endpoint** to the backend (branch `add-status-endpoint` in the `backend/` submodule) so the status screen gets pushed updates instead of polling. Exact shape (WebSocket vs SSE, message schema, what "machine state" even consists of today given there's no physical-machine-control code yet — only slot/ingredient/cocktail data) needs to be scoped concretely before implementation; this doc will be updated once that's designed.

## Out of scope / open questions for later

- Physical machine control integration (actually driving pumps/motors) — not addressed by this rewrite; the status endpoint will initially reflect whatever state the backend already models (slots, last order, etc.), not live hardware telemetry, unless/until that integration exists.
- PIN storage/rotation mechanism (hardcoded, env var, settings-screen-editable) — TBD during backend/status design pass.
- Deployment mechanism onto the Pi (systemd service, Docker, kiosk browser launch config) — not addressed here; this doc covers the app itself.
