'use client';
import {useState,type FormEvent} from 'react';
import {errorText} from '@/lib/format';
import {TRIP_STYLES,PRIVATE_PARTIES,COMFORT_LEVELS,SUPPORT_LEVELS} from '@/lib/trip-preferences';
import PhoneField from '@/components/phone-field';
function Chips({legend,name,options,value,onChange}:{legend:string;name:string;options:Record<string,string>;value?:string;onChange?:(value:string)=>void}) {
  return <fieldset className="choice-chips"><legend>{legend}</legend><div>{Object.entries({'':'No preference',...options}).map(([key,label])=><label key={key}><input type="radio" name={name} value={key} {...(onChange?{checked:(value??'')===key,onChange:()=>onChange(key)}:{defaultChecked:!key})}/><span>{label}</span></label>)}</div></fieldset>;
}
export default function InquiryForm({journey='',tripId,extended=false,preferences=false,initialMessage}:{journey?:string;tripId?:string;extended?:boolean;preferences?:boolean;initialMessage?:string}) {
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[reference,setReference]=useState('');
  const [style,setStyle]=useState(''),[party,setParty]=useState('');
  const isPrivate=style==='PRIVATE',hasKids=style==='FAMILY_KIDS'||(isPrivate&&party==='FAMILY');
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(busy)return;
    setBusy(true);
    setError('');
    const input=Object.fromEntries([...new FormData(event.currentTarget)].filter(([,value])=>value!==''))as Record<string,string>;
    if(input.phone){
      if(!input.phone_dial_code){
        setError('Please select your country code.');
        setBusy(false);
        return;
      }
      const digits=input.phone.replace(/\D/g,'');
      if(digits.length<6||digits.length>15||!/^[0-9\s\-()+]+$/.test(input.phone)){
        setError('Please enter a valid phone number (6 to 15 digits).');
        setBusy(false);
        return;
      }
    }
    if(input.group_size){
      const size=Number(input.group_size);
      const minSize=isPrivate&&party&&party!=='SOLO'?2:1;
      if(!Number.isInteger(size)||size<minSize||size>100){
        setError(`Please enter a valid number of travellers (${minSize}–100).`);
        setBusy(false);
        return;
      }
    }
    const{phone_dial_code,...rest}=input;
    const phone=[phone_dial_code,rest.phone].filter(Boolean).join(' ').trim();
    try{
      const r=await fetch('/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...rest,...(phone?{phone}:{}),trip:tripId})});
      const body=await r.json();
      if(!r.ok||body.success!==true||!body.reference)throw new Error(errorText(body));
      setReference(body.reference);
    }catch(e){
      setError(e instanceof Error?e.message:'Delivery could not be confirmed. Please contact the team before resubmitting.');
    }finally{
      setBusy(false);
    }
  }
  if(reference)return <div className="form-success" role="status"><h3>Your inquiry is with the team.</h3><p>Reference: <strong>{reference}</strong></p><p>Keep this reference for your conversation. This is an inquiry, not a confirmed booking.</p></div>;
  const travellers=isPrivate?party&&party!=='SOLO'&&<label>{party==='FAMILY'?'Family size':'Group size'} <small>(optional)</small><input name="group_size" type="number" min={2} max={100} inputMode="numeric"/></label>:<label>Travellers <small>(optional)</small><input name="group_size" type="number" min={1} max={100} inputMode="numeric"/></label>;
  return <form className="inquiry-form" onSubmit={submit}><p>Tell us a little about your plans{journey?` for ${journey}`:''}.</p><fieldset disabled={busy}><label className="inquiry-honeypot" aria-hidden="true">Website<input name="website" autoComplete="off" tabIndex={-1}/></label><label>Your name<input name="full_name" autoComplete="name" required maxLength={150}/></label><div className="form-columns"><label>Email address<input name="email" autoComplete="email" type="email" required maxLength={254}/></label><PhoneField name="phone" label="Phone / WhatsApp" optionalHint/></div>{extended&&<div className="form-columns"><label>Preferred start date <small>(optional)</small><input name="preferred_dates" type="date"/></label>{travellers}</div>}
    {preferences&&<details className="trip-preferences"><summary>Trip preferences <small>(optional)</small></summary><div>
      <Chips legend="Trip style" name="trip_style" options={TRIP_STYLES} value={style} onChange={value=>{setStyle(value);setParty('');}}/>
      {isPrivate&&<Chips legend="Who's travelling?" name="private_party" options={PRIVATE_PARTIES} value={party} onChange={setParty}/>}
      {!extended&&isPrivate&&travellers}
      {hasKids&&<label>Children&apos;s ages <small>(optional)</small><input name="children_ages" placeholder="e.g. 6, 9" maxLength={100}/></label>}
      <Chips legend="Comfort level" name="comfort_level" options={COMFORT_LEVELS}/>
      <Chips legend="Support needed" name="support_level" options={SUPPORT_LEVELS}/>
    </div></details>}
    <label>Your journey<textarea name="message" rows={5} required maxLength={5000} defaultValue={initialMessage ?? (journey?`I would like to explore ${journey}. Please help me plan my journey.`:'')}/></label></fieldset>{error&&<p className="form-error" role="alert">{error}</p>}<button className="button gold" disabled={busy}>{busy?'Sending…':'Send Inquiry'}</button><small className="form-footnote">We’ll use these details to respond to your journey request.</small></form>;
}
