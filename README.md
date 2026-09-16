# Dreamscape frontend

The current app now includes trek discovery, itinerary pages, inquiries, accounts and booking requests in the existing Dreamscape design. See [INTEGRATION.md](INTEGRATION.md) for the complete route map, backend contract, validation and handoff.

Next.js App Router, React, TypeScript and Tailwind CSS. The responsive homepage is based on Figma frame `222:2` (home 2nd option fixed). Design images, SVG exports and Plus Jakarta Sans are served locally.

## Run locally

Requires Node.js 20.9 or newer (tested on Node 24).

```powershell
npm install
npm run dev
```

Open http://127.0.0.1:3000. Edit `src/components/home.tsx` for the page and `src/app/globals.css` for styling and motion.

## Connect your friend's Django backend

Copy `.env.example` to `.env.local` and set:

```dotenv
BACKEND_API_URL=http://127.0.0.1:8000/api/v1
```

Restart Next.js after changing the environment. Browser requests go through the same-origin Next.js routes; the Django address remains server-side, avoiding browser CORS setup for these calls. The backend must be running and have catalog data.

- `GET /api/trips` calls Django `GET /api/v1/trips/?page_size=100` and unwraps the standard success/pagination envelope. All numbered result pages are loaded with a 100-page guard.
- `POST /api/inquiries` sends `full_name`, `email`, `message`, `inquiry_type: GENERAL` and `lead_source: website` to Django. It reports success only after the backend confirms delivery.
- With no backend URL, journeys are explicitly labelled sample data. Inquiries return an honest unavailable message; nothing is saved or sent.
- The backend's trip list has no image field. Live trips display their destination instead of an unrelated photo. Add a media URL to the backend contract to support live card images.
- Region, category and duration filters work locally. Season and party size are planning preferences carried into journey inquiries, not availability checks.

## Included

The homepage now uses a prominent “Beyond the Horizon” hero, custom keyboard-accessible journey pickers (arrows, Home/End, type-to-select, Escape), a warmer editorial palette, and an animated Nepal preview opened by Explore Treks.

### Add the real trekking film

Place your MP4 in `public/videos/nepal-trekking.mp4`, then set `NEXT_PUBLIC_TREK_FILM_URL=/videos/nepal-trekking.mp4` in `.env.local` and rebuild/restart. A hosted video URL also works. The real video uses native playback controls and starts when the visitor presses Play. With no URL, a clearly labelled animated photographic preview offers pause/play, scene selection, and reduced-motion support. Use `node scripts/check-experience.mjs` with the server running to test the selectors and preview.

Homepage sections, responsive header/mobile menu, journey filters and empty/error states, trip detail pages, inquiry forms, keyboard-accessible native dialogs, entrance/reveal/hover animations and reduced-motion support. Assets come from the provided Figma file; source URLs are recorded in `scripts/figma-assets.json`.

## Remaining content/integration work

- Figma refused the storytelling section's design-context request due to its Starter plan quota. That section uses its available text/layout metadata and already-exported collage images; review it against the original.
- The homepage and `/destinations` are implemented with shared navigation. Destinations includes region filters/search, Figma region imagery, relevant trek results, a planning FAQ and inquiry dialog. Region copy is curated page content; trip results use the existing API adapter. Treks, detail, contact, account and booking pages are now implemented. Full about/blog editorial pages and the admin dashboard remain future work.
- Newsletter has no backend endpoint. Submitting it displays an unavailable notice and does not store the email.
- Article bodies and policy documents were not provided. Their links open honest content notices and a path to ask the team.
- Testimonials, trust claims and trip prices are design copy; review them before publication. Live departure booking requests are implemented; payment capture is not.
- Add production abuse protection/rate limiting for public inquiries at the hosting/backend layer before launch.

## Checks

```powershell
npm run build
npm run typecheck
npm test
# Start the production server in another terminal, with no BACKEND_API_URL:
npm run start
# Chrome must be installed for this check:
node scripts/check-ui.mjs
node scripts/check-destinations.mjs
```

The UI check covers desktop/mobile overflow, images, filtering, trip-to-inquiry interaction, unsent inquiries, newsletter notices and reduced motion. Screenshots go to ignored `test-results/`.

Setup references: https://nextjs.org/docs/app/getting-started/installation and https://tailwindcss.com/docs/installation/framework-guides/nextjs.
