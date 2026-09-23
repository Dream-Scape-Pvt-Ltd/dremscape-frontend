import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, readInput, BackendError} from '@/lib/backend';
import {projectGuide} from '@/lib/admin';

type Context = {params: Promise<{slug: string}>};
async function routeData(params: Context['params']) { const {slug} = await params; if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new BackendError('Invalid guide slug.', 400); const {headers} = await staffAccess(); return {slug, headers}; }
export async function GET(_request: Request, {params}: Context) { try { const {slug, headers} = await routeData(params); const data = await backend(`content/guides/${slug}/`, {headers}); return NextResponse.json({data: projectGuide(data)}, {headers: noStore}); } catch (error) { return apiError(error); } }
export async function PATCH(request: Request, {params}: Context) { try { const input = await readInput(request); const {slug: ignoredSlug, body_markdown, comments, comment_count, view_count, author_name, destination_name, updated_at, published_at, meta_title, meta_description, ...rest} = input; const payload = {...rest, markdown_content: body_markdown}; const {slug, headers} = await routeData(params); const data = await backend(`content/guides/${slug}/`, {method: 'PATCH', headers, body: JSON.stringify(payload)}); return NextResponse.json({data: projectGuide(data)}, {headers: noStore}); } catch (error) { return apiError(error); } }
export async function DELETE(_request: Request, {params}: Context) { try { const {slug, headers} = await routeData(params); const data = await backend(`content/guides/${slug}/`, {method: 'DELETE', headers}); return NextResponse.json({data}, {headers: noStore}); } catch (error) { return apiError(error); } }
