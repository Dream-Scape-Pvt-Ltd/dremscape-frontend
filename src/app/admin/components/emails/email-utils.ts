import type {EmailKind, EmailStatus} from '@/types/email';

export const VARIABLES = [
  {name: 'full_name', label: "Customer's name"},
  {name: 'trip_title', label: 'Trip they asked about'},
  {name: 'inquiry_number', label: 'Inquiry reference'},
  {name: 'departure_label', label: 'Chosen departure date'},
] as const;

export const STATUS_LABEL: Record<EmailStatus, string> = {
  QUEUED: 'Queued', SENT: 'Sent', DELIVERED: 'Delivered', BOUNCED: 'Bounced', COMPLAINED: 'Marked as spam', FAILED: 'Failed',
};

export const KIND_LABEL: Record<EmailKind, string> = {
  AUTO_ACK: 'Automatic reply', TEMPLATE: 'Template', MANUAL: 'Written by hand',
};

export const STATUS_TONE: Record<EmailStatus, 'good' | 'warn' | 'bad' | 'neutral'> = {
  QUEUED: 'neutral', SENT: 'warn', DELIVERED: 'good', BOUNCED: 'bad', COMPLAINED: 'bad', FAILED: 'bad',
};

const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Plain message → the simple HTML wrapper the seeded templates use. Placeholders pass through untouched. */
export function textToHtml(text: string) {
  const paragraphs = text.split(/\n{2,}/).map(part => `<p>${escapeHtml(part.trim()).replace(/\n/g, '<br>')}</p>`).join('');
  return `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#222">${paragraphs}</div>`;
}

export function dateTime(value?: string | null) {
  return value ? new Intl.DateTimeFormat('en-US', {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'}).format(new Date(value)) : '—';
}

export function hasPlaceholder(...texts: string[]) {
  return texts.some(text => /\{\{\s*[a-z_]+\s*\}\}/.test(text));
}
