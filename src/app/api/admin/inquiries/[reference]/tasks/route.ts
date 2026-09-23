import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, readInput, requiredText, BackendError} from '@/lib/backend';
import {projectTasks, projectTask} from '@/lib/admin';

type Context = {params: Promise<{reference: string}>};
function referenceIsValid(reference: string) { if (!/^[\w-]{1,100}$/.test(reference)) throw new BackendError('Invalid inquiry reference.', 400); }

export async function GET(_request: Request, {params}: Context) {
  try {
    const {reference} = await params; referenceIsValid(reference);
    const {headers} = await staffAccess();
    const data = await backend(`inquiries/${reference}/tasks/`, {headers});
    return NextResponse.json({data: projectTasks(data)}, {headers: noStore});
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request, {params}: Context) {
  try {
    const {reference} = await params; referenceIsValid(reference);
    const input = await readInput(request);
    const title = requiredText(input, 'title', 255);
    const due_at = requiredText(input, 'due_at', 60);

    const {headers} = await staffAccess();
    const data = await backend(`inquiries/${reference}/tasks/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({title, due_at}),
    });
    return NextResponse.json({data: projectTask(data)}, {status: 201, headers: noStore});
  } catch (error) { return apiError(error); }
}
