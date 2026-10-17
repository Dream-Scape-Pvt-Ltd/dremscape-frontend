import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, readInput, assertSameOrigin, BackendError} from '@/lib/backend';
import {projectEmailTemplate} from '@/lib/admin';
import {templatePayload} from '@/lib/email-input';

type Context = {params: Promise<{id: string}>};
async function templateId(params: Context['params']) {
  const {id} = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new BackendError('Invalid template.', 400);
  return id;
}

export async function PATCH(request: Request, {params}: Context) {
  try {
    const input = await readInput(request, 100_000);
    const id = await templateId(params);
    const {headers} = await staffAccess();
    const data = await backend<unknown>(`emails/templates/${id}/`, {method: 'PATCH', headers, body: JSON.stringify(templatePayload(input))});
    return NextResponse.json({data: projectEmailTemplate(data)}, {headers: noStore});
  } catch (error) { return apiError(error); }
}

export async function DELETE(request: Request, {params}: Context) {
  try {
    assertSameOrigin(request);
    const id = await templateId(params);
    const {headers} = await staffAccess();
    await backend(`emails/templates/${id}/`, {method: 'DELETE', headers});
    return NextResponse.json({data: {success: true}}, {headers: noStore});
  } catch (error) { return apiError(error); }
}
