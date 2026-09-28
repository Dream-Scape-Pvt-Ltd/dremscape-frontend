import {NextResponse} from 'next/server';
import {allPages,listJourneys,type Departure} from '@/lib/journeys';
import {apiError,noStore} from '@/lib/backend';
import {scheduledJourneys,type ScheduledJourney} from '@/lib/departure-calendar';

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
    return NextResponse.json({departures:scheduledJourneys(entries),unavailable},{headers:noStore});
  }catch(error){return apiError(error);}
}
