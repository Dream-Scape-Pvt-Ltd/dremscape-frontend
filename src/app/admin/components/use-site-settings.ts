'use client';

import {useEffect,useState} from 'react';
import {api} from './admin-utils';
import {mergeSettings,type SiteSettings} from '@/lib/site-settings-defaults';

type Stored=Partial<SiteSettings>&{crm_sla_hours?:number|null};

export type SiteSettingsState={
  settings:SiteSettings|null;
  slaHours:number|null;
  loadError:string;
  /** Saves the whole settings object (the backend replaces it), plus the CRM hours. */
  save:(next:SiteSettings,slaHours?:number|null)=>Promise<void>;
};

export function useSiteSettings():SiteSettingsState{
  const [settings,setSettings]=useState<SiteSettings|null>(null);
  const [slaHours,setSlaHours]=useState<number|null>(null);
  const [loadError,setLoadError]=useState('');

  function apply(data:Stored){
    const {crm_sla_hours,...content}=data;
    setSettings(mergeSettings(content));
    setSlaHours(crm_sla_hours??null);
  }
  useEffect(()=>{
    api<Stored>('/api/admin/site-settings').then(apply).catch(reason=>setLoadError(reason instanceof Error?reason.message:'Could not load settings.'));
  },[]);

  async function save(next:SiteSettings,hours:number|null=slaHours){
    apply(await api<Stored>('/api/admin/site-settings',{method:'PATCH',body:JSON.stringify({...next,crm_sla_hours:hours})}));
  }
  return {settings,slaHours,loadError,save};
}
