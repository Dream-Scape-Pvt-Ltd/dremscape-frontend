import {revalidateTag} from 'next/cache';
import {backend,apiError,readInput,noStore,BackendError} from '@/lib/backend';
import {adminHeaders,navMenuInput,NAV_MENUS_ADMIN_PATH} from '@/lib/menu-items-admin';

type Context={params:Promise<{slug:string}>};
async function menuPath({params}:Context){
  const {slug}=await params;
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw new BackendError('Menu not found.',404);
  return `${NAV_MENUS_ADMIN_PATH}${slug}/`;
}

export async function PATCH(request:Request,context:Context){
  try{
    const headers=await adminHeaders();
    const updated=await backend(await menuPath(context),{method:'PATCH',headers,body:JSON.stringify(navMenuInput(await readInput(request,20000),false))});
    revalidateTag('navigation',{expire:0});
    return Response.json({data:updated},{headers:noStore});
  }catch(error){return apiError(error);}
}

export async function DELETE(_request:Request,context:Context){
  try{
    const headers=await adminHeaders();
    await backend(await menuPath(context),{method:'DELETE',headers});
    revalidateTag('navigation',{expire:0});
    return Response.json({data:{deleted:true}},{headers:noStore});
  }catch(error){return apiError(error);}
}
