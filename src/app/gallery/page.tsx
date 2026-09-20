import JourneyShell from '@/components/journey-shell';
import {PageHero,PlanInvitation} from '@/components/editorial';
import Gallery from './components/gallery';
export const metadata={title:'A glimpse of Nepal | Dreamscape gallery'};
export default function Page(){return <JourneyShell page="gallery"><PageHero eyebrow="A DREAMSCAPE FIELD JOURNAL" title="Some things" accent="stay with you." description="Mountain light. A path through the valley. A moment shared. A few reasons to keep looking beyond the horizon."/><section className="container section"><Gallery/></section><PlanInvitation/></JourneyShell>;}
