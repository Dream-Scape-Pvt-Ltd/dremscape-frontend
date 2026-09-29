/**
 * The site header's top-level menus, edited in admin → Settings → Header menus.
 * CATEGORIES menus list trek categories and have a catalogue page at
 * /treks?kind=<slug>; LINKS menus list plain links.
 */
export type MenuType = 'CATEGORIES' | 'LINKS';
export type NavLink = { label: string; description: string; href: string };
export type NavMenuItem = { slug: string; name: string; description: string; sort_order: number; is_active?: boolean };
export type NavMenuData = {
  id?: string;
  slug: string;
  name: string;
  menu_type: MenuType;
  sort_order: number;
  is_active?: boolean;
  eyebrow: string;
  title: string;
  intro: string;
  image: string;
  all_label: string;
  href: string;
  links: NavLink[];
  items: NavMenuItem[];
};

const items = (rows: [string, string, string][]): NavMenuItem[] => rows.map(([slug, name, description], sort_order) => ({ slug, name, description, sort_order }));

/** Shown if the backend can't be reached, so the header never renders empty. Mirrors the seeded menus. */
export const fallbackMenus: NavMenuData[] = [
  { slug: 'treks', name: 'Treks', menu_type: 'CATEGORIES', sort_order: 0, eyebrow: 'NEPAL, ONE TRAIL AT A TIME', title: 'Find your mountain trail.', intro: 'Choose a region and explore the journeys that take you there.', image: '222-78-imgNepalEverestBaseCampAndAmaDablamPeak', all_label: 'Explore all treks', href: '', links: [],
    items: items([['everest', 'Everest Region', 'Khumbu trails, lakes & high passes'], ['langtang', 'Langtang Region', 'Valley walks & mountain villages'], ['annapurna', 'Annapurna Region', 'Classic circuits & glacial lakes'], ['manaslu', 'Manaslu Region', 'Remote trails & the Tsum Valley'], ['mustang', 'Mustang Region', 'Red cliffs & ancient kingdoms'], ['off-the-beaten-path', 'Off the Beaten Path', 'Dolpo, Kanchenjunga & quieter trails']]) },
  { slug: 'tours', name: 'Tours', menu_type: 'CATEGORIES', sort_order: 1, eyebrow: 'A DIFFERENT WAY TO EXPLORE', title: 'More than mountains.', intro: 'Make time for Nepal’s wildlife, heritage and quieter moments.', image: '222-520-imgHimalayanAlpineLakeAndPeaks', all_label: 'Explore all tours', href: '', links: [],
    items: items([['wildlife-tours', 'Wildlife Tours', 'Forests, wildlife & jungle stays'], ['luxury-tours', 'Luxury Tours', 'Thoughtful journeys with extra comfort'], ['culture-sightseeing', 'Culture & Sightseeing', 'Heritage, local life & living traditions'], ['day-tours', 'Day Tours', 'A different perspective in a single day'], ['heli-tours', 'Heli Tours', 'The Himalaya from above']]) },
  { slug: 'expeditions', name: 'Climbing', menu_type: 'CATEGORIES', sort_order: 2, eyebrow: 'A LITTLE HIGHER', title: 'Your next summit.', intro: 'Browse climbing journeys by region and talk through the route with our team.', image: '222-78-imgAnnapurnaRangeAndHighGlacialLakesNepal', all_label: 'Explore all climbing trips', href: '', links: [],
    items: items([['everest-climbing', 'Everest Region', 'Khumbu trails, lakes & high passes'], ['annapurna-climbing', 'Annapurna Region', 'Classic circuits & glacial lakes']]) },
  { slug: 'beyond-nepal', name: 'Beyond Nepal', menu_type: 'LINKS', sort_order: 3, eyebrow: 'BEYOND THE FAMILIAR', title: 'Keep exploring.', intro: 'Discover places and cultures beyond Nepal with a personally planned journey.', image: '/images/trek-memories/mountain-amphitheatre.jpg', all_label: 'Explore beyond Nepal', href: '/destinations/beyond-nepal', items: [],
    links: [{ label: 'Bhutan', description: 'Valleys, monasteries & living traditions', href: '/treks?country=bhutan' }, { label: 'Tibet', description: 'High plateaus & sacred landscapes', href: '/treks?country=tibet' }, { label: 'India', description: 'Himalayan landscapes & cultural journeys', href: '/treks?country=india' }] },
  { slug: 'company', name: 'Company', menu_type: 'LINKS', sort_order: 4, eyebrow: 'ROOTED IN NEPAL · SINCE 2005', title: 'The people behind your journey.', intro: 'Get to know Dreamscape, our approach and the people beside you on the trail.', image: '/images/trek-memories/together-in-the-mountains.jpg', all_label: 'Get to know Dreamscape', href: '/about', items: [],
    links: [{ label: 'About Us', description: 'Our story & where we come from', href: '/about' }, { label: 'Why Us', description: 'How we shape your journey', href: '/about#our-approach' }, { label: 'Our Team', description: 'The people behind the plans', href: '/about#our-team' }, { label: 'Our Guides', description: 'Meet the people who lead the way', href: '/guides' }, { label: 'Testimonials', description: 'Stories from our travellers', href: '/reviews' }] },
];

/** Photo used when a menu has none, or one that can't be resolved. */
export const fallbackMenuImage = '/images/trek-memories/mountain-amphitheatre.jpg';
export const trekMenus = (menus: NavMenuData[]) => menus.filter(menu => menu.menu_type === 'CATEGORIES');
