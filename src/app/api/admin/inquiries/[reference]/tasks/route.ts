import {NextResponse} from 'next/server';
import {backend, apiError, noStore, readInput, requiredText, BackendError} from '@/lib/backend';
import {listOf, projectTask, staffInquiry} from '@/lib/crm';

type Context = {params: Promise<{reference: string}>};
export async function GET(_request: Request, {params}: Context) {
  try {
    const {reference, headers} = await staffInquiry(params);
    const data = await backend(`inquiries/${reference}/tasks/?page_size=100`, {headers});
    return NextResponse.json({data: listOf(data).map(projectTask)}, {headers: noStore});
  } catch (error) { return apiError(error); }
}
/** Schedule a follow-up; the backend assigns it to the signed-in agent. */
export async function POST(request: Request, {params}: Context) {
  try {
    const input = await readInput(request);
    const title = requiredText(input, 'title', 255);
    const due = requiredText(input, 'due_at', 40);
    if (Number.isNaN(Date.parse(due))) throw new BackendError('Please choose when to follow up.', 400);
    const {reference, headers} = await staffInquiry(params);
    const data = await backend<Record<string, unknown>>(`inquiries/${reference}/tasks/`, {method: 'POST', headers, body: JSON.stringify({title, due_at: new Date(due).toISOString()})});
    return NextResponse.json({data: projectTask(data)}, {status: 201, headers: noStore});
  } catch (error) { return apiError(error); }
}
