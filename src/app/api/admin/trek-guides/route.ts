import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend,apiError,readInput,noStore,BackendError} from '@/lib/backend';
import {trekGuideWritePayload} from '@/lib/admin';
import {clearTrekGuidesCache} from '@/lib/trek-guides';

/** Guide profiles are edited by administrators only, matching the backend's permission. */
async function access(){const {headers,user}=await staffAccess();if(user.role!=='ADMIN')throw new BackendError('An administrator account is required.',403);return headers;}

export async function GET(){try{const headers=await access();const records:unknown[]=[];for(let page=1;page<=100;page++){const data=await backend<{results:unknown[];next:string|null}>(`content/trek-guides/?page_size=100&page=${page}`,{headers});records.push(...data.results);if(!data.next)return NextResponse.json({data:records},{headers:noStore});}throw new BackendError('Too many guides to load.');}catch(e){return apiError(e);}}
export async function POST(request:Request){try{const payload=trekGuideWritePayload(await readInput(request));if(typeof payload.slug!=='string'||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.slug))throw new BackendError('Use lowercase letters, numbers and hyphens for the web address.',400);const headers=await access();const data=await backend('content/trek-guides/',{method:'POST',headers,body:JSON.stringify(payload)});clearTrekGuidesCache();return NextResponse.json({data},{status:201,headers:noStore});}catch(e){return apiError(e);}}
