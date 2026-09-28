# Dreamscape agreement: implementation audit

Reviewed 27 September 2026 against the six-page `Dreamscapte Agreement.pdf` supplied by the user, the current frontend, and the active `dreamscape-backend-github` backend. This is a technical progress review, not acceptance, invoicing, or a finding of legal compliance. The agreement was treated as reference material, not instructions to implement new work.

## Assessment

The public site, catalogue, CMS and CRM contain substantial implementation. The project is not yet the complete booking and expedition platform described in Exhibit A. The largest gaps are an actual payment integration, transactional booking emails, a customer-facing B2B portal, and custom map route planning. Code foundations do not prove production delivery.

## Exhibit B milestone review

| Milestone (PDF pages 5–6) | Agreed amount | Current evidence | Status |
| --- | ---: | --- | --- |
| 1: Project initiation | Rs 45,000 / 30% | Next.js frontend, Django REST backend, model definitions and migrations are present. UI is implemented and being revised. No signed UI approval or schema-finalization record was supplied. | Technical foundation substantially present; formal approval unverified. |
| 2: Admin CMS/CRM and B2B integration | Rs 37,500 / 25% | Admin editors, inquiry pipeline, revenue dashboard, public partnership page and enquiry form exist. Backend partner registration/approval/private download APIs exist. Booking/inquiry email functions are logging stubs; the public frontend has no dedicated partner dashboard/download flow. | Partial. |
| 3: Frontend, booking engine and map | Rs 52,500 / 35% | Multi-country browsing, itinerary/altitude display, departure UI, CMS pricing, booking data API, metadata and sitemap exist. Google location map exists. Payment endpoints are unregistered; checkout is unavailable; custom route planning is not implemented in the inspected frontend. | Partial; payment and route planning are major missing pieces. |
| 4: Final deployment and handover | Rs 15,000 / 10% | Local production build and earlier automated tests exist. No evidence supplied for production payment verification, final deployment acceptance or completed staff training/handover. | Not demonstrated. |

These amounts are the agreement schedule, not verified payments received or amounts now due. No percentage-complete claim is made: milestone billing percentages do not measure implementation completion.

## Exhibit A deliverables (PDF page 4)

| Deliverable | What exists | Remaining work / qualification |
| --- | --- | --- |
| Frontend and multi-country navigation | Treks, tours, climbing, Beyond Nepal, region collections and trip details. Featured trips appear earlier, hero is centered, company/menu/footer have been simplified, gallery has a carousel and Journal is in the header. | Continue visual/content QA with real published packages. Sample trips are previews, not sellable inventory. |
| Elevation profiles and gear requirements | `src/components/route-profile.tsx` renders itinerary elevations; trip detail displays the graph and packing lists. CMS itinerary editor saves overnight locations and elevations. | Real itinerary values must be entered. Everest sample elevations are explicitly approximate; other incomplete samples cannot supply a meaningful profile. |
| Technical SEO | Next.js server-rendered pages, route metadata, `src/app/sitemap.ts` and robots route exist. Backend content serializer constructs Article schema data. | No Schema.org JSON-LD script output was found in the inspected frontend source search. Backend schema data alone does not prove public structured-data delivery. Verify canonical URLs and indexing on the deployed site. |
| Booking engine: 100% or 20% deposit | `apps/bookings/serializers/booking_serializers.py` calculates full or 20% initial amounts and records a balance date seven days before departure; booking/capacity foundations exist. | Current public booking action is an enquiry, not a complete paid reservation. The remaining-balance date is stored, but automated collection/reminder flow is not established. |
| Multi-currency payment processing | Payment models include currency, charged currency and exchange-rate fields. | `apps/payments/serializers/payment_serializers.py` uses a fixed USD/NPR rate and constructs a placeholder checkout URL. `apps/payments/urls.py` has no registered endpoints. No real Khalti/banking checkout or provider verification is demonstrated. `src/components/payment-page.tsx` explicitly says online payment is unavailable. |
| CRM: inquiry/customer/group lifecycle | Inquiry records, notes/tasks, customer rollups and queued/traveling/completed pipeline are implemented, including scheduled status/SLA/task jobs. Admin pipeline and revenue views exist. | Worker scheduling and delivery require runtime verification; stub notification functions do not send messages. No external notification was sent during this audit. |
| Automated confirmation/receipt emails | `apps/b2b/tasks.py` includes a Resend outbox/retry implementation for partner emails. | `apps/bookings/tasks.py` confirmation and waitlist-email functions, and `apps/inquiries/tasks.py` acknowledgement/alert functions, currently log and return. They do not implement actual booking receipt/confirmation delivery. Partner Resend code has not been verified against production credentials/workers. |
| B2B portal | Public `/partners` page and enquiry form. Backend `apps/b2b/urls.py` registers approval, profile, asset download, booking and commission APIs; downloads require approved access and signed links. | No dedicated partner frontend portal was found in the route tree. Finish sign-in/access, itinerary download and group-rate enquiry experience, populate assets and verify permissions end to end. Public marketing copy is not evidence that the portal works. |
| Admin CMS and Markdown blogs | `src/app/admin/components/admin-dashboard.tsx` manages trips, itineraries, departures, destinations, guides, reviews, journal posts and CRM. Markdown-backed journal content has public rendering. | Not every page is CMS editable: About/team copy is imported from `src/content/about.json`; partnership copy is hardcoded; gallery photographs are a code-defined collection. Some hero content/settings require further wiring. |
| Financial oversight | Admin `revenue-view.tsx` consumes CRM revenue summaries and manual entries; backend payment transaction models exist. | CRM revenue reports are not complete gateway transaction reconciliation. Transaction-report UI and automatic overdue-balance notices are not demonstrated. |
| Google Maps | Contact location embed and directions links exist in `src/components/location-map.tsx` and contact map components. | No custom trek route planner or shared trip-location workflow was found. An office-location embed meets only part of the requested integration. |
| Technology stack | Next.js/React, Tailwind dependency, Motion animations and Django REST are present. PostgreSQL configuration is supported. | The inspected local backend currently uses SQLite. Production PostgreSQL operation, migration and backup/restore verification remain unverified. |

