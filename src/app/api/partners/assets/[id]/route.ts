import {partnerAccess} from '@/lib/partner-access';
import {backend,apiError,noStore,BackendError} from '@/lib/backend';
import {isUuid} from '@/lib/links';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){try{
 const {id}=await params;if(!isUuid(id))throw new BackendError('Invalid asset.',400);
 const {headers}=await partnerAccess();
 const data=await backend<{download_url:string}>(`b2b/assets/${id}/download/`,{headers});
 const base=new URL(process.env.BACKEND_API_URL!.replace(/\/$/,'')+'/');const url=new URL(data.download_url);
 if(url.origin!==base.origin||url.pathname!==base.pathname+`b2b/assets/${id}/file/`)throw new BackendError('The download address could not be verified.');
 const file=await fetch(url,{headers,redirect:'error',cache:'no-store',signal:AbortSignal.timeout(30000)});
 if(!file.ok)throw new BackendError('This download is unavailable or has expired.',file.status);
 return new Response(file.body,{headers:{...noStore,'Content-Type':'application/octet-stream','X-Content-Type-Options':'nosniff','Content-Disposition':file.headers.get('Content-Disposition')||'attachment'}});
}catch(error){return apiError(error);}}
