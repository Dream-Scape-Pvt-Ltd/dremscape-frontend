import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {backend, apiError, BackendError, readInput, requiredText, emailInput, noStore} from '@/lib/backend';
import {getJourney} from '@/lib/journeys';

type WaitlistEntry = {id: string; position: number; status: string; num_travelers: number};

/**
 * Join the waitlist for a full departure.
 *
 * Mirrors the booking handler's shape but collects far less: no passports, no
 * payment. Those are gathered later, if a seat is actually offered.
 */
export async function POST(request: Request) {
  try {
    const input = await readInput(request);
    const {journey} = await getJourney(requiredText(input, 'trek_slug'));
    const departure = journey.departures.find(d => d.id === input.departure_id);
    if (!departure) throw new BackendError('That departure could not be found.', 404);
    if (!departure.waitlist_enabled) {
      throw new BackendError('This departure is not accepting waitlist requests.', 409);
    }

    const travellers = Number(input.num_travelers ?? 1);
    if (!Number.isInteger(travellers) || travellers < 1 || travellers > journey.max_group_size) {
      throw new BackendError('Please check the number of travellers.', 400);
    }

    const payload = {
      departure_id: departure.id,
      customer_name: requiredText(input, 'customer_name'),
      customer_email: emailInput(input, 'customer_email'),
      customer_phone: input.customer_phone ? requiredText(input, 'customer_phone', 50) : '',
      num_travelers: travellers
    };

    const token = (await cookies()).get('dreamscape_session')?.value;
    const data = await backend<WaitlistEntry>('bookings/waitlist/', {
      method: 'POST',
      headers: token ? {Authorization: `Bearer ${token}`} : {},
      body: JSON.stringify(payload)
    });
    if (!data.id || !Number.isFinite(Number(data.position))) {
      throw new BackendError('We could not confirm your waitlist request. Please contact the team before trying again.');
    }

    const {id, position, status, num_travelers} = data;
    return NextResponse.json(
      {success: true, entry: {id, position, status, num_travelers}},
      {status: 201, headers: noStore}
    );
  } catch (error) { return apiError(error); }
}
