'use client';
import Link from 'next/link';
import {useCallback,useEffect,useState} from 'react';
import {departureState,type ScheduledJourney} from '@/lib/departure-calendar';
import {dateLabel,difficulty,money} from '@/lib/format';
import {trekHref} from '@/lib/links';

export default function UpcomingDepartures({full=false}:{full?:boolean}){
  const [entries,setEntries]=useState<ScheduledJourney[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[unavailable,setUnavailable]=useState<string[]>([]),[filter,setFilter]=useState('all');
  const fetchDates=useCallback(async(signal?:AbortSignal)=>{try{const response=await fetch('/api/departures',{signal});const data=await response.json();if(!response.ok)throw new Error(data.error);if(!signal?.aborted){setEntries(data.departures);setUnavailable(data.unavailable);}}catch(e){if(!signal?.aborted)setError(e instanceof Error?e.message:'We couldn’t load the departure calendar.');}finally{if(!signal?.aborted)setLoading(false);}},[]);
  function load(){setLoading(true);setError('');void fetchDates();}
  useEffect(()=>{const controller=new AbortController();void fetchDates(controller.signal);return()=>controller.abort();},[fetchDates]);
  const selected=entries.filter(({departure})=>filter!=='open'||departureState(departure).request);
  const visible=full?selected:selected.slice(0,4);
  return <section id="upcoming-departures" className={`upcoming-departures section ${full?'departure-page':''}`} aria-labelledby="departures-heading"><div className="container">
    <div className="section-heading"><div><p className="eyebrow">A PLACE ON THE NEXT JOURNEY</p>{full?<h1 id="departures-heading">Upcoming departures</h1>:<h2 id="departures-heading">Upcoming departures</h2>}<p className="departures-intro">Find your trip, choose your dates, and see the next journeys heading out.</p></div>{!full&&<Link href="/departures" className="text-link">View all departures <span aria-hidden="true">↗</span></Link>}</div>
    {full&&<div className="departure-filters" role="group" aria-label="Departure availability"><button type="button" aria-pressed={filter==='all'} onClick={()=>setFilter('all')}>All upcoming trips</button><button type="button" aria-pressed={filter==='open'} onClick={()=>setFilter('open')}>With seats available</button></div>}
    {loading?<p className="departure-feedback" role="status">Checking upcoming dates and seats…</p>:error?<div className="departure-feedback" role="alert"><h3>We couldn’t load the departure dates.</h3><p>{error}</p><div className="button-row"><button className="button green" onClick={()=>void load()}>Try again</button><Link className="text-link" href="/contact">Ask about your dates ↗</Link></div></div>:<>
      {unavailable.length>0&&<p className="departure-feedback" role="status">Dates for {unavailable.join(', ')} couldn’t be loaded. <button type="button" className="text-link" onClick={()=>void load()}>Check again</button></p>}
      {visible.length?<div className="departure-grid">{visible.map(({trip,departure:d})=>{const state=departureState(d);return <article className="scheduled-trip" key={d.id}>
        <div className="scheduled-top"><span>{trip.destination_name}</span><span className={`scheduled-status ${state.tone}`}>{state.label}</span></div>
        <h3><Link href={trekHref(trip.id)}>{trip.title}</Link></h3>
        <p className="scheduled-meta">{trip.duration_days} days · {difficulty(trip.difficulty_grade)}</p>
        <div className="scheduled-dates"><span>Departure</span><strong><time dateTime={d.start_date}>{dateLabel(d.start_date)}</time></strong><small>to <time dateTime={d.end_date}>{dateLabel(d.end_date)}</time></small></div>
        <div className="scheduled-bottom"><div><strong>{money(d.price_usd)}</strong><small>USD / person</small></div><span>{state.request?`${d.available_seats} of ${d.max_seats} seats available`:state.label}</span></div>
        <Link className="scheduled-action" href={state.request?trekHref(trip.id,{departure:d.id}):trekHref(trip.id)}>{state.request?'Request a seat':'View trip & dates'} <span aria-hidden="true">↗</span></Link>
      </article>;})}</div>:<div className="departure-feedback"><p className="eyebrow">YOUR OWN DATES. YOUR OWN PACE.</p><h3>{filter==='open'?'No open seats are listed right now.':unavailable.length?'More departure dates are being checked.':'New departure dates are on their way.'}</h3><p>Tell us which trip you have in mind and when you’d like to travel. We’ll help you find a group departure or plan a private journey.</p><div className="button-row"><Link href="/contact" className="button green">Ask about your dates ↗</Link><Link href="/treks" className="text-link">Explore the journeys →</Link></div></div>}
    </>}
    {!loading&&!error&&visible.length>0&&<p className="departure-note">Prefer different dates? <Link href="/contact">Plan a private journey with us →</Link></p>}
  </div></section>;
}
