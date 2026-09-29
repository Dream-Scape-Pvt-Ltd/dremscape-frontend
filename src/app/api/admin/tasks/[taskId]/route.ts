import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, readInput, BackendError} from '@/lib/backend';
import {projectTask, taskStatuses, uuidInput} from '@/lib/crm';

type Context = {params: Promise<{taskId: string}>};
export async function PATCH(request: Request, {params}: Context) {
  try {
    const taskId = uuidInput((await params).taskId, 'task');
    const input = await readInput(request);
    if (typeof input.status !== 'string' || !taskStatuses.has(input.status)) throw new BackendError('Please choose a valid task status.', 400);
    const {headers} = await staffAccess();
    const data = await backend<Record<string, unknown>>(`inquiries/tasks/${taskId}/`, {method: 'PATCH', headers, body: JSON.stringify({status: input.status})});
    return NextResponse.json({data: projectTask(data)}, {headers: noStore});
  } catch (error) { return apiError(error); }
}
