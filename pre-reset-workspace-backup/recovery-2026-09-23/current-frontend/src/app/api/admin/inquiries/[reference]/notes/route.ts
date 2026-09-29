import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, readInput, requiredText, BackendError} from '@/lib/backend';

type Context = {params: Promise<{reference: string}>};
async function headersFor(params: Context['params']) { const {reference} = await params; if (!/^[\w-]{1,100}$/.test(reference)) throw new BackendError('Invalid inquiry reference.', 400); const {headers} = await staffAccess(); return {reference, headers}; }
export async function GET(_request: Request, {params}: Context) { try { const {reference, headers} = await headersFor(params); const data = await backend(`inquiries/${reference}/notes/`, {headers}); return NextResponse.json({data}, {headers: noStore}); } catch (error) { return apiError(error); } }
export async function POST(request: Request, {params}: Context) { try { const input = await readInput(request); const note_text = requiredText(input, 'note_text', 5000); const {reference, headers} = await headersFor(params); const data = await backend(`inquiries/${reference}/notes/`, {method: 'POST', headers, body: JSON.stringify({note_text})}); return NextResponse.json({data}, {status: 201, headers: noStore}); } catch (error) { return apiError(error); } }
