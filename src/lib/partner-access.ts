import {cookies} from 'next/headers';
import {backend,BackendError} from './backend';
export async function partnerAccess(){
 const token=(await cookies()).get('dreamscape_session')?.value;
 if(!token)throw new BackendError('Sign in with your agency account to open the partner dashboard.',401);
 const headers={Authorization:`Bearer ${token}`};
 const user=await backend<{role:string}>('users/me/',{headers});
 if(!['B2B_PARTNER','ADMIN'].includes(user.role))throw new BackendError('This dashboard is for approved agency accounts. Contact our partnerships team for access.',403);
 return {headers,user};
}
