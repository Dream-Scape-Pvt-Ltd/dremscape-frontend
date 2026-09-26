import {connection} from 'next/server';
import JourneyShell from '@/components/journey-shell';
import SearchExperience from '@/components/search-experience';
import {runSiteSearch} from '@/lib/site-search';

export const metadata={title:'Search | Dreamscape Treks'};

export default async function Page({searchParams}:{searchParams:Promise<{q?:string}>}){
 await connection();
 const q=((await searchParams).q||'').trim().slice(0,200);
 const initial=q.length>=2?await runSiteSearch(q):null;
 // Keyed by the query so arriving from the header search with a new ?q= starts fresh.
 return <JourneyShell page="search"><SearchExperience key={q} initialQuery={q} initial={initial}/></JourneyShell>;
}
