import JourneyShell from '@/components/journey-shell';
import {PageHero,PlanInvitation} from '@/components/editorial';
import JournalIndex from '@/components/journal-index';
import {listGuides} from '@/lib/guides';
export const dynamic='force-dynamic';
export const metadata={title:'The journal | Dreamscape Treks'};
export default async function Page(){let guides:Awaited<ReturnType<typeof listGuides>>|null=null;try{guides=await listGuides();}catch{}return <JourneyShell page="journal"><PageHero eyebrow="THE DREAMSCAPE JOURNAL" title="A different perspective." accent="A story worth keeping." description="Notes on the way we travel. Small discoveries, thoughtful journeys, and the moments that stay with us." image="222-370-imgTibetanPrayerFlagsFlyingOnMountainRidge"/><section className="container section">{guides?<JournalIndex guides={guides}/>:<div className="status" role="alert"><h2>The journal will be back soon.</h2><p>We couldn’t load the stories. Please try again shortly.</p><a href="/blog" className="button green">Try again</a></div>}</section><PlanInvitation/></JourneyShell>;}
