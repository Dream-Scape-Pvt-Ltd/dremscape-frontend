import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, BackendError} from '@/lib/backend';
import {projectCustomer} from '@/lib/admin';

type Context = {params: Promise<{email: string}>};
function emailIsValid(email: string) { if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new BackendError('Invalid customer email.', 400); }

export async function GET(_request: Request, {params}: Context) {
  try {
    // Next.js already URL-decodes dynamic segment params, so `email` here is
    // the plain address (e.g. "john@example.com"), not percent-encoded.
    const {email} = await params;
    emailIsValid(email);
    const {headers} = await staffAccess();
    const data = await backend(`inquiries/crm/customers/${encodeURIComponent(email)}/`, {headers});
    return NextResponse.json({data: projectCustomer(data)}, {headers: noStore});
  } catch (error) { return apiError(error); }
}
