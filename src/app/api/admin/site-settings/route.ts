import {revalidateTag} from 'next/cache';
import {staffAccess} from '@/lib/staff';
import {backend,apiError,readInput,noStore,BackendError} from '@/lib/backend';
export async function GET(){try{const {headers,user}=await staffAccess();if(user.role!=='ADMIN')throw new BackendError('An administrator account is required.',403);return Response.json({data:await backend('content/site-settings/',{headers})},{headers:noStore});}catch(error){return apiError(error);}}
export async function PATCH(request:Request){try{const {headers,user}=await staffAccess();if(user.role!=='ADMIN')throw new BackendError('An administrator account is required.',403);const input=await readInput(request,500000);const data=await backend('content/site-settings/',{method:'PATCH',headers,body:JSON.stringify(input)});revalidateTag('website-settings',{expire:0});return Response.json({data},{headers:noStore});}catch(error){return apiError(error);}}
