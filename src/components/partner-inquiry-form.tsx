'use client';
import UiArrow from '@/components/ui-arrow';
import {useState,type FormEvent} from 'react';
import {errorText} from '@/lib/format';
import PhoneField from '@/components/phone-field';

const partnerTypes=['Travel agency / tour operator','Independent agent / referrer','Group, school or corporate','Destination management company (DMC)','Other'];
const volumes=['1–10','10–50','50–200','200+'];

/**
 * The /partners enquiry: a B2B lead (inquiry_type PARTNER_DMC) in the CRM.
 * Inquiries have no company fields, so the business details lead the message.
 */
export default function PartnerInquiryForm() {
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[reference,setReference]=useState('');

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(busy)return;
    setBusy(true);setError('');
    const input=Object.fromEntries(new FormData(event.currentTarget)) as Record<string,string>;
    if(!input.phone_dial_code){setError('Please select your country code.');setBusy(false);return;}
    const phone=`${input.phone_dial_code} ${input.phone}`.trim();
    const details=[
      `Company: ${input.company.trim()}`,
      input.country?.trim()&&`Country: ${input.country.trim()}`,
      input.website?.trim()&&`Website: ${input.website.trim()}`,
      `Partnership type: ${input.partner_type}`,
      input.volume&&`Travellers per year: ${input.volume}`,
    ].filter(Boolean).join('\n');
    const note=input.message?.trim();
    try{
      const r=await fetch('/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        full_name:input.full_name,email:input.email,phone,inquiry_type:'PARTNER_DMC',
        message:`B2B partnership enquiry\n\n${details}${note?`\n\n${note}`:''}`,
      })});
      const body=await r.json();
      if(!r.ok||body.success!==true||!body.reference)throw new Error(errorText(body));
      setReference(body.reference);
    }catch(e){setError(e instanceof Error?e.message:'Delivery could not be confirmed. Please contact the team before resubmitting.');}
    finally{setBusy(false);}
  }

  if(reference)return <div className="form-success partner-success" role="status">
    <h3>Thank you, we’ve received your enquiry.</h3>
    <p>Your reference is <strong>{reference}</strong>.</p>
    <p>Our partnerships team will contact you within 2 working days to talk through how we can work together.</p>
  </div>;

  return <form className="inquiry-form partner-form" onSubmit={submit}>
    <fieldset disabled={busy}>
      <div className="form-columns">
        <label>Company / agency name<input name="company" required maxLength={150} autoComplete="organization"/></label>
        <label>Your name<input name="full_name" required maxLength={150} autoComplete="name"/></label>
      </div>
      <div className="form-columns">
        <label>Email address<input name="email" type="email" required maxLength={254} autoComplete="email"/></label>
        <PhoneField name="phone" label="Phone / WhatsApp" required/>
      </div>
      <div className="form-columns">
        <label><span>Country <small>(optional)</small></span><input name="country" maxLength={100} autoComplete="country-name"/></label>
        <label><span>Website <small>(optional)</small></span><input name="website" type="url" maxLength={255} placeholder="https://" autoComplete="url"/></label>
      </div>
      <div className="form-columns">
        <label>Partnership type<select name="partner_type" required defaultValue={partnerTypes[0]}>{partnerTypes.map(t=><option key={t}>{t}</option>)}</select></label>
        <label><span>Travellers per year <small>(approx.)</small></span><select name="volume" defaultValue=""><option value="">Not sure yet</option>{volumes.map(v=><option key={v}>{v}</option>)}</select></label>
      </div>
      <label><span>Tell us about your business <small>(optional)</small></span><textarea name="message" rows={4} maxLength={3500} placeholder="Where your travellers come from, the kind of trips they want, anything you’d like to discuss…"/></label>
    </fieldset>
    {error&&<p className="form-error" role="alert">{error}</p>}
    <button className="button gold" disabled={busy}>{busy?'Sending…':<>Start the conversation <UiArrow/></>}</button>
    <small className="form-footnote">No commitment. We’ll get in touch to discuss terms that suit your business.</small>
  </form>;
}
