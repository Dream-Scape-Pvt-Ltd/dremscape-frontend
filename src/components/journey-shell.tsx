'use client';
import {useState,type ReactNode} from 'react';
import SiteHeader from './site-header';
import InquiryDialog from './inquiry-dialog';
import SiteFooter from './site-footer';
export default function JourneyShell({children,page='treks'}:{children:ReactNode;page?:string}) {
  const [plan,setPlan]=useState(false);
  return <><a className="skip-link" href="#journey-main">Skip to content</a><SiteHeader page={page} onPlan={()=>setPlan(true)}/><main id="journey-main" className="journey-page">{children}</main><SiteFooter compact={page!=='about'}/>{plan&&<InquiryDialog journey="Nepal" onClose={()=>setPlan(false)}/>}</>;
}
