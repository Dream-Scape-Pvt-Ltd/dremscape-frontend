import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, readInput, BackendError} from '@/lib/backend';
import {projectTask} from '@/lib/admin';

type Context = {params: Promise<{id: string}>};
const taskStatuses = new Set(['OPEN', 'DONE', 'CANCELLED']);
function idIsValid(id: string) { if (!/^[0-9a-fA-F-]{36}$/.test(id)) throw new BackendError('Invalid task id.', 400); }

export async function PATCH(request: Request, {params}: Context) {
  try {
    const {id} = await params; idIsValid(id);
    const input = await readInput(request);

    const body: Record<string, unknown> = {};
    if ('title' in input) {
      if (typeof input.title !== 'string' || !input.title.trim() || input.title.length > 255) {
        throw new BackendError('Please check title.', 400);
      }
      body.title = input.title.trim();
    }
    if ('due_at' in input) {
      if (typeof input.due_at !== 'string' || !input.due_at.trim()) throw new BackendError('Please check due_at.', 400);
      body.due_at = input.due_at;
    }
    if ('status' in input) {
      if (typeof input.status !== 'string' || !taskStatuses.has(input.status)) throw new BackendError('Please select a valid task status.', 400);
      body.status = input.status;
    }
    if (Object.keys(body).length === 0) throw new BackendError('Nothing to update.', 400);

    const {headers} = await staffAccess();
    const data = await backend(`inquiries/tasks/${id}/`, {method: 'PATCH', headers, body: JSON.stringify(body)});
    return NextResponse.json({data: projectTask(data)}, {headers: noStore});
  } catch (error) { return apiError(error); }
}
