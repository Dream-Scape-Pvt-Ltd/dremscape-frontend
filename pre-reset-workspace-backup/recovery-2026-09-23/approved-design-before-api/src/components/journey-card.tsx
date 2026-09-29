import Link from 'next/link';
import {asset} from '@/lib/assets';
import type {Trip} from '@/lib/catalog';
import {difficulty,money} from '@/lib/format';
export default function JourneyCard({trip}:{trip:Trip}) {
  return <Link className="trip-card" href={`/treks/${trip.slug}`}><div className="trip-image">{trip.image?<img src={asset(trip.image)} alt={trip.title} loading="lazy"/>:<div className="trip-no-image"><span>{trip.destination_name}<small>Dreamscape journeys</small></span></div>}<span className="badge">{trip.duration_days} days · {difficulty(trip.difficulty_grade)}</span></div><div className="trip-content"><p className="journey-location">{trip.destination_name}</p><h3>{trip.title}</h3><p className="trip-tags">{trip.tags||`${trip.category_name} · ${trip.altitude_max_meters ? trip.altitude_max_meters.toLocaleString()+'m highest point' : 'A journey at your pace'}`}</p><div className="trip-bottom"><span><small>From </small><strong>{money(trip.starting_price_usd)}</strong><small> / person</small></span><span className="round-arrow" aria-hidden="true">↗</span></div></div></Link>;
}
