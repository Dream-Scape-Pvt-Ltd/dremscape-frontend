# Dreamscape frontend handoff

The active app is `dreamscape-frontend`. The friend's ZIP remains separately extracted in `reviews/friend-frontend` for reference. Its demo authentication and booking actions are not used in this app.

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

## Pages and actual behaviour

- `/`: existing Dreamscape homepage, glass navigation, custom selectors and animated film preview. Cards now lead to itinerary pages.
- `/destinations`: existing region discovery, filters and journey links.
- `/treks`: searchable catalogue with region, duration and difficulty filters, plus price/duration sorting.
- `/treks/[slug]`: overview, day-by-day itinerary, inclusions, packing list and available departure dates. Missing content is identified instead of invented.
- `/contact` and `/inquire`: inquiry forms with name, email, optional dates/group size and backend-issued references.
- `/login`, `/register`, `/forgot-password`, `/reset-password`: actual Django account requests. Reset confirmation accepts the UID/token supplied by the current backend email.
- `/account`: authenticated booking list and pagination; current status and amounts come from Django.
- `/booking?trek=...&departure=...`: available live departures only. Submits contact and traveller details to Django, which locks seats, calculates totals and creates the booking reference. The receipt shows the returned status. No payment is collected and no email delivery is asserted.

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
```

The integration script starts an isolated local API fixture and a Next.js server on port 3011. It checks envelope/pagination handling, outage behaviour, rejected credentials, HttpOnly cookies, account requests, inquiry references, seat/passport validation, backend pricing, end-to-end forms and responsive layouts. It creates no real accounts, inquiries or reservations. Chrome is required for browser checks. Screenshots are saved in ignored `test-results/`.

## Before public launch

Run the same flows against a seeded staging Django instance, with the actual database and email setup. That has not been verified here. The backend's email tasks can fail without failing the API request; a saved record is not proof of delivered mail.

The trip serializers currently provide no image URL, so live cards use a destination treatment instead of assigning an unrelated sample photograph. Add a documented media field before enabling live trip images.

Newsletter storage has no backend endpoint and remains explicitly unavailable. Payment capture, full editorial articles and approved policy documents are not implemented. Existing sample testimonials and design claims require owner review before publication. Keep backend throttling enabled for public endpoints.
