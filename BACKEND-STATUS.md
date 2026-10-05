# Backend status (read before frontend work)

The Django backend (`dreamscape-backend` repo) is being fixed separately by another developer, using `dreamscape-backend/FIXES-BACKEND.md`.
**Do not edit the backend repo, and do not work around backend problems in the frontend.** If something fails because of the backend, note it in your report and move on.

## Known backend problems right now

| ID | Problem | What you'll see in the frontend |
|---|---|---|
| B1 | Anonymous API limit is 200 requests/day per IP. The Next.js server is one IP, so all visitors share it. The `X-Frontend-Key` bypass (frontend side done in F1) is **not implemented on the backend yet**. | After heavy local testing, `/api/trips`, `/api/departures` etc. return **429**. Restarting the local Django server resets the counter. Don't "fix" this in the frontend. |
| B2 | `GET/PATCH /api/v1/content/site-settings/` **does not exist on backend `main`** (the code is on unmerged branches). | Homepage/site settings always fall back to the defaults in `src/lib/site-settings.ts`. The admin **Site Settings editor cannot save** (404). Expected until B2 lands. |
| B3 | Production security defaults (`SECRET_KEY`, `DEBUG`, proxy IP). | Nothing visible. |
| B6 | SQLite path depends on the folder Django is started from. | If every endpoint returns 500, Django was started from the wrong folder. Start it from inside `dreamscape-backend`. |
| B7 | No seed data: the local DB has no trips, departures, guides, reviews or staff users. | Empty states everywhere. Trek detail pages, booking popup, forms and admin cannot be fully tested yet. |

## What the frontend must do once the backend fixes land

- **After B1:** set `FRONTEND_INTERNAL_KEY` in the frontend hosting environment (same value as the backend; server-only, never `NEXT_PUBLIC_`). Verify that 300+ page loads produce no 429.
- **After B2:** test the admin Site Settings editor end to end: edit homepage title/description/hero image, save, confirm the homepage updates (cache tag revalidation).
- **After B7 (seed data):** test with real data: `/treks/[slug]` detail pages, booking/inquiry popup, booking confirmation, contact / tailor-made / partner form submissions, login / register / password reset, account and partner portal, admin panel. Re-check the homepage with Featured journeys, Traveller stories and Journal filled in (layout, card heights, mobile).

## Running locally
From the `dreamscape` folder, `.claude/launch.json` has `backend` and `frontend` configs. Manually:
```
cd dreamscape-backend && .venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
cd dremscape-frontend && npm run dev
```
