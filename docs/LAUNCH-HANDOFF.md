# Website content and launch handoff — September 2026

## Editing the website
Open `/admin` directly and sign in with a backend ADMIN account. The public Staff Access footer link has been removed; authentication remains required.

- **Settings**: homepage photo, caption and location; homepage destination, difficulty and budget filter options; Nepal and Beyond Nepal titles, descriptions and images; admin sign-in background; YouTube preview title, description and thumbnail; office location and map settings; and Journal headline, introduction and featured story slug.
- **Destinations**: add or edit names, countries, photographs, introductory copy, highlights and travel style. NEPAL entries appear in Nepal; other countries appear in Beyond Nepal.
- **Blog studio**: change story introduction, cover, gallery and article content; publish or unpublish.
- **Treks**: existing backend trip editor manages itinerary, images, prices and departures. The current local database has no published trips; add verified trips before launch.
- **Brand artwork**: the footer uses the supplied vector in `public/images/dreamscape-landscape-final.svg`, with one stray pale sky path removed. Brand illustration and decorative linework stay in source control.
- **Our Story**: supplied company introduction is in `src/content/about.json`. This text remains source-controlled; it is not yet a CMS field.

Changes to CMS fields appear on refresh. The local JSON location is only a fallback when the CMS cannot be reached. Update both address and map query to move the map. The current pin is a Hotel Avalon landmark, not a verified office entrance.

## Local connection
The frontend's ignored `.env.local` points to `http://127.0.0.1:8000/api/v1`. Run Django on port 8000 and Next on port 3000. Never commit environment files, database files or credentials.

Existing photo stories and destination descriptions can be imported into a fresh backend:

```sh
python manage.py migrate
python manage.py import_website_content --asset-base-url https://YOUR-FRONTEND-DOMAIN --publish
```

This creates records only when their slug is missing. It never overwrites CMS edits or republishes drafts. Use the final HTTPS frontend origin in production; the local import uses localhost URLs. Uploaded replacements can be managed afterward in the CMS. Do not copy the local database into production unchanged.

## Git deployment
Frontend remote: `Dream-Scape-Pvt-Ltd/dremscape-frontend`.
Backend remote: `Dream-Scape-Pvt-Ltd/dreamscape-backend`.

Frontend: Node 22+, `npm ci`, then `npm run build`. Use a Next-compatible host or `npx next start --hostname 0.0.0.0 --port $PORT`. Set both API variables before building. Deploy the backend first, then set its final HTTPS API root in the frontend host.

Backend: see `DEPLOYMENT.md` in the backend repo. Production requires PostgreSQL, persistent media delivery, host/domain configuration, and a real admin account. This work has not been pushed or deployed; hosting/account selection remains open. Review and commit both repos together, including migrations, seed data, CMS components, vector artwork and lockfile.

## Outstanding operational setup
- Confirm hosting and final domain; configure HTTPS, CORS and media storage.
- Publish real trips with verified prices, dates and availability.
- Confirm the office map pin before launch.
- Set `YOUTUBE_API_KEY` to enable latest-upload playback. Without it the photographic preview and Dreamscape channel link remain available.
- Payment processing remains dependent on the backend team's merchant gateway. Do not present card payment as live before that integration is tested.

## Verification
`npm run build`; `npm run typecheck`; `npm run lint`; `npm test`; `node scripts/check-launch.mjs` against running local services.
Backend: `python manage.py test apps.content_cms.test_site_settings apps.content_cms.tests apps.destinations --noinput`.
The browser check covers eight routes at 1440, 768, 390 and 320 pixels, horizontal overflow, public Staff Access removal and the footer illustration. It does not simulate a real card transaction or production hosting.
