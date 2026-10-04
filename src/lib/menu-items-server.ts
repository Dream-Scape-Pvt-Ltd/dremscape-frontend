import {backend,backendConfigured,publicReadCache} from './backend';
import {fallbackMenus,type NavMenuData} from './nav-content';

export const NAV_MENUS_PATH='destinations/nav-menus/';

/** The header's visible menus with their items, cached and refreshed when admin edits them. */
export async function getNavigation():Promise<NavMenuData[]>{
  if(!backendConfigured())return fallbackMenus;
  try{
    const menus=await backend<NavMenuData[]>(NAV_MENUS_PATH,publicReadCache('navigation'));
    return Array.isArray(menus)?menus:fallbackMenus;
  }catch{return fallbackMenus;}
}
