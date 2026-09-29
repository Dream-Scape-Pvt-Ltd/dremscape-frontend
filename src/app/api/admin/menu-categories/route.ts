import {revalidateTag} from 'next/cache';
import {backend,apiError,readInput,noStore} from '@/lib/backend';
import {adminHeaders,menuItemInput,slugify,MENU_CATEGORIES_PATH} from '@/lib/menu-items-admin';
import type {MenuItem} from '@/lib/menu-items';

const PATH=MENU_CATEGORIES_PATH;

async function allCategories(headers:HeadersInit){
  return (await backend<{results:MenuItem[]}>(`${PATH}?page_size=100`,{headers})).results;
}

export async function GET(){
  try{return Response.json({data:await allCategories(await adminHeaders())},{headers:noStore});}
  catch(error){return apiError(error);}
}

export async function POST(request:Request){
  try{
    const headers=await adminHeaders();
    const data=menuItemInput(await readInput(request,5000),false);
    const taken=new Set((await allCategories(headers)).map(category=>category.slug));
    const base=slugify(String(data.name))||'menu-item';
    let slug=base;
    for(let n=2;taken.has(slug);n++)slug=`${base}-${n}`;
    const created=await backend<MenuItem>(PATH,{method:'POST',headers,body:JSON.stringify({...data,slug})});
    revalidateTag('navigation',{expire:0});
    return Response.json({data:created},{status:201,headers:noStore});
  }catch(error){return apiError(error);}
}
