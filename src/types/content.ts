export type GuideCategory = 'VISAS' | 'PERMITS' | 'ALTITUDE' | 'CULTURE' | 'BEST_TIME' | string;

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
  is_published?: boolean;
  published_at?: string | null;
  updated_at?: string;
  author_name?: string;
}

export interface TravelGuideDetail extends TravelGuideAdminItem {
  body_markdown?: string;
  meta_title?: string;
  meta_description?: string;
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
  body_markdown?: string;
  meta_title?: string;
  meta_description?: string;
  is_published?: boolean;
}

export type CreateGuidePayload = GuidePayload;
export type UpdateGuidePayload = Partial<GuidePayload>;
