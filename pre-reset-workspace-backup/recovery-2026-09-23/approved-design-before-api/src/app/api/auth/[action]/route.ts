import {NextResponse} from 'next/server';
import {backend,apiError,BackendError,readInput,requiredText,emailInput,noStore} from '@/lib/backend';
export async function POST(request:Request,{params}:{params:Promise<{action:string}>}) {
  try {
    const input=await readInput(request),{action}=await params;
    if(action==='logout') {const response=NextResponse.json({success:true},{headers:noStore});response.cookies.set('dreamscape_session','',{httpOnly:true,sameSite:'lax',path:'/',maxAge:0,secure:request.headers.get('x-forwarded-proto')==='https'||new URL(request.url).protocol==='https:'});return response;}
    if(action==='confirm') {
      const uid=requiredText(input,'uid'),token=requiredText(input,'token');
      requiredText(input,'new_password',1024);
      if(input.new_password!==input.new_password_confirm)throw new BackendError('Passwords do not match.',400);
      await backend('auth/password/reset/confirm/',{method:'POST',body:JSON.stringify({uid,token,new_password:input.new_password,new_password_confirm:input.new_password_confirm})});
      const response=NextResponse.json({success:true},{headers:noStore});response.cookies.delete('dreamscape_session');return response;
    }
    if(!['login','register','reset'].includes(action))throw new BackendError('Not found.',404);
    const payload:Record<string,unknown>={email:emailInput(input)};
    if(action!=='reset') {
      // Passwords must be sent exactly as entered, including intentional whitespace.
      requiredText(input,'password',1024);payload.password=input.password;
      if(action==='register') {
        payload.first_name=requiredText(input,'first_name',150);payload.last_name=requiredText(input,'last_name',150);
        if(input.password_confirm!==input.password)throw new BackendError('Passwords do not match.',400);
        payload.password_confirm=input.password_confirm;
      }
    }
    const data=await backend<{access?:string;user?:unknown}>(`auth/${action==='reset'?'password/reset':action}/`,{method:'POST',body:JSON.stringify(payload)});
    if(action==='reset')return NextResponse.json({success:true,message:'If an account matches this email, the team’s password-reset service will send instructions.'},{headers:noStore});
    if(!data.access||!data.user)throw new BackendError('Sign-in could not be confirmed. Please try again.');
    const response=NextResponse.json({success:true},{headers:noStore});
    response.cookies.set('dreamscape_session',data.access,{httpOnly:true,sameSite:'lax',secure:request.headers.get('x-forwarded-proto')==='https'||new URL(request.url).protocol==='https:',path:'/'});
    return response;
  }catch(error){return apiError(error);}
}
