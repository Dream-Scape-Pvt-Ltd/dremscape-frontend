import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {backend,BackendError,apiError,noStore} from '@/lib/backend';
export async function GET(){
 try{const access=(await cookies()).get('dreamscape_session')?.value;if(!access)throw new BackendError('Not signed in.',401);const user=await backend('users/me/',{headers:{Authorization:`Bearer ${access}`}});return NextResponse.json({user},{headers:noStore});}catch(e){return apiError(e);}
}
