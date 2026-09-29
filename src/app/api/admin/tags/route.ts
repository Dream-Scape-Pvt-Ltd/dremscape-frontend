import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, readInput, requiredText, BackendError} from '@/lib/backend';
import {listOf} from '@/lib/crm';

export async function GET() {
  try {
    const {headers} = await staffAccess();
    const tags = listOf(await backend('inquiries/tags/?page_size=100', {headers})).map(({id, name, color}) => ({id, name, color}));
    return NextResponse.json({data: tags}, {headers: noStore});
  } catch (error) { return apiError(error); }
}
export async function POST(request: Request) {
  try {
    const input = await readInput(request);
    const name = requiredText(input, 'name', 50);
    const color = typeof input.color === 'string' ? input.color : '#6B7280';
    if (!/^#[0-9a-f]{6}$/i.test(color)) throw new BackendError('Please choose a valid tag colour.', 400);
    const {headers} = await staffAccess();
    const {id} = await backend<{id: string}>('inquiries/tags/', {method: 'POST', headers, body: JSON.stringify({name, color})});
    return NextResponse.json({data: {id, name, color}}, {status: 201, headers: noStore});
  } catch (error) { return apiError(error); }
}
