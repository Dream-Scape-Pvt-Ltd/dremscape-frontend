import JourneyShell from '@/components/journey-shell';
import {PageHero,PlanInvitation} from '@/components/editorial';
import Reviews from '@/components/reviews';
export const metadata={title:'Traveller stories & reviews | Dreamscape Treks'};
export default function Page(){return <JourneyShell page="reviews"><PageHero eyebrow="THE PEOPLE BEHIND THE JOURNEYS" title="The views are extraordinary." accent="The stories are personal." description="Read published traveller experiences, explore a particular journey, or share a memory of your own."/><section className="container section"><Reviews/></section><PlanInvitation/></JourneyShell>;}
