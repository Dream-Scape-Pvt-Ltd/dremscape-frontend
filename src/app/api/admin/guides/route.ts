import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, readInput, requiredText, BackendError} from '@/lib/backend';
import {projectGuide, projectGuides} from '@/lib/admin';

function guidePayload(input: Record<string, unknown>) { const title = requiredText(input, 'title', 180); const slug = requiredText(input, 'slug', 180); if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new BackendError('Please use lowercase letters, numbers, and hyphens for the slug.', 400); return {...input, title, slug}; }
export async function GET(request: Request) { try { const {headers} = await staffAccess(); const query = new URL(request.url).searchParams.toString(); const data = await backend(`content/guides/${query ? `?${query}` : ''}`, {headers}); return NextResponse.json({data: projectGuides(data)}, {headers: noStore}); } catch (error) { return apiError(error); } }
export async function POST(request: Request) { try { const input = guidePayload(await readInput(request)); const {headers} = await staffAccess(); const data = await backend('content/guides/', {method: 'POST', headers, body: JSON.stringify(input)}); return NextResponse.json({data: projectGuide(data)}, {status: 201, headers: noStore}); } catch (error) { return apiError(error); } }
