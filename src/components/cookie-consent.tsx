'use client';

import {useEffect,useState,useSyncExternalStore} from 'react';
import Script from 'next/script';
import Link from 'next/link';

type Choice='essential'|'analytics';
const storageKey='dreamscape-cookie-choice';
const analyticsId=process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const validAnalyticsId=analyticsId && /^G-[A-Z0-9]+$/.test(analyticsId) ? analyticsId : null;

export default function CookieConsent(){
  const [choice,setChoice]=useState<Choice|null>(()=>{
    if(typeof window==='undefined')return null;
    const saved=window.localStorage.getItem(storageKey);
    return saved==='essential'||saved==='analytics'?saved:null;
  });
  const ready=useSyncExternalStore(()=>()=>{},()=>true,()=>false);
  const [settingsOpen,setSettingsOpen]=useState(false);

  useEffect(()=>{
    const open=(event:MouseEvent)=>{
      if(event.target instanceof Element && event.target.closest('[data-open-cookie-settings]'))setSettingsOpen(true);
    };
    document.addEventListener('click',open);
    return ()=>document.removeEventListener('click',open);
  },[]);

  function save(next:Choice){
    window.localStorage.setItem(storageKey,next);
    setChoice(next);
    setSettingsOpen(false);
    if(next==='essential'&&validAnalyticsId){
      (window as unknown as Record<string,unknown>)[`ga-disable-${validAnalyticsId}`]=true;
      if(choice==='analytics')window.location.reload();
    }
  }

  return <>
    {ready&&(choice===null||settingsOpen)&&<aside className="cookie-consent" aria-label="Cookie preferences">
      <div><strong>Choose your cookies</strong><p className="cookie-consent-desktop">Essential storage keeps your preferences. With your permission, we can also measure visits to improve the site. Analytics stays off unless you allow it. <Link href="/policies/cookie-policy">Cookie policy</Link></p><p className="cookie-consent-mobile">Essential cookies save your choice. Analytics is off unless you allow it. <Link href="/policies/cookie-policy">Cookie policy</Link></p></div>
      <div className="cookie-consent-actions"><button type="button" onClick={()=>save('essential')}>Essential only</button><button type="button" className="cookie-consent-allow" onClick={()=>save('analytics')}>Allow analytics</button></div>
    </aside>}
    {ready&&choice==='analytics'&&validAnalyticsId&&<>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${validAnalyticsId}`} strategy="afterInteractive" />
      <Script id="dreamscape-analytics" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${validAnalyticsId}',{anonymize_ip:true});`}</Script>
    </>}
  </>;
}
