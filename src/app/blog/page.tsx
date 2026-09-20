import JourneyShell from '@/components/journey-shell';
import {PlanInvitation} from '@/components/editorial';
import JournalIndex from './components/journal-index';
import JournalHero from './components/journal-hero';
import TrekMemories,{MemoryReveal} from './components/trek-memories';
import {listGuides} from '@/lib/guides';
export const dynamic='force-dynamic';
export const metadata={title:'Trek memories & stories | Dreamscape Treks',description:'Photographs and stories from past treks. Discover the people, mountain light and small moments in the Dreamscape journal.'};
export default async function Page(){let guides:Awaited<ReturnType<typeof listGuides>>|null=null;try{guides=await listGuides();}catch{}return <JourneyShell page="journal"><div className="memory-page"><JournalHero/><section className="container memory-stories" id="journal-stories"><MemoryReveal><div className="memory-section-heading"><div><p className="eyebrow">BEHIND EVERY PHOTOGRAPH</p><h2>There’s a story.</h2></div><p>Three ways of remembering a journey.<br/>The people. The in-between. The light.</p></div></MemoryReveal>{guides?<JournalIndex guides={guides}/>:<div className="status" role="alert"><h2>The journal will be back soon.</h2><p>We couldn’t load the stories. Please try again shortly.</p><a href="/blog" className="button green">Try again</a></div>}</section><TrekMemories/><PlanInvitation/></div></JourneyShell>;}
