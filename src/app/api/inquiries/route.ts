import { NextResponse } from 'next/server';
import {backend,apiError,BackendError,readInput,requiredText,emailInput,noStore} from '@/lib/backend';
import {TRIP_STYLES,PRIVATE_PARTIES,COMFORT_LEVELS,SUPPORT_LEVELS} from '@/lib/trip-preferences';
export async function POST(request: Request) {
  try {
    const input=await readInput(request);
    if(input.website) throw new BackendError('Unable to send this inquiry.',400);
    // A booking request for a specific departure needs a phone number but no free-text message.
    const departureRequest=Boolean(input.departure);
    // B2B partnership enquiries from /partners are the only type a visitor may choose; everything else is derived.
    const partnerRequest=input.inquiry_type==='PARTNER_DMC';
    const payload:Record<string,unknown>={full_name:requiredText(input,'full_name',150),email:emailInput(input),inquiry_type:partnerRequest?'PARTNER_DMC':input.trip?'JOURNEY':'GENERAL',lead_source:'website'};
    if(departureRequest&&(typeof input.phone!=='string'||!input.phone.trim())) throw new BackendError('Please enter a phone number so the team can confirm your seats.',400);
    if(partnerRequest&&(typeof input.phone!=='string'||!input.phone.trim())) throw new BackendError('Please enter a phone or WhatsApp number so our partnerships team can reach you.',400);
    for(const key of ['trip','departure','phone','preferred_dates']) if(input[key]) payload[key]=requiredText(input,key,key==='preferred_dates'?255:50);
    for(const [key,options] of [['trip_style',TRIP_STYLES],['private_party',PRIVATE_PARTIES],['comfort_level',COMFORT_LEVELS],['support_level',SUPPORT_LEVELS]] as const) if(input[key]){if(typeof input[key]!=='string'||!Object.hasOwn(options,input[key])) throw new BackendError('Please choose one of the listed trip preferences.',400);payload[key]=input[key];}
    if(input.children_ages) payload.children_ages=requiredText(input,'children_ages',100);
    if(input.group_size){const size=Number(input.group_size);if(!Number.isInteger(size)||size<1||size>100) throw new BackendError('Please enter a group size between 1 and 100.',400);payload.group_size=size;}
    const hasMessage=typeof input.message==='string'&&input.message.trim();
    payload.message=hasMessage||!departureRequest?requiredText(input,'message',5000):`Booking request for this departure · ${payload.group_size??1} trekker(s).`;
    const data=await backend<{inquiry_number:string}>('inquiries/',{method:'POST',body:JSON.stringify(payload)});
    if(!data.inquiry_number) throw new BackendError('We could not confirm your inquiry reference. Please contact the team before submitting again.');
    return NextResponse.json({success:true,reference:data.inquiry_number},{status:201,headers:noStore});
  } catch(error){return apiError(error);}
}
