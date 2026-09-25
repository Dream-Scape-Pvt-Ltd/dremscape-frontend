import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, readInput, requiredText, BackendError} from '@/lib/backend';
import {GUIDE_INPUT_LIMIT, guideWritePayload, projectGuide, projectGuides} from '@/lib/admin';

function guidePayload(input: Record<string, unknown>) {
  const title = requiredText(input, 'title', 180);
  const cleanSlug = typeof input.slug === 'string' ? input.slug.trim() : '';
  if (cleanSlug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)) throw new BackendError('The blog address could not be generated.', 400);
  return {...guideWritePayload(input), title, ...(cleanSlug ? {slug: cleanSlug} : {}), country: typeof input.country === 'string' && input.country.trim() ? input.country : 'NEPAL'};
}
export async function GET(request: Request) { try { const {headers} = await staffAccess(); const query = new URL(request.url).searchParams.toString(); const data = await backend(`content/guides/${query ? `?${query}` : ''}`, {headers}); return NextResponse.json({data: projectGuides(data)}, {headers: noStore}); } catch (error) { return apiError(error); } }
export async function POST(request: Request) { try { const input = guidePayload(await readInput(request, GUIDE_INPUT_LIMIT)); const {headers} = await staffAccess(); const data = await backend('content/guides/', {method: 'POST', headers, body: JSON.stringify(input)}); return NextResponse.json({data: projectGuide(data)}, {status: 201, headers: noStore}); } catch (error) { return apiError(error); } }
