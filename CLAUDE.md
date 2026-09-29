@AGENTS.md

# Dreamscape Treks — frontend

Next.js 16 (App Router) + React 19 public site and admin UI for Dreamscape Treks. See root `../CLAUDE.md` for cross-project rules (id-based URLs, no filler copy, backend rate limit) — they apply here too.

## Stack & conventions
- Styling: Tailwind CSS v4 (`@tailwindcss/postcss`), no CSS-in-JS.
- Animation: `motion` (Framer Motion's successor package).
- Image lightbox: `photoswipe`.
- Data/content modules live under `src/lib/` (e.g. `catalog.ts`, `homepage-regions.ts`, `nepal-zones.ts`, `links.ts`) — one file per content domain, imported by the components that render them. When a component references a name like `homepageRegions` or `nepalZones`, it must be imported from its `src/lib/*` module; there's no global scope providing these.
- `src/lib/assets.ts`'s `asset()` helper resolves image names to paths; components wrap it in small local helpers (see `Photo`/`Icon` in `src/components/home.tsx`) rather than calling `asset()` inline everywhere.
- Client components are explicitly marked `'use client'` at the top of the file (see `home.tsx`).

## Commands
- `npm run dev` — start the dev server (binds `127.0.0.1`).
- `npm run lint` — ESLint.
- `npm run typecheck` — `tsc --noEmit`. Run this after non-trivial edits to `src/**/*.{ts,tsx}` — a missing import or undefined reference (e.g. a `ReferenceError` at runtime) shows up here before it ever reaches the browser. A `PostToolUse` hook in the project root's `.claude/settings.json` also runs this automatically after edits to `frontend/src/**/*.{ts,tsx}`.
- `npm test` — Node's built-in test runner over `tests/*.test.ts`.

