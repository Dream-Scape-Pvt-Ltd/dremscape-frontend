import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, readInput, BackendError} from '@/lib/backend';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Reassign a set of leads — a selection, or a whole tour batch — to one agent. */
export async function POST(request: Request) {
  try {
    const input = await readInput(request);

    const agentId = input.agent_id;
    if (typeof agentId !== 'string' || !uuidPattern.test(agentId)) {
      throw new BackendError('Please select a valid agent.', 400);
    }

    const body: Record<string, unknown> = {agent_id: agentId};

    if ('inquiry_numbers' in input) {
      const numbers = input.inquiry_numbers;
      if (!Array.isArray(numbers) || numbers.length === 0 || numbers.length > 500) {
        throw new BackendError('Please select between 1 and 500 leads.', 400);
      }
      if (!numbers.every(value => typeof value === 'string' && /^[\w-]{1,30}$/.test(value))) {
        throw new BackendError('One of the selected leads is invalid.', 400);
      }
      body.inquiry_numbers = numbers;
    }
    if (typeof input.trip === 'string' && input.trip.trim()) {
      const trip = input.trip.trim();
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trip)) throw new BackendError('Invalid trek identifier.', 400);
      body.trip = trip;
    }
    if (typeof input.departure === 'string' && input.departure.trim()) {
      if (!uuidPattern.test(input.departure.trim())) throw new BackendError('Invalid departure identifier.', 400);
      body.departure = input.departure.trim();
    }
    if (typeof input.only_unassigned === 'boolean') body.only_unassigned = input.only_unassigned;

    if (!body.inquiry_numbers && !body.trip && !body.departure) {
      throw new BackendError('Select some leads, or a tour and departure, to reassign.', 400);
    }

    const {headers} = await staffAccess();
    const data = await backend<{matched: number; reassigned: number}>('inquiries/bulk-assign/', {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    return NextResponse.json(
      {data: {matched: data.matched, reassigned: data.reassigned}},
      {headers: noStore}
    );
  } catch (error) { return apiError(error); }
}
