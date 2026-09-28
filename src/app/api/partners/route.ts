import {partnerAccess} from '@/lib/partner-access';
import {backend,apiError,noStore,BackendError} from '@/lib/backend';
export async function GET(request:Request){try{
 const {headers}=await partnerAccess();
 const page=Number(new URL(request.url).searchParams.get('page')||1);
 if(!Number.isInteger(page)||page<1||page>10000)throw new BackendError('Invalid page.',400);
 const profile=await backend<{approved:boolean}>('b2b/partners/me/',{headers});
 if(!profile.approved)return Response.json({profile,assets:[],bookings:[],next:false,previous:false},{headers:noStore});
 const [assets,bookings]=await Promise.all([backend<{results:unknown[];next:string|null}>('b2b/assets/?page='+page,{headers}),backend<{results:unknown[];next:string|null}>('b2b/bookings/?page='+page,{headers})]);
 return Response.json({profile,assets:assets.results,bookings:bookings.results,next:!!assets.next||!!bookings.next,previous:page>1},{headers:noStore});
}catch(error){return apiError(error);}}
