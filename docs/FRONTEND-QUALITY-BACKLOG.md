# Dreamscape frontend quality backlog

Status: 30 September 2026. This is a design and content audit, not an estimate of backend or payment completion. **Observed** means the issue appeared in the local site or code. **Verify** means it still needs a deliberate check. **Dependency** means the company or CMS/backend owner must supply something.

## Progress in this frontend pass

- Preview cards and trip pages no longer show sample prices. Example departure cards say their dates are unconfirmed, show no seat counts and offer no booking action. With no CMS in production, the catalogue returns empty instead of silently publishing sample trips.
- The phone footer now has grouped links, the forest transition has one final blend rule, and the preview notice sits after the footer on narrow screens. Other overlapping global CSS still needs cleanup.
- Two large team portraits were converted to WebP, gallery descriptions and lazy image loading were improved, and a [photo approval register](PHOTO-APPROVAL-REGISTER.md) identifies what still needs provenance.
- A static route check passed, and the browser pass found and fixed broken links between policy pages. Type checking, 57 tests and the production build passed. This does not replace a production crawl or real-device testing.

## Highest priority before the site is presented as a real travel catalogue

1. **[Observed, dependency] Replace preview trips, tours, dates, seat counts and prices with approved records.** The design preview contains illustrative offers. Keep the preview notice and non-bookable actions until each real route, price, departure and capacity is approved; never make example seats look available to buy.
2. **[Observed, dependency] Finish CMS storage for important trip facts.** The frontend has a journey editor and a [handoff specification](CMS-CONTENT-HANDOFF.md). Add and test the missing secondary tags and per-photo provenance fields; verify destination, category, itinerary, services, price and departure edits survive reload and appear on public trip pages. The privacy policy and other legal pages can remain managed site copy rather than CMS fields.
3. **[Observed, dependency] Publish real tours in the CMS.** Three local tour concepts now make the preview useful, but they are not company products. Create actual sightseeing/day, wildlife and luxury records with an itinerary, inclusions, exclusions, prices, photo permissions and category assignments. Verify every Tours menu link returns the correct records.
4. **[Observed, dependency] Replace unverified photographs.** Some preview pictures are mood images and may not depict the named place. Record the exact location, photographer, license/permission and display credit for every region, trip, tour, team portrait and gallery photo. Do not substitute a generic mountain image for a named area without labeling it illustrative.
5. **[Observed, dependency] Confirm all legal and commercial wording.** The company supplied policy text, but deposit, refund, date-change, insurance, privacy and cookie statements need final company approval and consistent wording across policy pages, FAQs, cards and inquiry forms. Continue marking unfinished wording as draft.

## Frontend design and usability

6. **[Observed, partly fixed] Consolidate overlapping CSS layers.** The final footer blend is centralized and older conflicting pseudo-element rules were removed. Catalog and footer styles still span multiple global files; move them into a smaller documented component structure after visual comparison.
7. **[Observed, partly fixed] Tighten the phone footer.** Links are grouped and secondary policies collapse into a disclosure. It remains tall; test the illustration transition at 320, 375, 390 and 430 px, including real iPhone safe areas.
8. **[Partly fixed] Keep preview disclosure unobtrusive.** The notice is dismissible and flows after the footer on narrow screens, so it no longer covers phone content. Check that preview status remains clear on every page and assistive device.
9. **[Observed] Tailor trip detail templates to the product type.** The sample tour detail now avoids trek-specific altitude and copy. Continue checking published tours, treks and climbing trips separately so included services, day plans, packing advice and booking language match the experience.
10. **[Verify] Review all card crops and text legibility.** Test long trip titles, tall portrait photos, missing photos, multiple tags, large prices and small phone widths. Keep vital text out of image overlays where contrast is weak.
11. **[Verify] Audit one primary action per page.** Decide whether each page wants visitors to browse, ask a question or plan a private trip. Make the strongest button consistent and reduce competing buttons in headers, cards and detail sidebars.
12. **[Verify] Check the mobile menu end to end.** Open every group, follow nested links, close with Escape/back, and confirm focus returns to the menu trigger. Avoid duplicate links that make Company hard to scan.
13. **[Verify] Test region filtering and empty states with real records.** Eastern should show only Eastern trips; the same rule must hold for the other four broad regions and their subareas. Test counts, browser back/forward, copied URLs and the “clear all” action.
14. **[Verify] Test all forms with keyboard and touch.** Check required-field errors, date selection, error focus, retry behavior, long text, form submission feedback and spam prevention without silently dropping an inquiry.
15. **[Verify] Test the gallery carousel with touch, mouse and keyboard.** Confirm swipe/arrow controls, focus behavior, reduced motion, image loading and lightbox close. Autoplay should pause on hover/focus and never trap users.
16. **[Verify] Check sticky navigation and in-page anchors.** The detail-page Overview/Day-by-day links previously stuck under the header. Test all anchors after content changes at phone and desktop widths.
17. **[Verify] Test Safari and iOS home-screen behavior.** Check the touch icon, status bar, safe-area padding, 100vh sections, search input keyboard, date picker and fixed elements on an actual iPhone as well as desktop emulation.

