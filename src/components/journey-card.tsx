import Link from 'next/link';
import {trekHref} from '@/lib/links';
import {asset} from '@/lib/assets';
import type {Trip} from '@/lib/catalog';
import {difficulty,money} from '@/lib/format';
import {fallbackTrekImage} from '@/lib/trek-images';
export default function JourneyCard({trip,preview=false}:{trip:Trip;preview?:boolean}) {
  const conceptExpedition=preview&&trip.slug.endsWith('expedition-preview');
  return <Link className="trip-card journey-card" href={trekHref(trip.id)}>
    <div className="trip-image"><img src={trip.image?asset(trip.image):fallbackTrekImage(trip.slug,trip.destination_slug)} alt={preview?`Illustrative image for ${trip.title}`:trip.title} loading="lazy" width="640" height="420" decoding="async"/>{preview&&<span className="badge">Route inspiration</span>}</div>
    <div className="trip-content">
      <p className="journey-location">{trip.destination_name}</p><h3>{trip.title}</h3>
      <dl className="journey-card-facts"><div><dt>Duration</dt><dd>{conceptExpedition?'To be confirmed':`${trip.duration_days} ${trip.duration_days===1?'day':'days'}`}</dd></div><div><dt>Difficulty</dt><dd>{conceptExpedition?'To be assessed':difficulty(trip.difficulty_grade)}</dd></div>{trip.altitude_max_meters>0&&<div><dt>Maximum altitude</dt><dd>{trip.altitude_max_meters.toLocaleString()} m</dd></div>}</dl>
      <p className="trip-tags">{trip.tags||`${trip.category_name} · ${trip.altitude_max_meters ? trip.altitude_max_meters.toLocaleString()+'m highest point' : 'A journey at your pace'}`}</p>
      <div className="trip-bottom"><span>{preview?<><strong>Explore route idea</strong><small>Preview only · ask for a quote</small></>:<><small>From</small><strong>{money(trip.starting_price_usd)}</strong><small>USD / person</small></>}</span><span className="round-arrow" aria-hidden="true">↗</span></div>
    </div>
  </Link>;
}
