# Dreamscape frontend handoff

The active app is `dreamscape-frontend`. The friend's ZIP remains separately extracted in `reviews/friend-frontend` for reference. Its demo authentication and booking actions are not used in this app.

Duplicate route groups and their unused dependencies were preserved in `reviews/legacy-merged-frontend` after the old source was copied alongside the active app. Keep that reference outside `src`; restoring both sets of pages creates conflicting URLs.

## Run and connect

```powershell
npm install
# Copy .env.example to .env.local, then set the backend address below.
npm run dev
```

```dotenv
BACKEND_API_URL=http://127.0.0.1:8000/api/v1
```

Start and seed Django separately using its own PostgreSQL/Redis configuration. No database credentials were supplied or invented. Restart Next.js after setting the environment. The URL stays on the server; the browser uses same-origin `/api` routes.

Without that setting, the catalogue contains four clearly labelled sample journeys. Samples cannot be booked, and submissions return an unavailable response. When a configured backend fails, the app shows an error instead of silently substituting samples or success.

## Company contact details

The email is `dreamscapetrek@gmail.com`. The contact and payment pages display the WhatsApp placeholder `+977 98X XXX XXXX` until a real number is supplied. The rejected number from the old source is not used. Set these public values in `.env.local`, then rebuild/restart:

```dotenv
NEXT_PUBLIC_COMPANY_EMAIL=dreamscapetrek@gmail.com
# Actual company number including its country code; leave blank for the placeholder.
NEXT_PUBLIC_COMPANY_WHATSAPP=
```

`src/lib/company.ts` is the shared configuration. With a valid configured number, the placeholder becomes a WhatsApp link. Email opens the visitor's mail app; clicking it is not a claim that a message was delivered.

## Pages and actual behaviour

- `/`: existing Dreamscape homepage, glass navigation, custom selectors and animated film preview. Cards now lead to itinerary pages.
- `/destinations`: existing region discovery, filters and journey links.
- `/treks`: searchable catalogue with region, duration and difficulty filters, plus price/duration sorting.
- `/treks/[slug]`: overview, day-by-day itinerary, inclusions, packing list and available departure dates. Missing content is identified instead of invented.
- `/contact` and `/inquire`: inquiry forms with name, email, optional dates/group size and backend-issued references.
- `/login`, `/register`, `/forgot-password`, `/reset-password`: actual Django account requests. Reset confirmation accepts the UID/token supplied by the current backend email.
- `/account`: authenticated booking list and pagination; current status and amounts come from Django.
- `/booking?trek=...&departure=...`: available live departures only. Submits contact and traveller details to Django, which locks seats, calculates totals and creates the booking reference. The receipt shows the returned status. No payment is collected and no email delivery is asserted.
- `/about`: Dreamscape story, approach and planning invitation.
- `/destinations/[slug]`: Everest, Annapurna, Manaslu and Dolpo region pages with relevant catalogue results. `/regions` and `/regions/[slug]` redirect to their destination pages.
- `/activities` and `/activities/[slug]`: trekking, cultural journeys, expeditions and private journeys, with relevant catalogue results where available.
- `/blog` and `/blog/[slug]`: searchable journal with three complete original articles, plus published Django content guides when connected. Local article slugs stay available when the backend is connected. CMS content renders as text with a conservative Markdown subset, never executable HTML. `/journal` redirects here.
- `/gallery`: nine design images, category filters and a keyboard-accessible lightbox. It is identified as a visual collection, not documentation of actual departures.
- `/reviews`: published per-trip reviews and a submission form connected to Django moderation. No fabricated testimonials; sample mode has a clear empty state.
- `/privacy-policy` and `/terms-conditions`: substantive website/process notes explicitly marked as pending company approval. They are not approved company legal policies.
- `/admin`: staff-only inquiries/bookings, backend pagination, search within the current page, record detail and inquiry status editing. Every request checks the backend role (`ADMIN` or `SALES_AGENT`). Customer accounts cannot access it. Only displayed fields are forwarded to the browser.
- `/payment` and `/booking/confirmation/[reference]`: authenticated booking lookup and current amounts/status. A reference URL alone never displays a successful booking or payment. Guest bookers should contact the team with their saved reference; lookup requires backend-authorized account access.
- `/search`: forwards the query to the trek catalogue. Unknown destinations, activities, treks and articles return a not-found page.

