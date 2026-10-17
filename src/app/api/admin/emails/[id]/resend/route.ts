import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, assertSameOrigin, BackendError} from '@/lib/backend';
import {projectOutboundEmail} from '@/lib/admin';

export async function POST(request: Request, {params}: {params: Promise<{id: string}>}) {
  try {
    assertSameOrigin(request);
    const {id} = await params;
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new BackendError('Invalid email.', 400);
    const {headers} = await staffAccess();
    const data = await backend<unknown>(`emails/${id}/resend/`, {method: 'POST', headers});
    return NextResponse.json({data: projectOutboundEmail(data)}, {headers: noStore});
  } catch (error) { return apiError(error); }
}
