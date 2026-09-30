import Link from 'next/link';
import JourneyCard from '@/components/journey-card';
import type {Trip} from '@/lib/catalog';
import {listRelatedJourneys} from '@/lib/journeys';
import {journeyKind} from '@/lib/navigation';

/**
 * Other treks as cards at the foot of a trek's page. Streamed in behind a
 * Suspense boundary so it never delays the page, and left out if it fails.
 */
export default async function RelatedTreks({current,preview=false}:{current:Trip;preview?:boolean}) {
  const related=await listRelatedJourneys(current).catch(()=>[] as Trip[]);
  if(!related.length) return null;
  const tour=journeyKind(current)==='tours';
  return (
    <section className="container related-treks">
      <div className="section-heading">
        <div>
          <h2>More {tour?'tours':'treks'} like this</h2>
        </div>
        <Link href={tour?'/treks?kind=tours':'/treks?kind=treks'} className="text-link">See all {tour?'tours':'treks'}</Link>
      </div>
      <div className="trip-grid catalogue-grid">
        {related.map(trip=><JourneyCard key={trip.slug} trip={trip} preview={preview}/>)}
      </div>
    </section>
  );
}
