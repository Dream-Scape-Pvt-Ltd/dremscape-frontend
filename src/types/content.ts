export type GuideCategory = 'ADVENTURE' | 'TRAVEL_TIPS' | 'CULTURE' | 'NATURE' | 'FOOD' | 'OTHER' | string;

export interface BlogComment {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
}

/** One part of an article: its heading, story text and optional photo. */
export interface GuideSection {
  heading: string;
  body: string;
  image_url: string;
  image_caption: string;
}

export interface TravelGuideAdminItem {
  id: string;
  title: string;
  slug: string;
  destination_name?: string;
  country?: string;
  region?: string;
  category?: GuideCategory;
  summary?: string;
  hero_image_url?: string | null;
  gallery_images?: string[];
  is_published?: boolean;
  published_at?: string | null;
  updated_at?: string;
  author_name?: string;
  view_count?: number;
  comment_count?: number;
}

export interface TravelGuideDetail extends TravelGuideAdminItem {
  body_markdown?: string;
  sections?: GuideSection[];
  meta_title?: string;
  meta_description?: string;
  comments?: BlogComment[];
}

export interface GuidePayload {
  title: string;
  slug: string;
  destination_name?: string;
  country?: string;
  region?: string;
  category?: GuideCategory;
  summary?: string;
  hero_image_url?: string;
  gallery_images?: string[];
  sections?: GuideSection[];
  body_markdown?: string;
  meta_title?: string;
  meta_description?: string;
  is_published?: boolean;
}

export type CreateGuidePayload = GuidePayload;
export type UpdateGuidePayload = Partial<GuidePayload>;
