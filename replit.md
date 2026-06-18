# PureX

A premium adult video aggregator with a cinematic dark design, multi-source aggregation (Eporner/Pornhub/Redtube), local JWT auth, and admin moderation.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/purex run dev` — run the React frontend (port 24257)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 + better-sqlite3 (WAL mode)
- Auth: Local JWT (jsonwebtoken + bcryptjs), 30-day tokens stored in localStorage
- DB: SQLite (not Postgres — replit free tier), path: `purex.db` at workspace root
- Frontend: React + Vite + Wouter + TanStack Query + Framer Motion + Tailwind v4
- Design: Charcoal dark, signal-red primary, ember accent, royal gold — all OKLCH
- Build: esbuild (CJS bundle for API), Vite (frontend)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for API contract
- `lib/api-spec/orval.config.ts` — controls codegen (React Query hooks + Zod schemas)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod validation schemas
- `artifacts/api-server/src/` — Express API server
- `artifacts/api-server/src/db/index.ts` — SQLite setup (WAL, indexes)
- `artifacts/api-server/src/db/seed.ts` — category seeds + default admin user
- `artifacts/api-server/src/aggregator/index.ts` — multi-source aggregator (runs every 30min)
- `artifacts/api-server/src/routes/` — all API routes
- `artifacts/purex/src/` — React frontend
- `artifacts/purex/src/index.css` — full OKLCH design system
- `artifacts/purex/src/lib/auth.tsx` — AuthContext with JWT
- `artifacts/purex/src/components/` — all UI components
- `artifacts/purex/src/pages/` — all page components
- `purex.db` — SQLite database (WAL mode, created at runtime)

## Architecture decisions

- SQLite instead of Postgres to keep zero external dependencies on free tier
- better-sqlite3 externalized in esbuild (native .node must be compiled; run `npm rebuild better-sqlite3` if binary missing)
- JWT stored in localStorage (not cookies) for simplicity across the proxy
- Performers/studios use query params (`/api/performers?name=...`) not path params, to avoid Orval type collision in codegen
- Frontend uses direct `apiFetch()` (not generated hooks) for simpler auth header injection
- Aggregator runs on startup + every 30min, using `INSERT OR IGNORE` to deduplicate by `external_id`

## Product

- **Home**: Cinematic hero carousel (top 5 trending), Top 10 chart, multiple video rows (trending/editor picks/most viewed/recent), category strip
- **Trending**: Full grid with filter tabs (trending/views/recent/random)
- **Categories**: All 50 categories with color-coded icons and video counts
- **Video page**: Embed player, meta (duration/views/tags/performers/studio), related videos
- **Search**: Full-text search across titles and tags with autocomplete suggestions
- **Auth**: Email/password register + login
- **Submit**: User video submission (embed code + URL)
- **Dashboard**: User's submitted videos with status
- **Admin**: Stats panel + video moderation (approve/reject/editor-pick/delete)

## Default Admin

- Email: `admin@purex.com`
- Password: `admin123`
- Change this in production!

## Gotchas

- `better-sqlite3` requires native compilation. If the server fails with "Could not locate bindings file", run: `cd /home/runner/workspace/node_modules/.pnpm/better-sqlite3@12.11.1/node_modules/better-sqlite3 && npm rebuild`
- Orval regenerates `lib/api-zod/src/index.ts` — never manually edit it
- Performers/studios must use query params (`?name=...`) not path params to avoid Orval type collision (FetchPerformerParams)
- The purex artifact's BASE_URL already includes a trailing slash — strip it before constructing `/api/...` URLs

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
