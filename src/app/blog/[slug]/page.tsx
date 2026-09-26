import Link from 'next/link';
import {notFound,permanentRedirect} from 'next/navigation';
import {getGuide} from '@/lib/guides';
import {BackendError} from '@/lib/backend';
import {storyHref} from '@/lib/links';
import JourneyShell from '@/components/journey-shell';

/** Old /blog/<slug> links: find the article and move permanently to /blog?id=<uuid>. */
export default async function Page({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  let id:string;
  try{id=(await getGuide(slug)).id;}
  catch(error){
    if(error instanceof BackendError&&error.status===404)notFound();
    return <JourneyShell page="journal"><section className="utility-page container status" role="alert"><h1>This story will be back soon.</h1><Link href="/blog" className="button green">Back to the journal</Link></section></JourneyShell>;
  }
  // Called outside the try: permanentRedirect works by throwing.
  permanentRedirect(storyHref(id));
}
