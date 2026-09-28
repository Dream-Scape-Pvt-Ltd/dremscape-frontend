import {connection} from 'next/server';
import {backend,backendConfigured} from './backend';
import {defaultSettings,defaultCompanyContent,type SiteSettings} from './site-settings-defaults';
import {defaultPartnerContent} from './partner-content';
export {defaultSettings} from './site-settings-defaults';
export type {SiteSettings,GalleryPhoto} from './site-settings-defaults';
export async function getSiteSettings():Promise<SiteSettings>{
  if(!backendConfigured())return defaultSettings;
  await connection();
  try{const saved=await backend<SiteSettings>('content/site-settings/',{cache:'force-cache',next:{revalidate:60,tags:['website-settings']}});return {...defaultSettings,...saved,company_content:{...defaultCompanyContent,...saved.company_content},partner_content:{...defaultPartnerContent,...saved.partner_content},gallery_images:Array.isArray(saved.gallery_images)?saved.gallery_images:defaultSettings.gallery_images};}catch{return defaultSettings;}
}
