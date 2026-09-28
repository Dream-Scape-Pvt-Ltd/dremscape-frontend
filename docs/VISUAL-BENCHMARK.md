# Dreamscape visual benchmark

Reviewed 27 September 2026. This is a design brief for the next visual pass; it does not claim that the proposed redesign has been implemented.

## Scope and conclusion

Reviewed the desktop homepages of seven operators in the browser: Trek Me Nepal, Ace the Himalaya, Nepal Hiking Team, Magical Nepal, Green Valley Nepal Treks, Himalayan Glacier, and Third Rock Adventures. Also reviewed Ace's Everest Base Camp page visually, Nepal Hiking Team's Everest Base Camp page structure, and Dreamscape's local homepage at desktop and phone sizes. This is a representative benchmark, not an exhaustive review of every Nepal trekking website. It assesses visible presentation; competitor review totals, awards and service claims are not independently verified.

Dreamscape has a strong foundation: forest green, cream and muted gold; generous photography; a compact grouped header; and personal field photographs. The opportunity is to connect that identity to a clearer sequence of trip choices, dates, evidence and contact. Keep the emotional appeal while making practical decisions easier.

## Lessons from the reference sites

| Reference | Observed strength | Application to Dreamscape |
| --- | --- | --- |
| [Trek Me Nepal](https://trekmenepal.com/) | Six clearly named trekking regions, a visible departures section, category grouping and named traveller reviews. | Make the same regions visible in the homepage body, and keep departures easy to scan. Use distinct region photography and plain labels. |
| [Ace the Himalaya](https://www.acethehimalaya.com/) | Simple trip cards with duration, title and starting price; traveller photos and review content; clear gallery and price presentation on the trip page. | Move featured journeys earlier. Use a consistent card layout and real trip photographs, with price/date information supported by published content. |
| [Nepal Hiking Team](https://www.nepalhikingteam.com/) | Hero combines a clear service headline, review presentation and search; best sellers immediately follow. Cards show duration, review count and price. | Bring the service promise and primary action together. Retain Dreamscape's existing search functionality. Show relevant proof close to the first decision. |
| [Magical Nepal](https://www.magicalnepal.com/) | Best sellers and short treks are separately grouped; departure rows use dates, availability and price; travellers can browse months. | Offer a small number of useful collections such as popular routes and short treks. Add month browsing to the full departure calendar when there are enough published dates. |
| [Green Valley Nepal Treks](https://www.greenvalleynepaltreks.com/) | Uniform photo cards make duration, pricing and ratings easy to locate across trips. | Standardize image ratios, title spacing, facts and price alignment. Keep badges restrained so cards remain easy to read. |
| [Himalayan Glacier](https://www.himalayanglacier.com/) | A compact strip brings experience, review presentation and group format together. | Replace some generic benefit copy with compact, verifiable details about Dreamscape's experience and way of operating. |
| [Third Rock Adventures](https://www.thirdrockadventures.com/) | Personal trip planning is prominent; traveller review panels and access to a local specialist support the offer. | Put a real guide or planner's face beside the contact invitation and show a small selection of published traveller stories. |

Some competing layouts also introduce clutter through several bright badge colors, repeated trip carousels, floating contact controls, large headers and long company text. Dreamscape can maintain a calmer page with one strong action per section, fewer competing controls and a consistent visual system.

## Concrete Dreamscape findings

Measurements below describe the current local homepage, including its empty departures state and route inspiration cards. They are layout observations, not traffic or conversion measurements.

At 1280 × 720, the hero is 740 pixels high. The finder follows it, then benefits, three destination cards, departures and an 840-pixel company story section. Featured journeys begin at approximately 3,405 pixels. At 390 × 844, featured journeys begin at approximately 5,185 pixels, after a 1,496-pixel destination section and a 1,265-pixel company story section. Phone document width matches the viewport, so the reviewed homepage has no horizontal overflow.

1. **The hero's message is spread apart.** The large slogan is near the top, while the service description and primary action sit near the bottom. Bring slogan, practical Nepal trekking description and action into one coherent text group. Retain enough clear image space to see the mountains. Test legibility across every slide and use phone-specific focal positions.
2. **Trip choices arrive too late.** Move featured journeys above the long company story. Keep the story concise on the homepage, with the full narrative on About. Give departures a clear heading and place them before the story too.
3. **The region selection does not match its Nepal introduction.** The current three cards are Annapurna & Mustang, Bhutan, and Dolpo & West Nepal. Curate Everest, Annapurna, Langtang, Manaslu, Mustang and Off the Beaten Path as the main trekking grid; give Beyond Nepal its own smaller entry. Do not show trip counts unless they come from the published catalogue.
4. **Social proof requires another click.** The homepage traveller-story section currently contains an introduction and a link, without review excerpts. Render two or three real, published stories with author, trip and a source link where available. Add a rating summary only when Dreamscape's own source can support it.
5. **Several sections repeat the invitation to dream and explore.** The story collage, alpine inspiration, journal cards and scenic journal banner each occupy substantial space. Preserve one memorable photo collage, shorten repeated introductions, and give each remaining section a distinct job.
6. **The action label is ambiguous.** The hero's “Explore Treks” play button opens the film. A label such as “Watch our trek film” would match that interaction; a browse action should lead to journeys.
7. **The phone layout needs a shorter route to trips.** Keep the readable header and current full-width buttons. Use compact region tiles, shorter introductory blocks and consistent single-column trip cards. Prefer visible content to relying on slow entrance animations; scrolling should not temporarily leave large empty-looking areas.
8. **The editorial system needs consistency.** Use one section-heading scale, one card-title scale, readable body copy, predictable spacing, consistent corners and fewer decorative labels. Gold should remain an accent for primary actions and selected highlights. Keep important facts readable outside photographs.

## Proposed homepage order

1. Compact grouped navigation.
2. Mountain hero with a connected headline, practical description and primary action.
3. Existing journey finder, with its current search behavior.
4. Compact proof strip using verified Dreamscape content.
5. Featured journeys: an initial set of four to six published trips.
6. Upcoming departures: dates, trip names, price, seats and unambiguous status.
7. Six trekking regions in a compact photo grid.
8. Brief company story and real guide/planner portraits.
9. Two or three published traveller stories.
10. Three practical planning articles, such as choosing a route, seasons or preparation, when authored content exists.
11. Personal planning invitation and footer.

Desktop can present trip cards in three or four columns with aligned facts. Phone should use clear stacked cards and compact region tiles. One reusable card system should cover homepage and filtered collections. Existing live JourneyCard already supports duration, difficulty and starting price; the next pass should refine that system rather than treating prices as a missing feature.

## Trip-page follow-through

[Ace's Everest Base Camp page](https://www.acethehimalaya.com/trip/everest-base-camp-trek/) brings a photo gallery, price, facts, availability, itinerary, inclusions, map/elevation, FAQs and reviews into one page. [Nepal Hiking Team's equivalent](https://www.nepalhikingteam.com/package/everest-base-camp-trek) uses expandable daily itinerary content and organized practical questions.

Dreamscape already has galleries, trip facts, section links, itinerary content, inclusions and departure selection. Refine their hierarchy: place essential facts near the title, make dates and the planning action easy to reach, keep daily content scannable, and show actual guide profiles where supplied. Add route maps only from accurate authored route information. Test any sticky phone action so it cannot cover content or dialogs.

## Content dependencies and implementation priorities

The local backend currently has no published trips. The homepage explicitly labels its sample routes as inspiration, and departures correctly show an empty state. A finished visual experience needs real itineraries, trip images, prices and scheduled dates. Missing dates, ratings, certifications and awards must not be invented to fill layouts.

**First visual pass:** hero composition, earlier featured journeys, shorter company story, compact curated Nepal regions and consistent card spacing. Preserve search behavior and the completed grouped navigation.

**Second pass:** published traveller excerpts, guide/planner portraits, practical planning content and real departure data. Company award presentation depends on supplied winner/content.

**Final polish:** trip-page hierarchy, phone crops and spacing, motion, image loading and accessibility checks. Verify keyboard navigation, contrast, text wrapping, date/status clarity and no horizontal overflow. There is no evidence yet for a numerical conversion improvement; measure inquiries and trip/detail engagement after release.

The target is a recognizable Dreamscape site that makes the journey from inspiration to choosing a trip clear and credible.

## Implemented homepage refinement — 27 September 2026

The seven requested changes are now implemented in the local frontend. The hero connects its headline, practical Nepal trekking description and actions. The existing finder follows it, then a compact benefits strip, four featured journeys, upcoming departures, six curated trekking regions, a separate Beyond Nepal invitation, a shorter company story, published traveller excerpts, three journal cards and a compact planning invitation. The repeated inspiration collage and scenic journal banner have been removed.

Homepage and catalogue trips now use the same JourneyCard with a consistent image ratio, title treatment, duration, difficulty, price and action. Sample routes remain labelled as inspiration and do not advertise sample prices. On phones, the default featured row is swipeable with a visible next-card edge and swipe hint; finder results and catalogue cards retain vertical browsing.

Measured in the production preview with the current empty published catalogue:

| Viewport | Featured section before | Featured section after | Departures after |
| --- | ---: | ---: | ---: |
| Desktop 1280 × 720 | 3,405 px | 940 px | 1,701 px |
| Phone 390 × 844 | 5,185 px | 1,331 px | 2,189 px |

Measurements identify section starts, including their heading padding. Content, viewport and published departure volume affect later section positions. Neither viewport has page-level horizontal overflow; the mobile featured row intentionally scrolls within its own bounds.

The homepage retrieves up to three newest public, published reviews, with traveller names, trip attribution and links opening the matching journey and full review. Reads use bounded concurrency and tolerate a partial endpoint outage. The current backend has no published trips or customer reviews, so it displays an honest empty state. Disposable GET-only test responses are used to verify populated trip, departure and review layouts without writing endorsements or schedules to the CMS.

Validation: 45 tests passed, TypeScript and the production build passed, and lint completed with existing warnings and no errors. Desktop and phone checks cover image loading, card alignment, internal mobile scrolling, region tiles, review attribution and matching full-story navigation. Deployment and publication of genuine trip, date and review content remain separate from this local implementation.
