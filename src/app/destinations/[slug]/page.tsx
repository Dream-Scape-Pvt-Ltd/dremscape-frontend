import {notFound,permanentRedirect} from 'next/navigation';
import {listDestinationContent} from '@/lib/destination-content';
import {destinationHref} from '@/lib/links';

/** Old /destinations/<slug> links: move permanently to /destinations?id=<uuid>. (Nepal and Beyond Nepal keep their own pages.) */
export default async function Page({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const destination=(await listDestinationContent()).find(r=>r.slug===slug||r.id===slug);
  if(!destination)notFound();
  permanentRedirect(destinationHref(destination.id,destination.slug));
}
