import {BackendError} from './backend';

const inquiryFields = new Set([
  'id','inquiry_number','reference','full_name','email','phone','whatsapp_number','status','trip_title',
  'message','group_size','preferred_dates','created_at','updated_at','assigned_agent','estimated_budget',
  'inquiry_type','tailor_made_detail',
]);
const guideFields = new Set([
  'id','title','slug','destination_name','country','region','category','summary','hero_image_url','gallery_images',
  'body_markdown','meta_title','meta_description','is_published','published_at','updated_at','author_name',
  'view_count','comment_count','comments',
]);

export function projectRecord(value: unknown, allowed: Set<string>) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new BackendError('The staff record is incomplete.');
  return Object.fromEntries(Object.entries(value).filter(([key]) => allowed.has(key)));
}

export function projectPage(value: unknown, allowed: Set<string>) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new BackendError('The staff response is incomplete.');
  if ('results' in value) {
    const page = value as {results?: unknown[]; count?: number; next?: string | null; previous?: string | null};
    if (!Array.isArray(page.results)) throw new BackendError('The staff response is incomplete.');
    return {count: page.count ?? page.results.length, next: page.next ?? null, previous: page.previous ?? null, results: page.results.map(row => projectRecord(row, allowed))};
  }
  return projectRecord(value, allowed);
}

export const projectInquiry = (value: unknown) => projectRecord(value, inquiryFields);
export const projectInquiries = (value: unknown) => projectPage(value, inquiryFields);
function normalizeGuide(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new BackendError('The staff record is incomplete.');
  const source = value as Record<string, unknown>;
  const destination = source.destination && typeof source.destination === 'object' ? source.destination as Record<string, unknown> : undefined;
  const author = source.author && typeof source.author === 'object' ? source.author as Record<string, unknown> : undefined;
  return {
    ...source,
    destination_name: source.destination_name ?? destination?.name,
    summary: source.summary ?? source.meta_description,
    body_markdown: source.body_markdown ?? source.markdown_content,
    author_name: source.author_name ?? author?.full_name,
  };
}

export const projectGuide = (value: unknown) => projectRecord(normalizeGuide(value), guideFields);
export const projectGuides = (value: unknown) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new BackendError('The staff response is incomplete.');
  const page = value as {results?: unknown[]; count?: number; next?: string | null; previous?: string | null};
  if (!Array.isArray(page.results)) throw new BackendError('The staff response is incomplete.');
  return {count: page.count ?? page.results.length, next: page.next ?? null, previous: page.previous ?? null, results: page.results.map(projectGuide)};
};
