# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Klik is a Next.js 16 (App Router) application for managing multi-platform bots (LINE, Zalo, Telegram, Instagram). It connects to a separate backend API (`klik-server`). The frontend is a single-domain app that tracks the selected platform via `localStorage` (`platform_id`) and sends it as an `X-Platform-Id` header on API requests.

## Commands

```bash
yarn dev          # Start dev server (localhost:3000)
yarn lint         # ESLint
yarn build        # Production build
yarn start        # Start production server
```

Package manager: **yarn** (do not use npm/pnpm).

## Architecture

### Routing (App Router)

All routes live under `app/[locale]/` for i18n (vi/en). Key route groups:

- **Auth:** `login`, `register`, `reset-password`
- **Platform/Bot selection:** `select-platform`, `select-bot`
- **Store management:** `store/new`, `stores/[storeId]/settings/` (hours, staff, courses)
- **Public booking:** `(public)/store/[storeId]/booking`
- **Dashboard pages:** `dashboard`, `overview`, `conversation`, `user`

Root `app/page.tsx` redirects to `/login`.

### API Layer (`lib/api/`)

Each domain module (auth, bot, platform, store, media) follows the pattern:
- `client.ts` — API calls using `fetch` via `authorizedRequest`
- `types.ts` — request/response types matching the backend
- `mapper.ts` — transforms API responses to frontend models
- `index.ts` — public exports

Core infrastructure:
- `authenticated-request.ts` — adds Bearer token, handles 401 with automatic token refresh, deduplicates GET requests (800ms window)
- `trace-headers.ts` — generates `X-Trace-Id` per session for request tracing
- `auth-tokens.ts` / `auth-tokens-server.ts` — cookie-based token storage

Backend base URL configured via `NEXT_PUBLIC_API_URL` env var.

### State Management

- **Zustand** (`store/usePlatformStore.ts`) — tracks selected platform ID, persists to localStorage
- **React hooks/useState** — local form and component state
- **sessionStorage** — per-tab bot selection, trace IDs

### i18n

- Dictionary file: `lib/i18n.ts` (contains all vi/en translations)
- Server locale detection: `lib/i18n-server.ts` (reads `lang` cookie, then `Accept-Language`)
- When adding new text, always add both `vi` and `en` entries
- URL structure: `/{locale}/path`

### UI Patterns

- **TailwindCSS v4** with class-based dark mode
- **Sonner** for toasts — use helpers from `lib/toast.ts` (`notifySuccess`, `notifyError`, `notifyApiFailure`)
- **Confirm modal:** `components/common/confirm-modal.tsx`
- **Skeleton loaders:** `components/ui/skeleton.tsx` for async content
- **Theme:** `hooks/use-theme.ts` with light/dark, persisted to localStorage

## Key Rules

- Never hardcode user-facing text — always use the i18n dictionary (`lib/i18n.ts`)
- Preserve the routing flow: Auth -> Select platform -> overview/store/user/conversation
- Do not modify wildcard subdomain rewrite logic unless explicitly asked
- After changes, run `yarn lint` and `yarn build` (if changes affect runtime/routing)
- Reuse existing components; keep UI consistent across platforms (only color/logo differs)

## Documentation

- `AGENTS.md` — AI agent conventions and checklist
- `docs/ai/00-quickstart.md` — quick project context
- `docs/screens/README.md` — per-screen documentation
- `docs/ai/06-toast-confirm-feedback.md` — toast, modal, API error patterns
- `docs/ai/07-client-loading-skeletons.md` — skeleton loading patterns
- `docs/ai/08-dark-mode.md` — dark mode system
