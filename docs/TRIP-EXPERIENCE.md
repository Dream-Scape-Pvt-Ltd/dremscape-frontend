# Trek and booking refinement

Public trip detail and departure lookups now accept UUIDs as well as existing CMS slugs. Old booking URLs return to their package; booking URLs without a trip return to the catalogue. Receipts keep a validated trip slug, enabling a return-to-trip link without exposing passenger details. If no receipt can be loaded, the payment page still offers a catalogue link.

The active trek page now shows overview and inclusions consistently for every route. Sample journeys offer a planning enquiry rather than an empty departure picker or illustrative purchase price. Trek and payment surfaces use navy ink, glacier blue and warm brass, with compact mobile layouts.

## Editing the altitude graph

In the CMS trek editor, use the Day-by-Day Itinerary Builder. Enter each day's title, overnight place and **Overnight altitude (metres)**. Mark acclimatisation days where appropriate. Save the trek. The public graph appears immediately after the itinerary, using these saved values. The graph preview toggle affects the editor preview only; elevation fields always remain editable.

Unknown altitudes remain blank. The public graph omits invalid values and leaves gaps across missing days. It displays overnight altitude, not each day's maximum elevation. Each day card can be selected using touch, mouse or keyboard and links back to its itinerary entry.

The local CMS currently has no published trips. Draft route pages therefore show an honest altitude placeholder until actual daily values are published. Graph interaction was verified using an ignored, GET-only disposable fixture; no trips, booking transactions, reviews or enquiries were created in the real CMS.

## Validation

- 49 frontend tests passed, including safe receipt links, private-data projection and altitude data handling.
- All 12 trip catalogue backend tests passed, including ID/slug detail and departure lookups and unknown-ID handling.
- Production build and TypeScript succeeded. Lint has no errors; existing warnings remain.
- Desktop and 390-pixel mobile browser checks passed, including graph selection, keyboard selection, altitude jump navigation, payment-to-catalogue navigation, and old booking-link redirects. Neither package nor graph caused horizontal page overflow.

During investigation, repeated local reads had exhausted Django's in-memory anonymous API quota. The development backend was restarted to clear that process-local state. Production throttle/security settings were not changed; public requests can still return a rate-limit error when their configured quota is exhausted.
