import Link from 'next/link';
import {notFound,permanentRedirect} from 'next/navigation';
import {getTrekGuide} from '@/lib/trek-guides';
import {BackendError} from '@/lib/backend';
import {guideHref} from '@/lib/links';
import JourneyShell from '@/components/journey-shell';

/** Old /guides/<slug> links: find the guide and move permanently to /guides?id=<uuid>. */
export default async function Page({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  let id:string;
  try{id=(await getTrekGuide(slug)).id;}
  catch(error){
    if(error instanceof BackendError&&error.status===404)notFound();
    return <JourneyShell page="guides"><section className="utility-page container status" role="alert"><h1>This profile can’t be loaded right now.</h1><p>Refresh the page in a moment.</p><Link href="/guides" className="button green">Back to our guides</Link></section></JourneyShell>;
  }
  // Called outside the try: permanentRedirect works by throwing.
  permanentRedirect(guideHref(id));
}
