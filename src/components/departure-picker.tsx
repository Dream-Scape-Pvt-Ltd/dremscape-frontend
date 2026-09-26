'use client';
import {useEffect,useRef} from 'react';
import type {Departure} from '@/lib/journeys';
import {dateLabel,money} from '@/lib/format';

const monthLabel=(date:string)=>new Intl.DateTimeFormat('en-GB',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));

/** "Book my trip": the trek's open departures, grouped by month. Choosing one continues to the booking request. */
export default function DeparturePicker({title,departures,onChoose,onPlan,onClose}:{title:string;departures:Departure[];onChoose:(id:string)=>void;onPlan:()=>void;onClose:()=>void}) {
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const focus=document.activeElement as HTMLElement;const previous=document.body.style.overflow;dialog.current?.showModal();document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;focus?.focus();};},[]);
  const byMonth=new Map<string,Departure[]>();
  for(const d of [...departures].sort((a,b)=>a.start_date.localeCompare(b.start_date)))byMonth.set(monthLabel(d.start_date),[...(byMonth.get(monthLabel(d.start_date))||[]),d]);
  const months=[...byMonth];
  return <dialog ref={dialog} className="departure-picker" aria-labelledby="departure-picker-heading" onCancel={onClose} onClick={event=>{if(event.target===event.currentTarget)onClose();}}>
    <div className="dialog-inner">
      <button className="close-dialog" aria-label="Close departure dates" onClick={onClose}>×</button>
      <p className="eyebrow">Book my trip</p>
      <h2 id="departure-picker-heading">Choose your departure</h2>
      <p className="departure-picker-intro">{title} · {departures.length?`${departures.length} open ${departures.length===1?'date':'dates'}. Pick one to request your seats. Nothing is charged yet.`:'No open dates right now.'}</p>
      {departures.length?<div className="departure-picker-list">{months.map(([month,list])=><section key={month} aria-label={month}><h3>{month}</h3><ul>{list.map(d=>{const few=d.available_seats<=3;return <li key={d.id}><button type="button" onClick={()=>onChoose(d.id)}>
        <span className="departure-dates"><strong>{dateLabel(d.start_date)}</strong><small>to {dateLabel(d.end_date)}</small></span>
        <span className="departure-status">{d.is_guaranteed&&<em className="departure-guaranteed">Guaranteed</em>}<small className={few?'departure-few':''}>{d.available_seats} {d.available_seats===1?'seat':'seats'} left</small></span>
        <span className="departure-price"><strong>{money(d.price_usd)}</strong><small>per person</small></span>
        <span className="departure-select" aria-hidden="true">Select ↗</span>
      </button></li>;})}</ul></section>)}</div>
      :<div className="quiet-panel departure-picker-empty"><p>There are no bookable dates for this trek yet. Tell us when you hope to travel and we’ll arrange a departure or a private trip.</p></div>}
      <div className="departure-picker-foot"><span>{departures.length?'None of these dates work?':'Travel on your own dates'}</span><button type="button" className="button outline-dark" onClick={onPlan}>Plan my trip instead ↗</button></div>
    </div>
  </dialog>;
}
