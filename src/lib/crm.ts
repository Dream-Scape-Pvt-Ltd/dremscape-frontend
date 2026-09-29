import {BackendError} from './backend';
import {staffAccess} from './staff';

// Shared validation for the staff CRM proxy routes.
export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const activityChannels = new Set(['CALL', 'EMAIL', 'WHATSAPP', 'NOTE']);
export const taskStatuses = new Set(['OPEN', 'DONE', 'CANCELLED']);

export function uuidInput(value: unknown, what: string) {
  if (typeof value !== 'string' || !uuidPattern.test(value)) throw new BackendError(`Please select a valid ${what}.`, 400);
  return value;
}

/** Validates an inquiry reference from the URL and returns it with the staff auth headers. */
export async function staffInquiry(params: Promise<{reference: string}>) {
  const {reference} = await params;
  if (!/^[\w-]{1,100}$/.test(reference)) throw new BackendError('Invalid inquiry reference.', 400);
  const {headers} = await staffAccess();
  return {reference, headers};
}

type Person = {id?: string; full_name?: string; email?: string} | null | undefined;
const personName = (person: Person) => person?.full_name || person?.email || null;

/** Staff-safe task: the agent collapses to a display name. */
export function projectTask(task: Record<string, unknown>) {
  const {id, inquiry_number, inquiry_full_name, title, due_at, status, completed_at, created_at} = task;
  return {id, inquiry_number, inquiry_full_name, title, due_at, status, completed_at, created_at, assigned_agent_name: personName(task.assigned_agent as Person)};
}

export function projectActivity(activity: Record<string, unknown>) {
  const {id, channel, body, created_at} = activity;
  return {id, channel, body, created_at, author: {full_name: personName(activity.author as Person) || undefined}};
}

/** Unpaginated or paginated DRF lists → a plain array. */
export function listOf(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data;
  const results = (data as {results?: unknown})?.results;
  return Array.isArray(results) ? results : [];
}
