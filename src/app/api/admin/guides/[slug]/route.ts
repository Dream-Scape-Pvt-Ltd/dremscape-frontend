import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, readInput, BackendError, assertSameOrigin} from '@/lib/backend';
import {GUIDE_INPUT_LIMIT, guideWritePayload, projectGuide} from '@/lib/admin';

type Context = {params: Promise<{slug: string}>};
async function routeData(params: Context['params']) { const {slug} = await params; if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new BackendError('Invalid guide slug.', 400); const {headers} = await staffAccess(); return {slug, headers}; }
export async function GET(_request: Request, {params}: Context) { try { const {slug, headers} = await routeData(params); const data = await backend(`content/guides/${slug}/`, {headers}); return NextResponse.json({data: projectGuide(data)}, {headers: noStore}); } catch (error) { return apiError(error); } }
export async function PATCH(request: Request, {params}: Context) { try { const payload = guideWritePayload(await readInput(request, GUIDE_INPUT_LIMIT)); const {slug, headers} = await routeData(params); const data = await backend(`content/guides/${slug}/`, {method: 'PATCH', headers, body: JSON.stringify(payload)}); return NextResponse.json({data: projectGuide(data)}, {headers: noStore}); } catch (error) { return apiError(error); } }
export async function DELETE(request: Request, {params}: Context) { try { assertSameOrigin(request); const permanent = new URL(request.url).searchParams.get('permanent') === 'true'; const {slug, headers} = await routeData(params); const data = await backend(`content/guides/${slug}/${permanent ? '?permanent=true' : ''}`, {method: 'DELETE', headers}); return NextResponse.json({data}, {headers: noStore}); } catch (error) { return apiError(error); } }
