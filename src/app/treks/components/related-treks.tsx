import Link from 'next/link';
import JourneyCard from '@/components/journey-card';
import type {Trip} from '@/lib/catalog';
import {listRelatedJourneys} from '@/lib/journeys';

/**
 * Other treks as cards at the foot of a trek's page. Streamed in behind a
 * Suspense boundary so it never delays the page, and left out if it fails.
 */
export default async function RelatedTreks({current}:{current:Trip}) {
  const related=await listRelatedJourneys(current).catch(()=>[] as Trip[]);
  if(!related.length) return null;
  return (
    <section className="related-treks">
      <div className="section-heading">
        <div>
          <p className="eyebrow">MORE JOURNEYS</p>
          <h2>Treks.</h2>
        </div>
        <Link href="/treks" className="text-link">Show all ↗</Link>
      </div>
      <div className="trip-grid catalogue-grid">
        {related.map(trip=><JourneyCard key={trip.slug} trip={trip}/>)}
      </div>
    </section>
  );
}
