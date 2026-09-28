import type {Trip} from './catalog';
import type {Departure} from './journeys';

export type ScheduledJourney={trip:Trip;departure:Departure};
export function calendarToday(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kathmandu',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
export function scheduledJourneys(items:ScheduledJourney[],today=calendarToday()){
  return items.filter(({departure:d})=>d.start_date>=today&&d.status!=='CANCELLED'&&d.availability_state!=='CANCELLED').sort((a,b)=>a.departure.start_date.localeCompare(b.departure.start_date)||a.trip.title.localeCompare(b.trip.title));
}
export function departureState(d:Departure){
  if(d.status==='CANCELLED'||d.availability_state==='CANCELLED')return {label:'Cancelled',tone:'closed',request:false};
  if(d.available_seats<=0||['SOLD_OUT','WAITLIST'].includes(d.status)||['SOLD_OUT','WAITLIST'].includes(d.availability_state))return {label:d.waitlist_enabled?'Waitlist open':'Sold out',tone:'closed',request:false};
  if(!['LIMITED','GUARANTEED'].includes(d.status))return {label:'Booking closed',tone:'closed',request:false};
  if(d.available_seats<=3)return {label:'Few seats left',tone:'limited',request:true};
  return {label:d.is_guaranteed||d.status==='GUARANTEED'?'Guaranteed departure':'Booking open',tone:'open',request:true};
}
