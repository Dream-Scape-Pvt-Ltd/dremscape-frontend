import type {Metadata} from 'next';
import {destinationHref,guideHref,isUuid} from '@/lib/links';
import {notFound} from 'next/navigation';
import GuideProfilePage,{guideMetadata} from './guide-profile-page';
import Link from 'next/link';
import JourneyShell from '@/components/journey-shell';
import Breadcrumbs from '@/components/breadcrumbs';
import TrekGuidePortrait from '@/components/trek-guide-portrait';
import {listTrekGuides,type TrekGuideSummary} from '@/lib/trek-guides';

const guidesMetadata:Metadata={title:'Our guides | Dreamscape Treks',description:'Meet the trekking guides who lead Dreamscape journeys in Nepal and the Himalaya.'};
type Props={searchParams:Promise<{id?:string|string[]}>};

export async function generateMetadata({searchParams}:Props):Promise<Metadata>{
  const {id}=await searchParams;
  return isUuid(id)?guideMetadata(id):guidesMetadata;
}

const experience=(years:number|null)=>years===null?'':`${years} ${years===1?'year':'years'} guiding`;

/** /guides lists every guide; /guides?id=<uuid> opens one profile. Any other id is not a page. */
export default async function Page({searchParams}:Props){
  const {id}=await searchParams;
  if(id!==undefined){
    if(!isUuid(id))notFound();
    return <GuideProfilePage id={id}/>;
  }
  return <GuidesList/>;
}

async function GuidesList(){
  let guides:TrekGuideSummary[]|null=null;
  try{guides=await listTrekGuides();}catch{}
  return <JourneyShell page="guides"><div className="guides-page">
    <header className="container guides-head">
      <Breadcrumbs items={[{label:'Home',href:'/'},{label:'Guides'}]}/>
      <h1>Our guides</h1>
      <p>The people who lead Dreamscape treks. Each one knows the trails, the weather and the villages along the way.</p>
    </header>
    <section className="container guides-list" aria-label="Trekking guides">
      {guides===null?<div className="status" role="alert"><p>Guide profiles can’t be loaded right now. Refresh the page in a moment.</p></div>
      :guides.length===0?<div className="quiet-panel guides-empty"><h2>Guide profiles are on their way.</h2><p>Ask the team who will lead your trek, and we’ll introduce you.</p><Link href="/contact" className="button gold">Contact the team</Link></div>
      :<ul className="guide-grid">{guides.map(g=><li key={g.slug}><article className="guide-card">
        <Link href={guideHref(g.id)} className="guide-card-link"><TrekGuidePortrait name={g.name} photo={g.photo}/><h2>{g.name}</h2></Link>
        {g.role&&<p className="guide-role">{g.role}</p>}
        {(g.yearsExperience!==null||g.languages.length>0)&&<dl className="guide-facts">
          {g.yearsExperience!==null&&<div><dt>Experience</dt><dd>{experience(g.yearsExperience)}</dd></div>}
          {g.languages.length>0&&<div><dt>Speaks</dt><dd>{g.languages.join(', ')}</dd></div>}
        </dl>}
        {g.regions.length>0&&<p className="guide-regions"><span>Leads treks in</span> {g.regions.map((r,i)=><span key={r.slug}>{i>0&&', '}<Link href={destinationHref(r.id,r.slug)}>{r.name}</Link></span>)}</p>}
      </article></li>)}</ul>}
    </section>
  </div></JourneyShell>;
}