## API contract

| Frontend | Django |
|---|---|
| `GET /api/trips` | `GET /api/v1/trips/` with all numbered result pages |
| `GET /api/trips/[slug]` | Trip detail plus all `/trips/[slug]/departures/` pages |
| `POST /api/inquiries` | `POST /api/v1/inquiries/`; snake_case fields, `GENERAL` or `JOURNEY` |
| `POST /api/auth/login`, `/register` | Matching `/api/v1/auth/` endpoints |
| `POST /api/auth/reset`, `/confirm` | `/auth/password/reset/`, `/auth/password/reset/confirm/` |
| `GET /api/account?page=1` | `/users/me/` plus authenticated `/bookings/?page=1` |
| `POST /api/bookings` | `POST /api/v1/bookings/` with `departure_id`, contact fields, `payment_type`, `passengers` |
| `GET /api/bookings/[reference]` | Authenticated booking detail; only receipt fields are returned |
| `GET`, `POST /api/reviews` | `/trips/[slug]/reviews/`; public published list and moderated submissions |
| `GET /api/admin`, `PATCH /api/admin` | Staff-verified inquiries/bookings list/detail and inquiry status update |
| Server-rendered journal | `/content/guides/` and `/content/guides/[slug]/` |

Responses must use Django's `{success, data, message}` envelope. Validation errors are preserved; a success HTTP status with an error envelope is rejected. Catalogues and departure lists decode `data.results`. The adapter follows numbered pages on the configured API origin, not arbitrary upstream links, with a 100-page guard.

Access tokens use HttpOnly, SameSite cookies (Secure on HTTPS). They are not returned to client JavaScript or stored in localStorage. Refresh tokens are not retained: after the backend access token expires, sign in again. Sign-out removes the browser session. Writes check the browser Origin; all sensitive API responses disable caching. No passport/insurance information is kept in browser storage or echoed on the receipt.

Booking forms disable repeat submissions while pending and stop resubmission after an ambiguous network/server result. The backend does not provide an idempotency-key contract, so the team should check the booking record before retrying an uncertain submission. Displayed estimates are not submitted as authoritative prices.

## Validation

```powershell
npm run build
npm run typecheck
npm test
node scripts/check-integration.mjs
# With the preview running on port 3000 and BACKEND_API_URL empty:
node scripts/check-ui.mjs
node scripts/check-destinations.mjs
node scripts/check-experience.mjs
node scripts/check-pages.mjs
```

The integration script starts an isolated local API fixture and a Next.js server on port 3011. It checks envelope/pagination handling, outages, rejected credentials, HttpOnly cookies, staff/customer authorization, inquiry status edits, receipt privacy, review moderation, CMS rendering, seat/passport validation, backend pricing, end-to-end forms and responsive layouts. It creates no real accounts, inquiries, reviews or reservations. The page check covers 21 public/utility pages at 320, 390, 768 and 1440 pixels, contact links, article search, gallery keyboard/focus behavior and honest unavailable states. Chrome is required. Screenshots are saved in ignored `test-results/`.

## Before public launch

Run the same flows against a seeded staging Django instance, with the actual database and email setup. That has not been verified here. The backend's email tasks can fail without failing the API request; a saved record is not proof of delivered mail.

The trip serializers currently provide no image URL, so live cards use a destination treatment instead of assigning an unrelated sample photograph. Add a documented media field before enabling live trip images.

Payment pages are implemented, but payment capture is not available: the supplied Django payments URL module registers no endpoints. Its unused gateway/FX placeholders are not treated as a working payment service. Connect and verify a real provider before accepting payments.

The newsletter placeholder has been replaced by a working journal link. Real traveller reviews come from Django; the former sample testimonial was removed. The company must approve policy wording, curated region/editorial copy and design images before publishing. Supply the real WhatsApp number and trekking film when available. Keep backend throttling enabled for public endpoints.
