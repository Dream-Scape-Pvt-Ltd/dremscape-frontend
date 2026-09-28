# Navigation and departure review — 27 September 2026

References reviewed: [Trek Me Nepal](https://trekmenepal.com/) and [Ace the Himalaya](https://www.acethehimalaya.com/).

Dreamscape already has a clear visual identity: mountain photography, forest green navigation, warm accents and generous editorial spacing. The main discovery gaps were a flat header that mixed company pages with trips, and departure dates that could only be found inside a trip. Trek Me Nepal’s region/activity grouping and early departure section address those gaps. Ace also groups destinations, activities and company information rather than giving every page equal prominence.

## Implemented

- Six primary entries: Treks, Tours, Climbing, Beyond Nepal, Company, Contact. The logo returns home. Search and the homepage journey finder retain their existing behavior.
- Treks: Everest, Langtang, Annapurna, Manaslu, Mustang, Off the Beaten Path.
- Tours: Wildlife, Luxury, Culture & Sightseeing, Day, Heli.
- Climbing: Everest and Annapurna, with access to the full climbing catalogue.
- Beyond Nepal: Bhutan, Tibet and India, consistent with Dreamscape’s existing company content.
- Company: About Us, Why Us, Our Team, Our Guides, Testimonials, Guide of the Year. Why Us and Our Team link to the existing, authored sections of the About page.
- Desktop disclosure panels and mobile accordions support click, keyboard, Escape and closing outside the header. Search closes the open menu.
- Region/activity links open filtered collections, keep filters in the URL and show an honest empty state when a category has no published journeys. Mustang is separated from Annapurna even though legacy destination labels combine both.
- Upcoming Departures follows the homepage region section. A full calendar is available at `/departures`, including an available-seats filter. Cards show dates, duration, difficulty, price, seats and booking status. Open dates link to the existing departure inquiry dialog; full dates link to trip details.
- Calendars use the public per-trip departure endpoints, follow all numbered pages with capped concurrency, remove past/cancelled dates and report partial outages. No staff capacity data is exposed.
- No Adventure menu was added.

## Content still needed

The local backend returned zero published trips during this review. Existing route inspiration remains visibly labelled as sample content; no departure dates, prices or seats are invented. Publishing trips and scheduling their departure dates in the existing staff dashboard populates the calendar automatically. Tour categories and region names need to accurately describe the published trips for filtering to work.

Guide of the Year has a page and menu entry, but no winner has been supplied or published. Its page explains that the announcement is pending. Existing published guide profiles and testimonials remain the source for those sections.

The homepage currently takes its three region cards from CMS order. The expanded navigation exposes all six trekking groups regardless of that order; the selection/order of featured homepage regions can be reviewed separately in the CMS.
