import Link from 'next/link';
import {notFound} from 'next/navigation';
import {cache} from 'react';
import JourneyShell from '@/components/journey-shell';
import Breadcrumbs from '@/components/breadcrumbs';
import JourneyCard from '@/components/journey-card';
import TrekGuidePortrait from '@/components/trek-guide-portrait';
import {BackendError} from '@/lib/backend';
import {getTrekGuide} from '@/lib/trek-guides';
import {destinationHref,guideHref} from '@/lib/links';
import type {Metadata} from 'next';

/** One request per render: metadata and the page share the fetched guide. */
const load=cache(getTrekGuide);

export async function guideMetadata(id:string):Promise<Metadata>{
  try{const g=await load(id);return {title:`${g.name} | Dreamscape guides`,description:g.bio.slice(0,155)||`${g.name}, trekking guide with Dreamscape Treks.`,alternates:{canonical:guideHref(g.id)}};}
  catch{return {title:'Guide | Dreamscape Treks'};}
}

/** A guide's profile, shown at /guides?id=<uuid>. */
export default async function GuideProfilePage({id}:{id:string}){
  let g;
  try{g=await load(id);}
  catch(error){
    if(error instanceof BackendError&&error.status===404)notFound();
    return <JourneyShell page="guides"><section className="utility-page container status" role="alert"><h1>This profile can’t be loaded right now.</h1><p>Refresh the page in a moment.</p><Link href="/guides" className="button green">Back to our guides</Link></section></JourneyShell>;
  }
  const firstName=g.name.split(/\s+/)[0];
  const facts:[string,React.ReactNode][]=[
    ...(g.yearsExperience!==null?[['Experience',`${g.yearsExperience} ${g.yearsExperience===1?'year':'years'} guiding`] as [string,React.ReactNode]]:[]),
    ...(g.languages.length?[['Speaks',g.languages.join(', ')] as [string,React.ReactNode]]:[]),
    ...(g.certifications.length?[['Certifications',<ul key="c">{g.certifications.map(c=><li key={c}>{c}</li>)}</ul>] as [string,React.ReactNode]]:[]),
    ...(g.regions.length?[['Leads treks in',g.regions.map((r,i)=><span key={r.slug}>{i>0&&', '}<Link href={destinationHref(r.id,r.slug)}>{r.name}</Link></span>)] as [string,React.ReactNode]]:[]),
  ];
  return <JourneyShell page="guides"><div className="guides-page">
    <article className="container guide-profile">
      <Breadcrumbs items={[{label:'Home',href:'/'},{label:'Guides',href:'/guides'},{label:g.name}]}/>
      <div className="guide-profile-grid">
        <TrekGuidePortrait name={g.name} photo={g.photo} size="profile"/>
        <div>
          <h1>{g.name}</h1>
          {g.role&&<p className="guide-role">{g.role}</p>}
          {facts.length>0&&<dl className="guide-facts guide-facts-wide">{facts.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
          {g.bio&&<div className="guide-bio">{g.bio.split(/\n{2,}/).map((paragraph,i)=><p key={i}>{paragraph}</p>)}</div>}
        </div>
      </div>
    </article>
    {g.treks.length>0&&<section className="container guide-treks" aria-labelledby="guide-treks-heading">
      <h2 id="guide-treks-heading">Treks {firstName} leads</h2>
      <div className="trip-grid catalogue-grid">{g.treks.map(t=><JourneyCard key={t.slug} trip={t}/>)}</div>
    </section>}
  </div></JourneyShell>;
}