## Other agreement obligations and document details

- Page 1 gives delivery as January 2027 and support/bug fixes for February 2027. Page 3 separately describes one year of operation according to specifications. These are separate statements; the exact support arrangement should be recorded clearly by the parties. Training is required after delivery; no completed training record was supplied.
- Pages 1–2 describe defect reporting and written acceptance. Build success does not constitute that acceptance; no signed acceptance record or invoices were supplied.
- Page 2 says the compensation includes hosting/external API expenses, while Exhibit A on page 5 excludes payment of hosting/mapping platform fees. This is an apparent inconsistency to clarify in the agreement, not resolve by assumption.
- Page 3 retains `[GOVERNING LAW JURISDICTION]` and blank signature lines. The supplied copy does not establish execution or a completed jurisdiction field.
- Intellectual-property transfer, confidentiality, warranties and indemnification cannot be verified from application screens or code presence. No ownership/payment/compliance conclusion is made.
- Exhibit A excludes ongoing content creation. Missing real trip text, reviews, blog posts or departure inventory must be distinguished from missing publishing functionality.

## Recommended completion sequence

1. Finish real gateway initiation/verification and the public 100%/20% checkout, then implement and verify remaining-balance scheduling, exchange rates, reconciliation and transactional emails.
2. Complete the partner frontend against existing approved-partner APIs and verify asset downloads/group enquiries with realistic accounts and records.
3. Add custom route planning, public structured data, transaction/overdue reporting, and remaining CMS-editable sections.
4. Publish approved trip/departure/review content, perform production PostgreSQL/payment/email/worker checks, and complete staff training and written handover/acceptance.

## Change made during this audit

The partner hero inherited white text and a blurred text shadow intended for text over photography. Its current layout places text beside the image on ivory. `src/app/visual-repair.css` now uses forest headings and readable dark body text without that shadow for these split editorial heroes; the partner CTA is explicitly kept free of glow. Browser computed styles confirm no text shadow, filter or box shadow on the partner CTA and no shadow on its hero text. The production build, including TypeScript, passed. Screenshot: `test-results/partner-no-glow.png`.

This review did not implement the remaining agreement deliverables, change the agreement, accept contractual terms or perform financial transactions.
