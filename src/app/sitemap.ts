import { MetadataRoute } from 'next';
import { listJourneys } from '@/lib/journeys';
import { listDestinationContent } from '@/lib/destination-content';
import { listTrekGuides } from '@/lib/trek-guides';
import { listGuides } from '@/lib/guides';
import { destinationHref, guideHref, storyHref, trekHref } from '@/lib/links';

/** A backend outage leaves the detail entries out rather than failing the sitemap. */
const safely = async <T,>(load: () => Promise<T[]>): Promise<T[]> => { try { return await load(); } catch { return []; } };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://dreamscapetreks.com';
  const currentDate = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    ...['departures','faq','tailor-made'].map(path=>({url:`${baseUrl}/${path}`,lastModified:currentDate,changeFrequency:'weekly' as const,priority:0.7})),
    ...['destinations/nepal'].map(path=>({url:`${baseUrl}/${path}`,lastModified:currentDate,changeFrequency:'yearly' as const,priority:0.4})),
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/partners`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // Detail pages open by id (/treks?id=<uuid>).
  const [trips, destinations, trekGuides, stories] = await Promise.all([
    safely(async () => (await listJourneys()).trips),
    safely(listDestinationContent),
    safely(listTrekGuides),
    safely(listGuides),
  ]);
  const detail = (path: string, priority: number) => ({url: `${baseUrl}${path}`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority});
  const detailPages: MetadataRoute.Sitemap = [
    ...trips.map(t => detail(trekHref(t.id), 0.8)),
    ...trekGuides.map(g => detail(guideHref(g.id), 0.6)),
    ...stories.map(g => detail(storyHref(g.id), 0.6)),
  ];

  const destinationPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/destinations`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...destinations.filter(d => d.slug !== 'nepal').map(d => detail(destinationHref(d.id, d.slug), 0.8)),
  ];

  // Activity pages
  const activities = ['trekking', 'cultural-journeys', 'expeditions', 'private-journeys'];
  const activityPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/activities`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...activities.map((slug) => ({
      url: `${baseUrl}/activities/${slug}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];

  // Trek catalog
  const trekPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/treks`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Combine all pages
  return [
    ...staticPages,
    ...destinationPages,
    ...activityPages,
    ...trekPages,
    ...detailPages,
  ];
}
