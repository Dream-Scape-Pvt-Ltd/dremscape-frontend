import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend,apiError,readInput,noStore,BackendError,assertSameOrigin} from '@/lib/backend';
import {trekGuideWritePayload} from '@/lib/admin';
import {clearTrekGuidesCache} from '@/lib/trek-guides';

type Context={params:Promise<{slug:string}>};
async function routeData(params:Context['params']){const {slug}=await params;if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw new BackendError('Invalid guide address.',400);const {headers,user}=await staffAccess();if(user.role!=='ADMIN')throw new BackendError('An administrator account is required.',403);return {slug,headers};}

export async function GET(_request:Request,{params}:Context){try{const {slug,headers}=await routeData(params);return NextResponse.json({data:await backend(`content/trek-guides/${slug}/`,{headers})},{headers:noStore});}catch(e){return apiError(e);}}
export async function PATCH(request:Request,{params}:Context){try{const payload=trekGuideWritePayload(await readInput(request));const {slug,headers}=await routeData(params);const data=await backend(`content/trek-guides/${slug}/`,{method:'PATCH',headers,body:JSON.stringify(payload)});clearTrekGuidesCache();return NextResponse.json({data},{headers:noStore});}catch(e){return apiError(e);}}
export async function DELETE(request:Request,{params}:Context){try{assertSameOrigin(request);const permanent=new URL(request.url).searchParams.get('permanent')==='true';const {slug,headers}=await routeData(params);const data=await backend(`content/trek-guides/${slug}/${permanent?'?permanent=true':''}`,{method:'DELETE',headers});clearTrekGuidesCache();return NextResponse.json({data},{headers:noStore});}catch(e){return apiError(e);}}
