import {NextResponse} from 'next/server';
import {backend, apiError, noStore, readInput, requiredText, BackendError} from '@/lib/backend';
import {activityChannels, listOf, projectActivity, staffInquiry} from '@/lib/crm';

type Context = {params: Promise<{reference: string}>};
export async function GET(_request: Request, {params}: Context) {
  try {
    const {reference, headers} = await staffInquiry(params);
    const data = await backend(`inquiries/${reference}/activities/?page_size=100`, {headers});
    return NextResponse.json({data: listOf(data).map(projectActivity)}, {headers: noStore});
  } catch (error) { return apiError(error); }
}
/** Log a call, email or WhatsApp touch. The first one stamps the lead's first response time. */
export async function POST(request: Request, {params}: Context) {
  try {
    const input = await readInput(request);
    if (typeof input.channel !== 'string' || !activityChannels.has(input.channel)) throw new BackendError('Please choose how you contacted the traveller.', 400);
    const body = requiredText(input, 'body', 5000);
    const {reference, headers} = await staffInquiry(params);
    const data = await backend<Record<string, unknown>>(`inquiries/${reference}/activities/`, {method: 'POST', headers, body: JSON.stringify({channel: input.channel, body})});
    return NextResponse.json({data: projectActivity(data)}, {status: 201, headers: noStore});
  } catch (error) { return apiError(error); }
}
