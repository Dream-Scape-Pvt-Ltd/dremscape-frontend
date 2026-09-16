export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  category: "Gear Guide" | "Altitude & Health" | "Cultural Heritage" | "Trail Reports";
  author: { name: string; title: string; avatarUrl?: string };
  publishedAt: string;
  readingTimeMinutes: number;
  coverImageUrl: string;
}
