import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { treksApi } from "@/features/treks/api/treks";
import { destinationsApi } from "@/features/destinations/api/destinations";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const treks = await treksApi.getAllSlugs();
  const destinations = await destinationsApi.list();

  const trekUrls: MetadataRoute.Sitemap = treks.map((item) => ({
    url: `${siteConfig.url}/treks/${item.slug}`,
    lastModified: new Date(item.updatedAt),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const destinationUrls: MetadataRoute.Sitemap = destinations.map((d) => ({
    url: `${siteConfig.url}/destinations/${d.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    { url: siteConfig.url, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${siteConfig.url}/treks`, lastModified: new Date(), changeFrequency: "daily", priority: 0.95 },
    { url: `${siteConfig.url}/destinations`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/regions`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteConfig.url}/activities`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteConfig.url}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${siteConfig.url}/reviews`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.75 },
    { url: `${siteConfig.url}/gallery`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteConfig.url}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteConfig.url}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteConfig.url}/inquire`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];

  return [...staticUrls, ...destinationUrls, ...trekUrls];
}
