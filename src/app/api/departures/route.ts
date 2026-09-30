import {NextResponse} from 'next/server';
import {allPages,listJourneys,type Departure} from '@/lib/journeys';
import {apiError,noStore} from '@/lib/backend';
import {scheduledJourneys,type ScheduledJourney} from '@/lib/departure-calendar';
import {previewTrips} from '@/lib/catalog';

function previewCalendar():ScheduledJourney[]{
  const now=new Date();
  const start=new Date(Date.UTC(now.getUTCFullYear(),2,15));
  if(start.getTime()<now.getTime()+45*86400000)start.setUTCMonth(9,15);
  if(start.getTime()<now.getTime()+45*86400000)start.setUTCFullYear(start.getUTCFullYear()+1,2,15);
  const day=(offset:number)=>{const value=new Date(start);value.setUTCDate(value.getUTCDate()+offset);return value.toISOString().slice(0,10);};
  return [
    {slug:'everest-base-camp-cho-la',offset:0},
    {slug:'annapurna-base-camp-preview',offset:24},
  ].flatMap(({slug,offset})=>{const trip=previewTrips.find(item=>item.slug===slug);if(!trip)return [];return [{trip,departure:{id:`preview-${slug}`,start_date:day(offset),end_date:day(offset+trip.duration_days-1),price_usd:'0',max_seats:0,available_seats:0,status:'PREVIEW',availability_state:'CANCELLED',waitlist_enabled:false,is_guaranteed:false}} as ScheduledJourney];});
}

export async function GET(){
  try{
    const {trips}=await listJourneys();
    const entries:ScheduledJourney[]=[];
    const unavailable:string[]=[];
    let cursor=0;
    // Only read public calendars; cap concurrency without truncating the catalogue.
    await Promise.all(Array.from({length:Math.min(4,trips.length)},async()=>{
      while(cursor<trips.length){
        const trip=trips[cursor++];
        try{const dates=await allPages<Departure>(`trips/${encodeURIComponent(trip.slug)}/departures/`);entries.push(...dates.map(departure=>({trip,departure})));}
        catch{unavailable.push(trip.title);}
      }
    }));
    const scheduled=scheduledJourneys(entries);
    const preview=process.env.NODE_ENV==='development'&&scheduled.length===0;
    return NextResponse.json({departures:preview?previewCalendar():scheduled,unavailable:preview?[]:unavailable,demo:preview},{headers:noStore});
  }catch(error){return apiError(error);}
}
