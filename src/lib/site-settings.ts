import {connection} from 'next/server';
import {backend,backendConfigured} from './backend';
import {defaultSettings,mergeSettings,type SiteSettings} from './site-settings-defaults';
export {defaultSettings,mergeSettings} from './site-settings-defaults';
export type {SiteSettings,GalleryPhoto} from './site-settings-defaults';

async function readSettings():Promise<SiteSettings>{
  if(!backendConfigured())return defaultSettings;
  try{return mergeSettings(await backend<Partial<SiteSettings>>('content/site-settings/',{cache:'force-cache',next:{revalidate:60,tags:['website-settings']}}));}
  catch{return defaultSettings;}
}
/** For pages: always read at request time (falls back to defaults if the backend is down). */
export async function getSiteSettings():Promise<SiteSettings>{
  if(backendConfigured())await connection();
  return readSettings();
}
/** For the root layout: cached with the page, so static pages stay static and refresh when admin saves. */
export const getPublicSiteSettings=readSettings;
