export type Trip = { id?: string; slug: string; title: string; destination_name: string; destination_slug: string; category_name: string; category_slug: string; duration_days: number; starting_price_usd: string; altitude_max_meters: number; difficulty_grade: string; hero_image_url?: string; gallery_images?: string[]; image?: string; tags?: string; overview?: string };
export const trips: Trip[] = [];

export function filterTrips(items: Trip[], destination: string, category: string, duration: string) {
  return items.filter(t => (!destination || t.destination_slug.includes(destination)) && (!category || t.category_slug === category || (category === 'treks' && /trek/i.test(t.category_name))) && (!duration || (duration === 'short' ? t.duration_days <= 10 : duration === 'medium' ? t.duration_days > 10 && t.duration_days <= 16 : t.duration_days > 16)));
}
export function unwrapList<T>(body: unknown): T[] {
  const envelope = body as { success?: boolean; data?: unknown };
  if (envelope?.success === false) throw new Error('The catalog could not be loaded.');
  const data = envelope?.data ?? body;
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) return data.results;
  throw new Error('Unexpected catalog response.');
}
