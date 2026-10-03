'use client';
import Link from 'next/link';
import {useCallback,useEffect,useState} from 'react';
import {departureState,type ScheduledJourney} from '@/lib/departure-calendar';
import {dateLabel,difficulty,money} from '@/lib/format';
import {trekHref} from '@/lib/links';

export default function UpcomingDepartures({full=false}:{full?:boolean}){
  const [entries,setEntries]=useState<ScheduledJourney[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[unavailable,setUnavailable]=useState<string[]>([]),[filter,setFilter]=useState('all'),[demo,setDemo]=useState(false);
  const fetchDates=useCallback(async(signal?:AbortSignal)=>{try{const response=await fetch('/api/departures',{signal});const data=await response.json();if(!response.ok)throw new Error(data.error);if(!signal?.aborted){setEntries(data.departures);setUnavailable(data.unavailable);setDemo(Boolean(data.demo));}}catch(e){if(!signal?.aborted)setError(e instanceof Error?e.message:'We couldn’t load the departure calendar.');}finally{if(!signal?.aborted)setLoading(false);}},[]);
  function load(){setLoading(true);setError('');void fetchDates();}
  useEffect(()=>{const controller=new AbortController();void fetchDates(controller.signal);return()=>controller.abort();},[fetchDates]);
  const selected=entries.filter(({departure})=>filter!=='open'||departureState(departure).request);
  const visible=full?selected:selected.slice(0,4);
  return <section id="upcoming-departures" className={`upcoming-departures section ${full?'departure-page':''}`} aria-labelledby="departures-heading"><div className="container">
    <div className="section-heading"><div><p className="eyebrow">A PLACE ON THE NEXT JOURNEY</p>{full?<h1 id="departures-heading">Upcoming departures</h1>:<h2 id="departures-heading">Upcoming departures</h2>}<p className="departures-intro">{demo?'Example dates show how the calendar will look. These are not real departures or seat counts.':'Find your trip, choose your dates, and see the next journeys heading out.'}</p></div>{!full&&<Link href="/departures" className="text-link">View all departures <span className="ui-arrow" aria-hidden="true" /></Link>}</div>
    {full&&!demo&&<div className="departure-filters" role="group" aria-label="Departure availability"><button type="button" aria-pressed={filter==='all'} onClick={()=>setFilter('all')}>All upcoming trips</button><button type="button" aria-pressed={filter==='open'} onClick={()=>setFilter('open')}>Open for requests</button></div>}
    {loading?<p className="departure-feedback" role="status">Checking upcoming dates and seats…</p>:error?<div className="departure-feedback" role="alert"><h3>We couldn’t load the departure dates.</h3><p>{error}</p><div className="button-row"><button className="button green" onClick={()=>void load()}>Try again</button><Link className="text-link" href="/contact">Ask about your dates ↗︎</Link></div></div>:<>
      {unavailable.length>0&&<p className="departure-feedback" role="status">Dates for {unavailable.join(', ')} couldn’t be loaded. <button type="button" className="text-link" onClick={()=>void load()}>Check again</button></p>}
      {visible.length?<div className="departure-grid">{visible.map(({trip,departure:d})=>{const state=departureState(d);return <article className="scheduled-trip" key={d.id}>
        <div className="scheduled-top"><span>{trip.destination_name}</span><span className={`scheduled-status ${state.tone}`}>{demo?'Example only':state.label}</span></div>
        <h3><Link href={trekHref(trip.id)}>{trip.title}</Link></h3>
        <p className="scheduled-meta">{trip.duration_days} days · {difficulty(trip.difficulty_grade)}</p>
        <div className="scheduled-dates"><span>{demo?'Example date · unconfirmed':'Departure'}</span><strong><time dateTime={d.start_date}>{dateLabel(d.start_date)}</time></strong><small>to <time dateTime={d.end_date}>{dateLabel(d.end_date)}</time></small></div>
        <div className="scheduled-bottom"><div>{demo?<><strong>Preview only</strong><small>No confirmed price</small></>:<><strong>{money(d.price_usd)}</strong><small>USD / person</small></>}</div><span>{demo?'No seats offered':state.request?`${d.available_seats} of ${d.max_seats} seats open`:state.label}</span></div>
        <Link className="scheduled-action" href={demo?trekHref(trip.id):state.request?trekHref(trip.id,{departure:d.id}):trekHref(trip.id)}>{demo?'Explore sample trip':state.request?'Request a seat':'View trip & dates'} <span className="ui-arrow" aria-hidden="true" /></Link>
      </article>;})}</div>:<div className="departure-feedback"><p className="eyebrow">YOUR OWN DATES. YOUR OWN PACE.</p><h3>{filter==='open'?'No open seats are listed right now.':unavailable.length?'More departure dates are being checked.':'New departure dates are on their way.'}</h3><p>Tell us which trip you have in mind and when you’d like to travel. We’ll help you find a group departure or plan a private journey.</p><div className="button-row"><Link href="/contact" className="button green">Ask about your dates ↗︎</Link><Link href="/treks" className="text-link">Explore the journeys →</Link></div></div>}
    </>}
    {!loading&&!error&&visible.length>0&&<p className="departure-note">{demo?'These dates illustrate the design only. No price, seat or trip departure is confirmed.':'Seats open means places currently listed for a scheduled group trip; the team confirms availability before booking.'} <Link href="/tailor-made">Choose your own dates →</Link></p>}
  </div></section>;
}
