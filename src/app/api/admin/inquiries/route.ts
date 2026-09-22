import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore} from '@/lib/backend';
import {projectInquiries} from '@/lib/admin';

export async function GET(request: Request) {
  try {
    const {headers} = await staffAccess();
    const params = new URL(request.url).searchParams;
    const page = Math.max(1, Number(params.get('page') || 1));
    const search = params.get('search')?.trim();
    const status = params.get('status')?.trim();
    const query = new URLSearchParams({page: String(page), page_size: '20'});
    if (search) query.set('search', search);
    if (status && status !== 'ALL') query.set('status', status);
    // Tour-based filters. Forwarded verbatim; the backend FilterSet validates
    // them and returns 400 on anything malformed.
    for (const key of ['trip', 'departure', 'inquiry_type', 'assigned_agent'] as const) {
      const value = params.get(key)?.trim();
      if (value && value !== 'ALL') query.set(key, value);
    }
    const data = await backend(`inquiries/?${query}`, {headers});
    return NextResponse.json({data: projectInquiries(data)}, {headers: noStore});
  } catch (error) { return apiError(error); }
}
