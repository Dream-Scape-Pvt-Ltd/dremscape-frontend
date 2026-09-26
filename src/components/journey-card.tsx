import Link from 'next/link';
import {trekHref} from '@/lib/links';
import {asset} from '@/lib/assets';
import type {Trip} from '@/lib/catalog';
import {difficulty,money} from '@/lib/format';
import {fallbackTrekImage} from '@/lib/trek-images';
export default function JourneyCard({trip}:{trip:Trip}) {
  return <Link className="trip-card" href={trekHref(trip.id)}><div className="trip-image"><img src={trip.image?asset(trip.image):fallbackTrekImage(trip.slug,trip.destination_slug)} alt={trip.title} loading="lazy"/><span className="badge">{trip.duration_days} days · {difficulty(trip.difficulty_grade)}</span></div><div className="trip-content"><p className="journey-location">{trip.destination_name}</p><h3>{trip.title}</h3><p className="trip-tags">{trip.tags||`${trip.category_name} · ${trip.altitude_max_meters ? trip.altitude_max_meters.toLocaleString()+'m highest point' : 'A journey at your pace'}`}</p><div className="trip-bottom"><span><small>From </small><strong>{money(trip.starting_price_usd)}</strong><small> / person</small></span><span className="round-arrow" aria-hidden="true">↗</span></div></div></Link>;
}
