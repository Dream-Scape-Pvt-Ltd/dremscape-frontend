import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, readInput, requiredText, BackendError} from '@/lib/backend';
import {projectInquiry} from '@/lib/admin';

type Context = {params: Promise<{reference: string}>};
const statuses = new Set(['NEW','ASSIGNED','IN_CONTACT','TRAVELING','COMPLETED','CLOSED']);
const lostReasons = new Set(['PRICE','DATES','COMPETITOR','NO_RESPONSE','NOT_SUITABLE','OTHER']);
function referenceIsValid(reference: string) { if (!/^[\w-]{1,100}$/.test(reference)) throw new BackendError('Invalid inquiry reference.', 400); }

export async function GET(_request: Request, {params}: Context) {
  try { const {reference} = await params; referenceIsValid(reference); const {headers} = await staffAccess(); const data = await backend(`inquiries/${reference}/`, {headers}); return NextResponse.json({data: projectInquiry(data)}, {headers: noStore}); } catch (error) { return apiError(error); }
}
export async function PATCH(request: Request, {params}: Context) {
  try {
    const {reference} = await params; referenceIsValid(reference);
    const input = await readInput(request); const status = requiredText(input, 'status', 30);
    if (!statuses.has(status)) throw new BackendError('Please select a valid inquiry status.', 400);

    const body: Record<string, unknown> = {status};
    if ('assigned_agent_id' in input) {
      const agentId = input.assigned_agent_id;
      if (agentId !== null && typeof agentId !== 'string') throw new BackendError('Please select a valid agent.', 400);
      body.assigned_agent_id = agentId;
    }
    if ('lost_reason' in input) {
      const lostReason = input.lost_reason;
      if (lostReason !== '' && !(typeof lostReason === 'string' && lostReasons.has(lostReason))) {
        throw new BackendError('Please select a valid lost reason.', 400);
      }
      body.lost_reason = lostReason;
    }

    const {headers} = await staffAccess(); const data = await backend(`inquiries/${reference}/`, {method: 'PATCH', headers, body: JSON.stringify(body)});
    return NextResponse.json({data: projectInquiry(data)}, {headers: noStore});
  } catch (error) { return apiError(error); }
}
