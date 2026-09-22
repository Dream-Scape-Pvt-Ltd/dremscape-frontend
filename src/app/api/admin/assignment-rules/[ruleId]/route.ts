import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, readInput, BackendError} from '@/lib/backend';
import {projectAssignmentRule} from '@/lib/admin';

type Context = {params: Promise<{ruleId: string}>};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function routeData(params: Context['params']) {
  const {ruleId} = await params;
  if (!uuidPattern.test(ruleId)) throw new BackendError('Invalid rule identifier.', 400);
  const {headers} = await staffAccess();
  return {ruleId, headers};
}

export async function PATCH(request: Request, {params}: Context) {
  try {
    const input = await readInput(request);
    const {ruleId, headers} = await routeData(params);

    const body: Record<string, unknown> = {};
    if (typeof input.is_active === 'boolean') body.is_active = input.is_active;
    if (typeof input.priority === 'number' && Number.isInteger(input.priority)) body.priority = input.priority;
    if (typeof input.agent_id === 'string') {
      if (!uuidPattern.test(input.agent_id)) throw new BackendError('Please select a valid agent.', 400);
      body.agent_id = input.agent_id;
    }
    if (!Object.keys(body).length) throw new BackendError('Nothing to update.', 400);

    const data = await backend(`inquiries/crm/assignment-rules/${ruleId}/`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body)
    });
    return NextResponse.json({data: projectAssignmentRule(data)}, {headers: noStore});
  } catch (error) { return apiError(error); }
}

export async function DELETE(_request: Request, {params}: Context) {
  try {
    const {ruleId, headers} = await routeData(params);
    await backend(`inquiries/crm/assignment-rules/${ruleId}/`, {method: 'DELETE', headers});
    return NextResponse.json({data: {id: ruleId}}, {headers: noStore});
  } catch (error) { return apiError(error); }
}
