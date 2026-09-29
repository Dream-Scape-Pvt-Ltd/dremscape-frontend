import {connection} from 'next/server';
import {backend,backendConfigured} from './backend';
import location from '@/content/company-location.json';
export type SiteSettings={home_image_url:string;home_image_alt:string;city:string;area:string;address:string;map_query:string;map_zoom:number;directions_note:string;journal_title:string;journal_description:string;featured_story_slug:string};
export const defaultSettings:SiteSettings={home_image_url:"",home_image_alt:"Trekkers beneath Himalayan snow peaks",...location,map_query:location.mapQuery,directions_note:location.directionsNote,map_zoom:16,journal_title:'Stories worth taking the long way for.',journal_description:'Walk a little further into Nepal. Meet the people, discover the places, and find inspiration for a journey of your own.',featured_story_slug:''};
export async function getSiteSettings():Promise<SiteSettings>{
  if(!backendConfigured())return defaultSettings;
  await connection();
  try{return {...defaultSettings,...await backend<SiteSettings>('content/site-settings/')};}catch{return defaultSettings;}
}
