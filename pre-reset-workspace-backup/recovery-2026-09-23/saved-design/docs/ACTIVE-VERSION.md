# Active approved website

The user approved THIS recovered design on 23 September 2026. Use this folder for frontend work; do not replace it with the older Git checkout's pages or styles.

Frontend: `recovery-2026-09-23/saved-design` — http://127.0.0.1:3002
Backend: `dreamscape-backend` — http://127.0.0.1:8000/api/v1
The ignored `.env.local` connects the two locally. No deployment or push was performed.

The public Staff Access footer link is removed. `/admin` remains available by URL. Inquiries and bookings use the existing recovered dashboard; photography/map and destination content controls are below it. Django's administrative backend remains at port 8000 `/admin/` for managing trips and blog records.

The approved public stylesheets, animated search navigation, carousel and photo showcase are preserved. Content is loaded into those components; changing API data must not require replacing the UI.

Protected guest booking access uses an HttpOnly cookie. The receipt API does not expose passports, insurance data or the backend access token. The same booking browser can reopen its receipt. Without the cookie, the team must provide secure access.

Current local backend has no published trip listings. Publish verified trips and departures in Django admin to populate the catalogue; no invented priced trips were added. Payment endpoints and booking/inquiry notification delivery are backend stubs and are not live integrations.

Verification: `npm run build`; `node scripts/check-approved-integration.mjs`. For real HTTP flow verification against a temporary Django database, set FRONTEND_DIR to this directory, then run `python manage.py test apps.common.test_frontend_integration --noinput` in the backend. No test bookings enter the real local database.

The pre-connection design source is preserved in the adjacent `approved-design-before-api` folder.
