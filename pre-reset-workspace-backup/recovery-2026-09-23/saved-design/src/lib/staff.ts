import {cookies} from 'next/headers';
import {backend,BackendError} from './backend';
export async function staffAccess(){const token=(await cookies()).get('dreamscape_session')?.value;if(!token)throw new BackendError('Sign in with a staff account to open this dashboard.',401);const headers={Authorization:`Bearer ${token}`};const user=await backend<{full_name:string;role:string}>('users/me/',{headers});if(!['ADMIN','SALES_AGENT'].includes(user.role))throw new BackendError('This dashboard is available to Dreamscape staff only.',403);return {headers,user};}
