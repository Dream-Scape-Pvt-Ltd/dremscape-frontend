import TrailDrawing from '@/components/trail-drawing';
import JourneyShell from '@/components/journey-shell';
import {PlanInvitation} from '@/components/editorial';
import JournalIndex from '@/components/journal-index';
import JournalHero from '@/components/journal-hero';
import TrekMemories,{MemoryReveal} from '@/components/trek-memories';
import {listGuides} from '@/lib/guides';
import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {isUuid} from '@/lib/links';
import StoryPage,{storyMetadata} from './story-page';
export const dynamic='force-dynamic';
const journalMetadata:Metadata={title:'Trek memories & stories | Dreamscape Treks',description:'Photographs and stories from past treks. Discover the people, mountain light and small moments in the Dreamscape journal.'};
type Props={searchParams:Promise<{id?:string|string[]}>};

export async function generateMetadata({searchParams}:Props):Promise<Metadata>{
  const {id}=await searchParams;
  return isUuid(id)?storyMetadata(id):journalMetadata;
}

/** /blog lists the journal; /blog?id=<uuid> opens one article. Any other id is not a page. */
export default async function Page({searchParams}:Props){
  const {id}=await searchParams;
  if(id!==undefined){
    if(!isUuid(id))notFound();
    return <StoryPage id={id}/>;
  }
  return <Journal/>;
}

async function Journal(){let guides:Awaited<ReturnType<typeof listGuides>>|null=null;try{guides=await listGuides();}catch{}return <JourneyShell page="journal"><div className="memory-page"><JournalHero/><TrailDrawing/><section className="container memory-stories" id="journal-stories"><MemoryReveal><div className="memory-section-heading"><div><p className="eyebrow">BEHIND EVERY PHOTOGRAPH</p><h2>There’s a story.</h2></div><p>Three ways of remembering a journey.<br/>The people. The in-between. The light.</p></div></MemoryReveal>{guides?<JournalIndex guides={guides}/>:<div className="status" role="alert"><h2>The journal will be back soon.</h2><p>We couldn’t load the stories. Please try again shortly.</p><a href="/blog" className="button green">Try again</a></div>}</section><TrekMemories/><PlanInvitation/></div></JourneyShell>;}
