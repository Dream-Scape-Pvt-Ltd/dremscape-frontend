'use client';
import {createContext,useContext,useMemo,type ReactNode} from 'react';
import {fallbackMenus,type NavMenuData} from '@/lib/nav-content';
import {company as defaultCompany,companyFrom,type CompanyContact} from '@/lib/company';

/** Header menus and contact details every page shares, read once in the root layout. */
export type SiteChrome={menus:NavMenuData[];contact?:CompanyContact};

const ChromeContext=createContext<SiteChrome>({menus:fallbackMenus});

export function NavigationProvider({chrome,children}:{chrome:SiteChrome;children:ReactNode}){
  return <ChromeContext.Provider value={chrome}>{children}</ChromeContext.Provider>;
}
export const useNavMenus=()=>useContext(ChromeContext).menus;
export function useCompany(){
  const {contact}=useContext(ChromeContext);
  return useMemo(()=>contact?companyFrom(contact):defaultCompany,[contact]);
}
