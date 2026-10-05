# Design improvements (for Codex)

Design review: 2026-10-05, local build at commit `fb5ebb3` (+ uncommitted footer work), 12 pages at 1440px and 390px.

## Ground rules — read first

1. **Keep the design.** The brand (forest green + gold, Plus Jakarta Sans, real Nepal photography, green story wave, polaroid photos, mountain footer illustration) stays. This is polish, not a redesign.
2. Do not change routes, nav labels, form field names, the logo, or legal/cookie copy.
3. Take full-page screenshots at 1440px and 390px of `/ /treks /departures /destinations /destinations/nepal /about /contact /blog /gallery /reviews /guides /tailor-made` **before** you start. After each task, compare. Only the area named in the task may change.
4. `npm run lint`, `npm run typecheck`, `npm test` after each task. One commit per task, ID in the message (e.g. `D1: fill departures dead space`).
5. Tasks marked **[ASK]** need the owner's decision. Skip them and list them in your report.
6. The footer landscape was recently reworked (commits `fb5ebb3`, `72d0a68`). Keep that blended look when doing D6.

---

## High priority

### D1. Dead space in "Upcoming departures"
On `/` and `/departures` at desktop, the two departure cards sit in the left ~45% of the container and the right half is empty.
**Do:** make the cards fill the row. When there are fewer cards than columns, either stretch the grid (`repeat(auto-fit, minmax(320px, 1fr))` capped at 3 columns) or add a final "Choose your own dates" card (same card style, links to `/tailor-made`) so the row is complete. Same card design.

### D2. Hero text legibility over photos
Home hero (desktop and especially mobile): the subtext "Nepal treks, shaped around you…" sits directly on top of people and bright snow in the slideshow photos and is hard to read.
**Do:** strengthen `.hero-shade` only behind the text block (soft radial or vertical gradient, darker at the centre/bottom), and set `object-position` per slide so the people aren't directly behind the copy. Text must reach 4.5:1 contrast on every slide. Photos otherwise unchanged.

### D3. Placeholder / unfinished content visible to visitors
- `/contact`: WhatsApp card shows "+977 98X XXX XXXX" and "Placeholder · Company number coming soon". Hide the card until a real number is configured (env var or CMS field).
- Homepage journal section says "Journal stories are temporarily unavailable. Please check back soon." when there are simply **no** stories (API returns 200 with 0 results). Use the same empty-state message as `/blog` ("A new chapter is on its way.").
- **[ASK]** Footer tagline "View in the Horizon." Possibly meant to be "Beyond the Horizon."

### D4. Empty sections on the homepage
With no published content, the homepage shows three empty boxes (Featured journeys, Traveller stories, Journal). **[ASK]** Recommended: in production, hide a section entirely when it has no items (keep the empty states for staff preview). Implement behind a simple condition so the owner can switch it.

### D5. One label per action (CTA vocabulary)
The same intent has many labels and mixed casing: "Find My Trek" / "Find my journey"; "Plan my journey" / "Build My Journey" / "Ask the team" / "Ask the Team"; "View All Journeys" / "View all departures".
**Do:** sentence case for all buttons and links. One label per intent:
- Search intent: **"Find my trek"** (hero button and planner submit).
- Enquiry intent: **"Plan my journey"** (nav, homepage CTA, empty-state buttons). Keep "Plan a tailor-made trip" only on tailor-made entry points.
- Listing links: "View all journeys", "View all departures", "Explore Nepal".
Do not rename analytics-relevant IDs or form names.

### D6. Shorter pre-footer on inner pages
Every page ends with the organisations strip + full-height mountain illustration + footer, about 1,000px+ at desktop. On short pages (`/departures`, `/treks`, `/guides`) this is longer than the page content.
**Do:** keep it as-is on `/` and `/about`. On other pages, show the illustration at roughly 50–60% height (crop from the top, keep the hiker and peak) and move the organisations strip to `/` and `/about` only. Keep the blended footer look from rule 6.

---

## Medium priority

### D7. Serif usage is inconsistent
A serif appears only in a few random places: `/destinations/nepal` hero ("*Feel the Himalaya.*"), the `/contact` image card ("Beyond the Horizon."), the footer tagline. Everything else is Plus Jakarta Sans.
**Do:** replace these with Plus Jakarta Sans (italic or a lighter weight for emphasis). **[ASK]** if the owner wants the serif as a deliberate accent instead.

### D8. Arrow icons
Arrows are mixed: `→`, `↗`, `↗︎` text glyphs, `.ui-arrow`, and the `Icon` image, sometimes on the same page. Rule: `→` for in-site navigation and next steps, `↗` only for links that leave the site (map, WhatsApp, external). Use one component (`.ui-arrow`) everywhere, same size and stroke.

