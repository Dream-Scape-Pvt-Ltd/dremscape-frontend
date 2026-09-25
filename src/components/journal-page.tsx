import Link from 'next/link';
import JourneyShell from '@/components/journey-shell';
import {PlanInvitation} from '@/components/editorial';
import JournalIndex from '@/app/blog/components/journal-index';
import JournalHero from '@/app/blog/components/journal-hero';
import TrekMemories,{MemoryReveal} from '@/app/blog/components/trek-memories';
import {listGuides} from '@/lib/guides';
import {getSiteSettings} from '@/lib/site-settings';

export default async function JournalPage(){
  let guides:Awaited<ReturnType<typeof listGuides>>|null=null;
  try{guides=await listGuides();}catch{}
  const settings=await getSiteSettings();const featured=guides?.find(g=>g.slug===settings.featured_story_slug)||guides?.[0];
  return <JourneyShell page="journal"><div className="memory-page"><JournalHero settings={settings} featured={featured}/><section className="container memory-stories" id="journal-stories"><MemoryReveal><div className="memory-section-heading"><div><p className="eyebrow">BEHIND EVERY PHOTOGRAPH</p><h2>There’s a story.</h2></div><p>From the first spark of an idea to memories you bring home. Find your next reason to explore.</p></div></MemoryReveal>{guides?<JournalIndex guides={guides}/>:<div className="status" role="alert"><h2>The journal will be back soon.</h2><p>We couldn’t load the stories. Please try again shortly.</p><Link href="/blog" className="button green">Try again</Link></div>}</section><TrekMemories/><PlanInvitation/></div></JourneyShell>;
}
