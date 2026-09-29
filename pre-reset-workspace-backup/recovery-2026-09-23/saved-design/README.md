# Dreamscape frontend

The app includes trekking and region discovery, activity pages, an about page, full journal articles, gallery, reviews, company contact details, accounts, booking requests and a staff dashboard in the Dreamscape design. See [INTEGRATION.md](INTEGRATION.md) for the complete route map, backend contract, validation and handoff.

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
- `POST /api/inquiries` sends `full_name`, `email`, `message`, `inquiry_type: GENERAL` and `lead_source: website` to Django. It reports success only after the backend confirms the saved inquiry.
- With no backend URL, journeys are explicitly labelled sample data. Inquiries return an honest unavailable message; nothing is saved or sent.
- The backend's trip list has no image field. Live trips display their destination instead of an unrelated photo. Add a media URL to the backend contract to support live card images.
- Region, category and duration filters work locally. Season and party size are planning preferences carried into journey inquiries, not availability checks.

## Included

The homepage now uses a prominent “Beyond the Horizon” hero, custom keyboard-accessible journey pickers (arrows, Home/End, type-to-select, Escape), a warmer editorial palette, and an animated Nepal preview opened by Explore Treks.

### Add the real trekking film

Place your MP4 in `public/videos/nepal-trekking.mp4`, then set `NEXT_PUBLIC_TREK_FILM_URL=/videos/nepal-trekking.mp4` in `.env.local` and rebuild/restart. A hosted video URL also works. The real video uses native playback controls and starts when the visitor presses Play. With no URL, a clearly labelled animated photographic preview offers pause/play, scene selection, and reduced-motion support. Use `node scripts/check-experience.mjs` with the server running to test the selectors and preview.

Homepage sections, responsive header/mobile menu, journey filters and empty/error states, trip detail pages, inquiry forms, keyboard-accessible native dialogs, entrance/reveal/hover animations and reduced-motion support. Assets come from the provided Figma file; source URLs are recorded in `scripts/figma-assets.json`.

## Content and integration status

- Figma refused the storytelling section's design-context request due to its Starter plan quota. That section uses its available text/layout metadata and already-exported collage images; review it against the original.
- Public pages, articles, gallery and staff dashboard are implemented. The shared footer links to every main section. The dashboard requires a real staff account and connected Django service.
- Email is dreamscapetrek@gmail.com. WhatsApp currently displays a clearly marked placeholder. Set NEXT_PUBLIC_COMPANY_WHATSAPP in .env.local to the real company number including country code, then rebuild/restart. Shared defaults live in src/lib/company.ts.
- Journal includes three original articles and can show published backend guides. Reviews use published backend records and moderation; no fake testimonials are displayed. The former newsletter form now links to the journal.
- Privacy and booking terms pages contain website notes marked as pending company approval. Review these and the curated editorial copy before publication.
- Booking lookup/payment pages show backend-authorized records. Payment processing remains unavailable because the supplied backend has no registered payment routes. No card details are collected.
- Run the flows against the real staging backend and email setup before launch; current automated integration tests use an isolated local fixture. Keep backend abuse protection enabled.
- The duplicate legacy source is preserved outside the app in reviews/legacy-merged-frontend to prevent conflicting routes.

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
node scripts/check-experience.mjs
node scripts/check-pages.mjs
node scripts/check-integration.mjs
```

The UI check covers desktop/mobile overflow, images, filtering, trip-to-inquiry interaction, unsent inquiries, journal links and reduced motion. The page check verifies 21 new public/utility pages at four widths, article search, contact details, gallery keyboard controls and protected/unavailable states. Screenshots go to ignored `test-results/`.

Setup references: https://nextjs.org/docs/app/getting-started/installation and https://tailwindcss.com/docs/installation/framework-guides/nextjs.
