export type EmailStatus = 'QUEUED' | 'SENT' | 'DELIVERED' | 'BOUNCED' | 'COMPLAINED' | 'FAILED';
export type EmailKind = 'AUTO_ACK' | 'TEMPLATE' | 'MANUAL';

export type EmailTemplate = {
  id: string; slug: string; name: string; subject: string; body_html: string; body_text: string;
  is_system: boolean; is_active: boolean; updated_at: string;
};

export type OutboundEmail = {
  id: string; recipient: string; subject: string; body_html: string; body_text: string; reply_to: string;
  kind: EmailKind; status: EmailStatus; inquiry_number: string | null; template_name: string | null;
  sent_by_name: string | null; attempts: number; last_error: string; sent_at: string | null;
  last_event_at: string | null; created_at: string;
};
