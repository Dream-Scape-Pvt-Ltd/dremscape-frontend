import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend,apiError,BackendError,noStore,readInput,requiredText} from '@/lib/backend';
async function access(){const auth=await staffAccess();if(auth.user.role!=='ADMIN')throw new BackendError('Administrator access required.',403);return auth;}
function slug(s:string){if(!/^[\w-]+$/.test(s))throw new BackendError('Choose a trip.',400);return s;}
export async function GET(request:Request){try{const {headers}=await access(),params=new URL(request.url).searchParams,trip=slug(params.get('trip')||''),page=Number(params.get('page')||1);if(!Number.isInteger(page)||page<1)throw new BackendError('Invalid page.',400);const data=await backend(`trips/${trip}/reviews/?page=${page}`,{headers});return NextResponse.json({data},{headers:noStore});}catch(e){return apiError(e);}}
export async function PATCH(request:Request){try{const {headers}=await access(),input=await readInput(request),trip=slug(requiredText(input,'trip')),id=requiredText(input,'id');if(!/^[a-f0-9-]{36}$/i.test(id)||typeof input.is_published!=='boolean')throw new BackendError('Invalid review update.',400);const data=await backend(`trips/${trip}/reviews/${id}/`,{method:'PATCH',headers,body:JSON.stringify({is_published:input.is_published})});return NextResponse.json({data},{headers:noStore});}catch(e){return apiError(e);}}
