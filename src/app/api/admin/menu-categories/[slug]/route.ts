import {revalidateTag} from 'next/cache';
import {backend,apiError,readInput,noStore,BackendError} from '@/lib/backend';
import {adminHeaders,menuItemInput} from '@/lib/menu-items-admin';

type Context={params:Promise<{slug:string}>};
async function categoryPath({params}:Context){
  const {slug}=await params;
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw new BackendError('Menu item not found.',404);
  return `destinations/activity-categories/${slug}/`;
}

export async function PATCH(request:Request,context:Context){
  try{
    const headers=await adminHeaders();
    const data=menuItemInput(await readInput(request,5000),true);
    const updated=await backend(await categoryPath(context),{method:'PATCH',headers,body:JSON.stringify(data)});
    revalidateTag('navigation',{expire:0});
    return Response.json({data:updated},{headers:noStore});
  }catch(error){return apiError(error);}
}

export async function DELETE(_request:Request,context:Context){
  try{
    const headers=await adminHeaders();
    await backend(await categoryPath(context),{method:'DELETE',headers});
    revalidateTag('navigation',{expire:0});
    return Response.json({data:{deleted:true}},{headers:noStore});
  }catch(error){return apiError(error);}
}
