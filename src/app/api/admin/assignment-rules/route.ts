import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, readInput, BackendError} from '@/lib/backend';
import {projectAssignmentRule, projectAssignmentRules} from '@/lib/admin';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function optionalUuid(input: Record<string, unknown>, key: string) {
  const value = input[key];
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || !uuidPattern.test(value)) {
    throw new BackendError(`Please select a valid ${key.replaceAll('_', ' ')}.`, 400);
  }
  return value;
}

export async function GET() {
  try {
    const {headers} = await staffAccess();
    const data = await backend('inquiries/crm/assignment-rules/?page_size=100', {headers});
    return NextResponse.json({data: projectAssignmentRules(data)}, {headers: noStore});
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const input = await readInput(request);

    const agentId = input.agent_id;
    if (typeof agentId !== 'string' || !uuidPattern.test(agentId)) {
      throw new BackendError('Please select a valid agent.', 400);
    }

    const body: Record<string, unknown> = {agent_id: agentId};
    for (const key of ['departure', 'trip', 'destination'] as const) {
      const value = optionalUuid(input, key);
      if (value) body[key] = value;
    }
    if (!body.departure && !body.trip && !body.destination) {
      throw new BackendError('Choose a departure, tour, or destination for this rule.', 400);
    }
    if (typeof input.priority === 'number' && Number.isInteger(input.priority)) {
      body.priority = input.priority;
    }

    const {headers} = await staffAccess();
    const data = await backend('inquiries/crm/assignment-rules/', {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    return NextResponse.json({data: projectAssignmentRule(data)}, {headers: noStore});
  } catch (error) { return apiError(error); }
}
