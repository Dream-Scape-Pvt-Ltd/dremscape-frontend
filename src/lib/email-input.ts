import {requiredText} from './backend';

/** Validated template fields shared by the create and update routes. */
export function templatePayload(input: Record<string, unknown>) {
  return {
    name: requiredText(input, 'name', 120),
    subject: requiredText(input, 'subject', 200),
    body_html: requiredText(input, 'body_html', 60000),
    body_text: requiredText(input, 'body_text', 20000),
    is_active: input.is_active !== false,
  };
}
