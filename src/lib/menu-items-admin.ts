import {staffAccess} from './staff';
import {requiredText,BackendError} from './backend';

export const MENU_CATEGORIES_PATH='destinations/activity-categories/';
const SLUG=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function adminHeaders(){
  const {headers,user}=await staffAccess();
  if(user.role!=='ADMIN')throw new BackendError('An administrator account is required.',403);
  return headers;
}
/** Shared by POST and PATCH: only the fields editors may change, checked before they reach the backend. */
export function menuItemInput(input:Record<string,unknown>,partial:boolean){
  const data:Record<string,unknown>={};
  if(!partial||'name' in input)data.name=requiredText(input,'name',150);
  if('description' in input){
    if(typeof input.description!=='string'||input.description.length>300)throw new BackendError('Please keep the subtitle under 300 characters.',400);
    data.description=input.description.trim();
  }
  if(!partial||'menu' in input){
    if(typeof input.menu!=='string'||!SLUG.test(input.menu))throw new BackendError('Please choose a menu for this item.',400);
    data.menu=input.menu;
  }
  if('sort_order' in input){
    if(!Number.isInteger(input.sort_order)||(input.sort_order as number)<0)throw new BackendError('Please check the order.',400);
    data.sort_order=input.sort_order;
  }
  if('is_active' in input){
    if(typeof input.is_active!=='boolean')throw new BackendError('Please check the visibility.',400);
    data.is_active=input.is_active;
  }
  return data;
}
export const slugify=(text:string)=>text.toLowerCase().trim().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');

export const NAV_MENUS_ADMIN_PATH='destinations/nav-menus/';
const HREF=/^(\/\S*|https:\/\/\S+)$/;
const text=(input:Record<string,unknown>,key:string,max:number)=>{
  const value=input[key];
  if(typeof value!=='string'||value.length>max)throw new BackendError(`Please check the ${key.replaceAll('_',' ')}.`,400);
  return value.trim();
};
/** Only the menu fields editors may change, checked before they reach the backend (which validates again). */
export function navMenuInput(input:Record<string,unknown>,creating:boolean){
  const data:Record<string,unknown>={};
  if(creating||'name' in input)data.name=requiredText(input,'name',60);
  if(creating){
    if(!['CATEGORIES','LINKS'].includes(String(input.menu_type)))throw new BackendError('Please choose what the menu lists.',400);
    data.menu_type=input.menu_type;
  }
  for(const [key,max] of [['eyebrow',80],['title',120],['intro',300],['image',500],['all_label',80],['href',300]] as const)if(key in input)data[key]=text(input,key,max);
  if(typeof data.href==='string'&&data.href&&!HREF.test(data.href))throw new BackendError('The “explore all” link must start with / or https://.',400);
  if('sort_order' in input){
    if(!Number.isInteger(input.sort_order)||(input.sort_order as number)<0)throw new BackendError('Please check the order.',400);
    data.sort_order=input.sort_order;
  }
  if('is_active' in input){
    if(typeof input.is_active!=='boolean')throw new BackendError('Please check the visibility.',400);
    data.is_active=input.is_active;
  }
  if('links' in input){
    if(!Array.isArray(input.links)||input.links.length>30)throw new BackendError('Please check the links.',400);
    data.links=input.links;
  }
  return data;
}
