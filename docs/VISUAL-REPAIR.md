# Visual repair following feedback

The homepage hero is centered and fills the viewport. The mountain photograph remains visible, with the title, Nepal trekking description, Find My Trek and film action grouped in the center. Desktop and 390px phone checks show no page overflow.

Forest green, ivory and white replace the added navy panels and mustard buttons. Explicit surface colors fix the booking section's white-on-white heading and light body text. Old globally important gold-button rules no longer override page styles. Journal headings and emphasis use forest green; text over photographs uses white. Cards and the gallery carousel use restrained shadows.

Trip pages show the CMS starting price in the upper booking panel and the lower booking section. Draft route prices are labelled indicative. Region breadcrumbs return to the same collection used by the trekking menus. Everest & Khumbu opens `/treks?kind=treks&region=everest`, avoiding an absent destination record.

Daily altitude graphs use saved CMS itinerary elevations. The Everest preview includes approximate overnight elevations referenced from https://lovehimalayajourney.com/treks/everest-base-camp-gokyo-cho-la-trek and displays its preview status and reference. These values do not overwrite CMS content. Other unpublished route outlines retain unknown elevations. Selecting day 4 highlights the Namche acclimatisation night; labels adapt to phone widths.

Gallery has a manual carousel, selectable thumbnails and the existing full-photo viewer. Journal remains a separate editorial layout and is linked in the main header. Guide of the Year is removed from the menu, footer and sitemap; old addresses redirect to Guides.

Footer keeps Trekking journeys, Upcoming departures, Mountain gallery and The journal. Repeated destinations, tours, climbing and Ways to explore links are removed. The logo has one tagline: View in the Horizon. Travel agency partnerships explains B2B in plain language, and Partner enquiry targets the actual form.

Validation: 50 frontend tests pass, production build and TypeScript pass, targeted lint reports no errors. Browser checks covered desktop/mobile hero and gallery, carousel selection, actual Everest breadcrumb navigation, visible altitude selection, booking contrast, journal accent contrast, upcoming departures and partnership form navigation. No real bookings, messages or CMS records were created.
