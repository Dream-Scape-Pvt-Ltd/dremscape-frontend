import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, readInput, requiredText, BackendError} from '@/lib/backend';

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET(request: Request) {
  try {
    const {headers} = await staffAccess();
    const query = new URL(request.url).searchParams.toString();
    const [tripsData, destinationsData, categoriesData, menusData] = await Promise.all([
      backend(`trips/${query ? `?${query}` : ''}`, {headers}),
      backend('destinations/?page_size=100', {headers}).catch(() => ({results: []})),
      backend('destinations/activity-categories/?page_size=100', {headers}).catch(() => ({results: []})),
      backend<{slug: string; name: string; sort_order: number}[]>('destinations/nav-menus/', {headers}).catch(() => []),
    ]);
    // The trek form groups categories under the header menu each belongs to.
    const menus = new Map(menusData.map(menu => [menu.slug, menu]));
    const categories = ((categoriesData as {results?: {menu?: string | null}[]}).results || []).map(category => {
      const menu = category.menu ? menus.get(category.menu) : undefined;
      return {...category, menu_name: menu?.name ?? null, menu_order: menu?.sort_order ?? null};
    });

    return NextResponse.json({
      data: {
        treks: tripsData,
        destinations: (destinationsData as {results?: unknown[]}).results || [],
        categories,
      }
    }, {headers: noStore});
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = await readInput(request);
    const {headers} = await staffAccess();

    const title = requiredText(input, 'title', 255);
    let slug = typeof input.slug === 'string' && input.slug.trim() ? input.slug.trim() : slugify(title);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      slug = slugify(slug || title);
    }
    if (!slug) {
      throw new BackendError('Please provide a valid slug for the trek.', 400);
    }

    const destination = requiredText(input, 'destination', 100);
    const category = requiredText(input, 'category', 100);
    const duration_days = Number(input.duration_days);
    if (!Number.isInteger(duration_days) || duration_days < 1) {
      throw new BackendError('Duration must be at least 1 day.', 400);
    }

    const starting_price_usd = Number(input.starting_price_usd);
    if (isNaN(starting_price_usd) || starting_price_usd < 0) {
      throw new BackendError('Please provide a valid starting price in USD.', 400);
    }

    const difficulty_grade = requiredText(input, 'difficulty_grade', 30);
    const overview = requiredText(input, 'overview', 5000);
    const altitude_max_meters = input.altitude_max_meters ? Number(input.altitude_max_meters) : null;
    const is_active = input.is_active !== undefined ? Boolean(input.is_active) : true;
    const is_featured = Boolean(input.is_featured);

    const payload = {
      title,
      slug,
      destination,
      category,
      duration_days,
      difficulty_grade,
      starting_price_usd: starting_price_usd.toFixed(2),
      single_supplement_usd: input.single_supplement_usd ? Number(input.single_supplement_usd).toFixed(2) : null,
      overview,
      hero_image_url: typeof input.hero_image_url === 'string' ? input.hero_image_url.trim() : '',
      gallery_images: Array.isArray(input.gallery_images) ? input.gallery_images.filter((img: unknown) => typeof img === 'string' && img.trim()) : [],
      altitude_max_meters: altitude_max_meters && altitude_max_meters > 0 ? altitude_max_meters : null,
      is_active,
      is_featured,
      min_group_size: input.min_group_size ? Number(input.min_group_size) : 1,
      max_group_size: input.max_group_size ? Number(input.max_group_size) : 14,
      best_seasons: Array.isArray(input.best_seasons) ? input.best_seasons : [],
      inclusions: Array.isArray(input.inclusions) ? input.inclusions : [],
      exclusions: Array.isArray(input.exclusions) ? input.exclusions : [],
      packing_list: Array.isArray(input.packing_list) ? input.packing_list : [],
      itinerary_days: Array.isArray(input.itinerary_days) ? input.itinerary_days : [],
    };

    const data = await backend('trips/', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    return NextResponse.json({data}, {status: 201, headers: noStore});
  } catch (error) {
    return apiError(error);
  }
}