## Content quality and trust

18. **[Dependency] Give each of the five Nepal regions its own approved identity.** Write concise introductions and highlights that explain what distinguishes the region, connect each area link to the correct trips, and use confirmed regional imagery.
19. **[Dependency] Make each real trip page genuinely useful.** Obtain approved route summaries, transport notes, daily distances/elevation, accommodation style, permits, fitness level, best seasons, inclusions, exclusions and safety notes. The present generic placeholders should not remain on published offers.
20. **[Dependency] Review team information with the company.** Confirm names, titles, biographies, portrait crop and photo consent; let editors update the CEO/chairman and co-founder/director cards without code.
21. **[Dependency] Build a real gallery archive.** Replace design-inspiration imagery with licensed trip photographs, location captions, alt text and credits. Let CMS editors order, hide and replace images.
22. **[Dependency] Populate the FAQ from real customer questions.** Cover route difficulty, seasonal conditions, deposits, cancellations, travel insurance, visas, private dates and what “seats available” actually means. Keep answers consistent with approved policies.
23. **[Verify] Remove generic or duplicated copy.** Review headings such as “journey,” “trail” and “adventure” on tours, day trips and beyond-Nepal pages. Use direct language and specific details rather than repeating the same brand phrases.

## Accessibility, performance and launch checks

24. **[Verify] Run a full accessibility pass.** Keyboard-only navigation, visible focus, heading order, labels, error announcements, contrast, motion preferences, tap targets, image descriptions and screen-reader reading order all need deliberate testing.
25. **[Verify] Run a performance pass on real phones.** Measure LCP, CLS and INP on the home page, catalog, trip detail and gallery. Convert heavy PNGs where appropriate, supply responsive sizes, avoid loading hidden carousel images eagerly and check animation cost.
26. **[Verify] Crawl internal links and page metadata.** Check menus, subarea links, gallery, legal pages, 404 behavior, canonical URLs, title/description uniqueness, social images, sitemap and robots rules once production URLs and real CMS records are set.
27. **[Verify] Check privacy controls and analytics together.** Ensure optional analytics runs only after the relevant consent, preferences persist, consent can be changed, and event tracking does not include personal inquiry data.
28. **[Verify] Test inquiry failure and recovery states.** A local backend outage already produced a server error. The UI should explain the problem, preserve entered text and offer a useful retry or alternative contact route.
29. **[Dependency] Verify deployment security and domain behavior.** Confirm HTTPS, redirects, environment variables, no browser-exposed secrets, production API origin, form rate limiting and spam controls with the person deploying the frontend/backend. Local development cannot prove production behavior.
30. **[Later, agreed scope] Connect live booking and payment only when the team is ready.** Keep current inquiries distinct from confirmed reservations. Then test availability changes, duplicate submissions, confirmations, cancellations and payment failure paths together with the backend owner.

The first five items are the trust and content gate. The visual refinements matter, but a polished page with invented prices or unlicensed regional photos would still not be ready for customers.