### D9. Eyebrow labels on every section
Almost every section has a small uppercase label above the heading ("HANDPICKED EXPEDITIONS", "A PLACE ON THE NEXT JOURNEY", "FIVE TREKKING REGIONS ACROSS NEPAL", "THE TRAIL, IN THEIR WORDS"…), in different colours (gold line, grey, and peach/orange on `/contact`). It makes every section feel the same.
**Do:** keep eyebrows on about one in three sections (hero, story, plan CTA on the homepage); remove the rest. Use one colour for all of them (the existing gold). Remove the peach/orange colour on `/contact`.

### D10. Contact map panel looks empty
`/contact` "Meet us in Thamel": the right half is a large pale panel with only "Thamel", a subtitle and a button; "Thamel" is repeated on both sides. Put a static map image (or a muted map illustration) of the office location in that panel, keeping the "View interactive map" button. Remove the duplicate heading.

### D11. Mobile region cards are cramped
At 390px, "Find your corner of Nepal" shows region cards in 2 narrow columns; descriptions wrap to 6–7 short lines. Use 1 column (or a horizontal scroll-snap row) below 600px. Desktop unchanged.

---

## Low priority (nice to have)

### D12. Numbered pills on activity cards
Homepage "Three ways into the Himalaya" cards have pills "01 · ON FOOT", "02 · A HIGHER GOAL", "03 · THE BIG MOUNTAINS" over the photos. Drop the numbers ("On foot", "A higher goal", "The big mountains"), or remove the pills entirely.

### D13. Hero decorations
Home hero has a bottom-left caption ("A world above the ordinary. / THE HIMALAYAS, NEPAL") plus a down-arrow, alongside the slide dots and pause button. `/destinations/nepal` hero has "BEYOND THE HORIZON" and "27°N · 86°E / NEPAL" corner labels. **[ASK]** Remove the scroll arrow; consider removing the caption/coordinates for a cleaner hero.

### D14. Side paragraphs in section headers
Several section headers put a small paragraph floating in the top-right ("Start with the experience that feels right…", blog "Three ways of remembering a journey…", gallery "Unposed pauses…"). Move these directly under the heading (max ~60 characters per line).

### D15. Repeated headline
"Rooted in Nepal. Built around people." is the homepage story heading **and** the `/about` hero heading. **[ASK]** Give the homepage section its own line.

---

## Found on the live site (with real trip data), 2026-10-05

### D16. Trek page hero is an empty green box (High)
`/treks/everest-base-camp-classic` (desktop and mobile): the top hero card labelled "THE TRAIL IN PICTURES" shows only a dark green gradient with no photo. When a trip has no gallery images, fall back to the trip's cover image, then to its region/destination photo, then to a house photo. Never render an empty picture frame.

### D17. Broken trip images (High)
Homepage "Featured Himalayan Journeys": the Pach Pokhari card shows a broken image icon and its alt text. Add an `onError` fallback on all trip card images (journey cards, featured, "More treks like this", departures) to the house photo used in `home.tsx` (`FALLBACK_PHOTO`). Same card layout.

### D18. Itinerary layout (Medium)
Trek pages show 14 day cards in a 3-column grid (the last row has an orphan gap) and, on mobile, a 2-column grid of very narrow cards with 10+ short lines each.
**Do:** mobile < 600px: one column. Desktop: keep the cards but consider a vertical timeline (day marker + title + description) with days 4-14 collapsed behind "Show all 14 days". Same card styling and colours.

### D19. Price formatting (Low)
Prices show "$2,500.00" and "$800.00". Use `Intl.NumberFormat('en-US', {style:'currency', currency:'USD', maximumFractionDigits:0})` everywhere: "$2,500".

### D20. "Accommodation: See itinerary" (Low)
Trek page fact grid: "See itinerary" is not a value. Show the accommodation type (e.g. "Teahouses + hotel") from trip data, or hide the cell if empty.

### D21. Mobile organisations grid orphan (Low)
At 390px the 5 organisation logos lay out 2 + 2 + 1 with the last cell full-width. Use a horizontal scroll-snap row or a 3 + 2 centred layout.

### Note on demo content
The live build is a pre-launch test build. Trips, departures and their images/text are **demo data** (e.g. the Pach Pokhari cover image). Do not edit or "fix" CMS content. D16 and D17 are still needed because real trips may also lack a gallery or have a broken image.

### Owner's before-launch checklist (not for Codex)
- Replace all demo trips, departures and images with real ones; write 2-3 sentence overviews.
- Add real traveller reviews and a real WhatsApp/phone number.
- Use a `@dreamscapetreks.com` email in the footer instead of Gmail.
- Point `dreamscapetreks.com` at the new site (it still serves the old one).

---

## Do NOT do
- No new colours, fonts, or layout system. No redesign of the hero, header or footer.
- No changes to the admin area.
- No CSS file consolidation in this pass.
