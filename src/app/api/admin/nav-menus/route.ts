import {revalidateTag} from 'next/cache';
import {backend,apiError,readInput,noStore} from '@/lib/backend';
import {adminHeaders,navMenuInput,NAV_MENUS_ADMIN_PATH} from '@/lib/menu-items-admin';

export async function GET(){
  try{return Response.json({data:await backend(NAV_MENUS_ADMIN_PATH,{headers:await adminHeaders()})},{headers:noStore});}
  catch(error){return apiError(error);}
}

export async function POST(request:Request){
  try{
    const headers=await adminHeaders();
    const created=await backend(NAV_MENUS_ADMIN_PATH,{method:'POST',headers,body:JSON.stringify(navMenuInput(await readInput(request,20000),true))});
    revalidateTag('navigation',{expire:0});
    return Response.json({data:created},{status:201,headers:noStore});
  }catch(error){return apiError(error);}
}
