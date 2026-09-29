import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, readInput, BackendError} from '@/lib/backend';
import {uuidInput} from '@/lib/crm';

/** Hand many open leads to one agent. The backend skips booked and closed leads. */
export async function POST(request: Request) {
  try {
    const input = await readInput(request);
    const agent_id = uuidInput(input.agent_id, 'agent');
    const numbers = input.inquiry_numbers;
    if (!Array.isArray(numbers) || !numbers.length || numbers.length > 200 || !numbers.every(item => typeof item === 'string' && /^[\w-]{1,30}$/.test(item))) {
      throw new BackendError('Please select the leads to assign.', 400);
    }
    const {headers} = await staffAccess();
    const data = await backend<{matched: number; reassigned: number}>('inquiries/bulk-assign/', {method: 'POST', headers, body: JSON.stringify({agent_id, inquiry_numbers: numbers})});
    return NextResponse.json({data: {matched: data.matched, reassigned: data.reassigned}}, {headers: noStore});
  } catch (error) { return apiError(error); }
}
