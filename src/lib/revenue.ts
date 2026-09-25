import {requiredText, BackendError} from './backend';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Validates a manual revenue entry; shared by create and edit. */
export function revenueEntryBody(input: Record<string, unknown>, partial = false) {
  const body: Record<string, unknown> = {};
  if (!partial || 'amount_usd' in input) {
    const amount = Number(input.amount_usd);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 10_000_000) throw new BackendError('Enter an amount greater than zero.', 400);
    body.amount_usd = amount.toFixed(2);
  }
  if (!partial || 'description' in input) body.description = requiredText(input, 'description', 255);
  if (input.earned_on !== undefined && input.earned_on !== '') {
    const earnedOn = requiredText(input, 'earned_on', 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(earnedOn)) throw new BackendError('Please provide a valid date (YYYY-MM-DD).', 400);
    body.earned_on = earnedOn;
  }
  if ('trip_id' in input) {
    const tripId = input.trip_id;
    if (tripId !== null && tripId !== '' && (typeof tripId !== 'string' || !uuidPattern.test(tripId))) throw new BackendError('Please select a valid trek.', 400);
    body.trip_id = tripId || null;
  }
  return body;
}
