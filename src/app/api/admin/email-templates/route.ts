import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, readInput, requiredText} from '@/lib/backend';
import {projectEmailTemplate, projectEmailTemplates} from '@/lib/admin';
import {templatePayload} from '@/lib/email-input';

export async function GET() {
  try {
    const {headers} = await staffAccess();
    const data = await backend<unknown>('emails/templates/', {headers});
    return NextResponse.json({data: projectEmailTemplates(data)}, {headers: noStore});
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const input = await readInput(request, 100_000);
    const slug = requiredText(input, 'slug', 80);
    const payload = {slug, ...templatePayload(input)};
    const {headers} = await staffAccess();
    const data = await backend<unknown>('emails/templates/', {method: 'POST', headers, body: JSON.stringify(payload)});
    return NextResponse.json({data: projectEmailTemplate(data)}, {status: 201, headers: noStore});
  } catch (error) { return apiError(error); }
}
