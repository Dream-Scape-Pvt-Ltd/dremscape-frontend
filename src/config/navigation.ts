export interface NavItem {
  title: string;
  href: string;
  badge?: string;
  description?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navigationConfig = {
  mainNav: [
    {
      title: "Destinations",
      href: "/destinations",
      megaMenu: [
        {
          title: "Nepal",
          href: "/destinations/nepal",
          description: "Everest, Annapurna, Manaslu & hidden valley circuits",
        },
        {
          title: "Tibet",
          href: "/destinations/tibet",
          description: "Mount Kailash Kora & Lhasa overland adventures",
        },
        {
          title: "Bhutan",
          href: "/destinations/bhutan",
          description: "Druk Path, Snowman Trek & sacred monastery valleys",
        },
        {
          title: "India",
          href: "/destinations/india",
          description: "Ladakh Chadar Trek & Sikkim Kanchenjunga base camp",
        },
      ],
    },
    {
      title: "Treks",
      href: "/treks",
      featured: [
        { title: "Everest Base Camp & Gokyo Lakes", href: "/treks/everest-base-camp-gokyo" },
        { title: "Annapurna Circuit & Tilicho Lake", href: "/treks/annapurna-circuit" },
        { title: "Manaslu Circuit Trek", href: "/treks/manaslu-circuit" },
        { title: "Upper Mustang Forbidden Kingdom", href: "/treks/upper-mustang" },
      ],
    },
    {
      title: "Regions",
      href: "/regions",
    },
    {
      title: "Activities",
      href: "/activities",
    },
    {
      title: "Blog & Guides",
      href: "/blog",
    },
    {
      title: "About",
      href: "/about",
    },
  ],
  footerNav: {
    destinations: [
      { title: "Nepal Treks", href: "/destinations/nepal" },
      { title: "Tibet Expeditions", href: "/destinations/tibet" },
      { title: "Bhutan Cultural Treks", href: "/destinations/bhutan" },
      { title: "Indian Himalayas", href: "/destinations/india" },
    ],
    popularTreks: [
      { title: "Everest Base Camp Trek", href: "/treks/everest-base-camp" },
      { title: "Annapurna Base Camp", href: "/treks/annapurna-base-camp" },
      { title: "Langtang Valley & Gosainkunda", href: "/treks/langtang-valley" },
      { title: "Upper Dolpo Wilderness Trek", href: "/treks/upper-dolpo" },
      { title: "Kanchenjunga Circuit", href: "/treks/kanchenjunga-circuit" },
    ],
    company: [
      { title: "About Dreamscape", href: "/about" },
      { title: "Sherpa Guide Team", href: "/about#team" },
      { title: "Reviews & Testimonials", href: "/reviews" },
      { title: "Himalayan Gallery", href: "/gallery" },
      { title: "Contact Headquarters", href: "/contact" },
      { title: "Tailor-Made Inquiry", href: "/inquire" },
    ],
    legal: [
      { title: "Terms & Conditions", href: "/terms-conditions" },
      { title: "Privacy Policy", href: "/privacy-policy" },
      { title: "Safety & Helicopter Evacuation", href: "/terms-conditions#safety" },
    ],
  },
};
