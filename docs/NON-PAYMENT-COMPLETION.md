# Non-payment implementation — 28 September 2026

This record updates the implementation status of the earlier agreement audit. It does not assert that production launch or content publication is complete.

## Implemented

- Forest-green, ivory and white overrides for public actions, editorial pages, trip cards, partner sections, policy pages and footer; removed partner glow and corrected button contrast. Desktop and 390px mobile checks covered public pages, catalogue controls, comparison, gallery and partner entry points.
- Consistent duration, difficulty, maximum altitude and price on journey cards. Budget and altitude filters and a three-trip comparison table. Sample routes explicitly show indicative prices and unconfirmed availability.
- CMS-editable homepage hero copy/photo, company story, company principles, team profiles, partner copy/sections/photo, gallery photographs/categories, and journal hero/featured article. Staff settings writes invalidate the public settings cache.
- New guide-profile backend, migrations, staff editing, draft/published visibility, region/trip assignments, biographies, languages and credentials. Published assigned guides appear in trip detail responses.
- Trip drafts start without invented prices or itinerary elevations. Publishing readiness checks point staff to approved trip descriptions, price, photos, daily elevations, inclusions, exclusions and preparation advice. Existing itinerary elevation graph remains CMS driven.
- Agency portal connected to the partner backend: approval status, private itinerary/marketing downloads and agency group bookings. Download proxy authenticates and verifies the upstream origin and asset path before forwarding credentials.
- Persistent enquiry acknowledgment email outbox, asynchronous delivery, retry scheduling and staff delivery-status inspection. No real email was sent during development. Retry handling uses [Resend idempotency support](https://resend.com/changelog/idempotency-keys).
- Public TravelAgency, published article and real-trip structured data, escaped to prevent CMS text from breaking script elements. Sample trip pages are excluded from indexing. Public settings and health probes use bounded caching; authenticated requests and trip availability remain uncached.
- Critical navigation covered region breadcrumbs, departure links, journal destinations, partner enquiry anchors, agency sign-in and safe receipt return links.

## Requires approved content or service setup

The local CMS has no published real trips, departure dates, traveller reviews or guide profiles. Do not publish sample routes as confirmed offers. Staff must supply approved prices, descriptions, photos, dated departures, daily elevations, guide biographies/credentials and genuine reviews with permission. Existing company copy and photographs were retained as editable defaults.

Partner downloads require approved agency accounts and actual itinerary/marketing files uploaded through the existing staff backend. Production email requires a verified sender, Resend configuration and running Celery worker/beat. Inbox delivery has not been verified. No payment work was included.

## Verification

- Frontend: 52 unit tests pass; optimized production build and TypeScript checks pass.
- Backend: earlier relevant suite of 80 tests passed; 11 focused tests pass after the latest guide relationship changes, covering CMS validation, guide publication/privacy and email delivery idempotency. Nine article CMS tests also pass after repairing article ID routes, including draft privacy. Existing partner tests passed during this work.
- Targeted frontend lint: zero errors; warnings remain for existing raw image elements/effects and client fetching effects.
- Browser: desktop public-page review plus mobile catalogue filters/comparison, gallery carousel, partner enquiry/dashboard and departures; no horizontal overflow in reviewed layouts. Private approved-agency screens are covered by backend tests, not by a live authenticated browser session.
- Proof: `test-results/trip-comparison-desktop.png`.

Deployment, full production performance measurement and real-email delivery are not confirmed by these local checks.
