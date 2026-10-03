'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import type {Departure,Journey} from '@/lib/journeys';
import {dateLabel,errorText,money} from '@/lib/format';

/**
 * "Choose date" on a trek page: a short booking request for one departure.
 *
 * It sends an inquiry tied to the trek and departure — contact details and a
 * trekker count only. No seats are taken and nothing is paid here; the team
 * confirms availability and converts the lead to a booking in the CRM.
 */
export default function BookingInquiryDialog({journey,departure,onClose}:{journey:Pick<Journey,'id'|'title'|'max_group_size'>;departure:Departure;onClose:()=>void}) {
  const dialog=useRef<HTMLDialogElement>(null);
  const maxTrekkers=Math.max(1,Math.min(departure.available_seats,journey.max_group_size||departure.available_seats));
  const [trekkers,setTrekkers]=useState(1);
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[reference,setReference]=useState('');
  const dates=`${dateLabel(departure.start_date)} → ${dateLabel(departure.end_date)}`;

  useEffect(()=>{const focus=document.activeElement as HTMLElement;const previous=document.body.style.overflow;dialog.current?.showModal();document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;focus?.focus();};},[]);

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(busy)return;
    setBusy(true);setError('');
    const input=Object.fromEntries(new FormData(event.currentTarget)) as Record<string,string>;
    const note=input.note?.trim();
    const message=`Booking request: ${journey.title}, ${dates}, ${trekkers} trekker${trekkers===1?'':'s'}.${note?`\n\n${note}`:''}`;
    try{
      const r=await fetch('/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({full_name:input.full_name,email:input.email,phone:input.phone,group_size:trekkers,preferred_dates:dates,message,trip:journey.id,departure:departure.id})});
      const body=await r.json();
      if(!r.ok||body.success!==true||!body.reference)throw new Error(errorText(body));
      setReference(body.reference);
    }catch(e){setError(e instanceof Error?e.message:'Delivery could not be confirmed. Please contact the team before resubmitting.');}
    finally{setBusy(false);}
  }

  const step=(delta:number)=>setTrekkers(value=>Math.max(1,Math.min(maxTrekkers,value+delta)));

  return <dialog ref={dialog} className="booking-inquiry" aria-labelledby="booking-inquiry-heading" onCancel={onClose} onClick={event=>{if(event.target===event.currentTarget)onClose();}}>
    <div className="dialog-inner">
      <button className="close-dialog" aria-label="Close booking request" onClick={onClose}>×</button>
      <p className="eyebrow">Request this departure</p>
      <h2 id="booking-inquiry-heading">{journey.title}</h2>
      <div className="booking-inquiry-summary">
        <span><strong>{dates}</strong></span>
        <span>{money(departure.price_usd)} <small>per person</small></span>
        <span>{departure.available_seats} {departure.available_seats===1?'seat':'seats'} left</span>
      </div>
      {reference?<div className="form-success booking-inquiry-success" role="status">
        <h3>Request sent. Thank you!</h3>
        <p>Your reference is <strong>{reference}</strong>.</p>
        <p>Our team will check seats for {trekkers} trekker{trekkers===1?'':'s'} on {dateLabel(departure.start_date)} and contact you by email or phone to confirm. Nothing is booked or charged yet.</p>
        <button type="button" className="button green" onClick={onClose}>Done</button>
      </div>:<form className="inquiry-form booking-inquiry-form" onSubmit={submit}>
        <fieldset disabled={busy}>
          <label>Full name<input name="full_name" autoComplete="name" required maxLength={150}/></label>
          <div className="form-columns">
            <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254}/></label>
            <label>Phone / WhatsApp<input name="phone" type="tel" autoComplete="tel" inputMode="tel" required maxLength={50} placeholder="+977 98…"/></label>
          </div>
          <div className="booking-inquiry-trekkers">
            <span id="trekkers-label">Number of trekkers</span>
            <div className="trekker-stepper" role="group" aria-labelledby="trekkers-label">
              <button type="button" onClick={()=>step(-1)} disabled={trekkers<=1} aria-label="One fewer trekker">−</button>
              <output aria-live="polite">{trekkers}</output>
              <button type="button" onClick={()=>step(1)} disabled={trekkers>=maxTrekkers} aria-label="One more trekker">+</button>
            </div>
          </div>
          <label><span>Anything we should know? <small>(optional)</small></span><textarea name="note" rows={2} maxLength={1000} placeholder="Questions, pickup, special requests…"/></label>
        </fieldset>
        <p className="booking-inquiry-estimate">Estimated total <strong>{money(Number(departure.price_usd)*trekkers)}</strong> <small>({trekkers} × {money(departure.price_usd)})</small></p>
        {error&&<p className="form-error" role="alert">{error}</p>}
        <button className="button gold" disabled={busy}>{busy?'Sending…':'Send booking request ↗︎'}</button>
        <small className="form-footnote">No payment now. We&rsquo;ll confirm availability and the next steps with you.</small>
      </form>}
    </div>
  </dialog>;
}
