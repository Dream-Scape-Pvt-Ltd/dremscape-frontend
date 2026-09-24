import {BackendError} from './backend';

const inquiryFields = new Set([
  'id','inquiry_number','reference','full_name','email','phone','whatsapp_number','status','trip_title',
  'trip_slug','departure','departure_label','assigned_agent_name','assigned_agent_id',
  'message','group_size','preferred_dates','created_at','updated_at','assigned_agent','estimated_budget',
  'inquiry_type','tailor_made_detail',
  'lost_reason','tags','sla_breached','first_response_at','converted_booking_reference','converted_at',
  'travelers_count','seats_held','revenue_usd',
]);
const departureFields = new Set([
  'id','trip','trip_title','trip_slug','start_date','end_date','price_usd','max_seats','booked_seats',
  'reserved_seats','available_seats','utilization_pct','open_inquiry_count','waitlisted_count',
  'capacity_state','availability_state','status','status_locked','waitlist_enabled','few_seats_threshold',
  'is_guaranteed',
]);
const agentFields = new Set(['id','email','full_name','role']);
const waitlistFields = new Set([
  'id','departure','trip_title','trip_slug','start_date','end_date','customer_name','customer_email',
  'customer_phone','num_travelers','position','status','offered_at','offer_expires_at','created_at',
]);
const assignmentRuleFields = new Set([
  'id','departure','trip','trip_title','destination','destination_name','agent','target_label',
  'priority','is_active','created_at',
]);
const guideFields = new Set([
  'id','title','slug','destination_name','country','region','category','summary','hero_image_url','gallery_images',
  'body_markdown','meta_title','meta_description','is_published','published_at','updated_at','author_name',
  'view_count','comment_count','comments',
]);
const activityFields = new Set(['id','author','channel','body','created_at']);
const taskFields = new Set([
  'id','inquiry','inquiry_number','inquiry_full_name','assigned_agent','title','due_at','status',
  'completed_at','created_at',
]);
const tagFields = new Set(['id','name','color']);
const customerInquiryFields = new Set(['id','inquiry_number','inquiry_type','status','trip_title','created_at']);
const customerBookingFields = new Set(['id','booking_reference','status','total_amount_usd','trip_start_date','created_at']);
const customerFields = new Set([
  'id','email','full_name','phone','whatsapp_number','lifetime_inquiries','lifetime_bookings',
  'lifetime_value_usd','inquiries','bookings','created_at',
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
export const projectDeparture = (value: unknown) => projectRecord(value, departureFields);
export const projectDepartures = (value: unknown) => projectPage(value, departureFields);
export const projectAgents = (value: unknown) => projectArray(value, agentFields);
export const projectWaitlist = (value: unknown) => projectArray(value, waitlistFields);
export const projectAssignmentRule = (value: unknown) => projectRecord(value, assignmentRuleFields);
export const projectAssignmentRules = (value: unknown) => projectPage(value, assignmentRuleFields);

/** Some staff endpoints return a bare array rather than a paginated page. */
export function projectArray(value: unknown, allowed: Set<string>) {
  if (!Array.isArray(value)) throw new BackendError('The staff response is incomplete.');
  return value.map(row => projectRecord(row, allowed));
}
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

export const projectActivity = (value: unknown) => projectRecord(value, activityFields);
export const projectActivities = (value: unknown) => projectPage(value, activityFields);
export const projectTask = (value: unknown) => projectRecord(value, taskFields);
export const projectTasks = (value: unknown) => projectPage(value, taskFields);
export const projectTag = (value: unknown) => projectRecord(value, tagFields);
export const projectTags = (value: unknown) => projectPage(value, tagFields);
// InquiryTagView (attach/detach) returns a plain, non-paginated array of tags.
export function projectTagArray(value: unknown) {
  if (!Array.isArray(value)) throw new BackendError('The staff response is incomplete.');
  return value.map(row => projectRecord(row, tagFields));
}

export function projectCustomer(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new BackendError('The staff record is incomplete.');
  const source = value as Record<string, unknown>;
  const inquiries = Array.isArray(source.inquiries)
    ? source.inquiries.map(row => projectRecord(row, customerInquiryFields))
    : [];
  const bookings = Array.isArray(source.bookings)
    ? source.bookings.map(row => projectRecord(row, customerBookingFields))
    : [];
  return projectRecord({...source, inquiries, bookings}, customerFields);
}

/**
 * Timeline entries are heterogeneous — {entry_type, created_at, data} where
 * `data` is either an Activity or a legacy InquiryNote — so each entry's
 * `data` is routed through the matching allowlist by entry_type.
 */
export function projectTimeline(value: unknown) {
  if (!Array.isArray(value)) throw new BackendError('The staff response is incomplete.');
  const noteFields = new Set(['id', 'author', 'note_text', 'created_at']);
  return value.map(entry => {
    if (!entry || typeof entry !== 'object') throw new BackendError('The staff response is incomplete.');
    const row = entry as {entry_type?: string; created_at?: string; data?: unknown};
    const data = row.entry_type === 'activity' ? projectRecord(row.data, activityFields) : projectRecord(row.data, noteFields);
    return {entry_type: row.entry_type, created_at: row.created_at, data};
  });
}
