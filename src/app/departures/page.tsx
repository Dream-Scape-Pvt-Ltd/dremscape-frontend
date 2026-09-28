import JourneyShell from '@/components/journey-shell';
import UpcomingDepartures from '@/components/upcoming-departures';
export const metadata={title:'Upcoming departures | Dreamscape Treks',description:'Explore upcoming Dreamscape trips, departure dates, prices and available seats.'};
export default function Page(){return <JourneyShell page="departures"><UpcomingDepartures full/></JourneyShell>;}
