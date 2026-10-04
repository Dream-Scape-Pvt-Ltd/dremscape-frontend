import Link from 'next/link';
import JourneyShell from '@/components/journey-shell';
import {PageHero,PlanInvitation} from '@/components/editorial';
import {activities} from '@/lib/editorial-content';
import {asset} from '@/lib/assets';
export const metadata={title:'Ways to explore Nepal | Dreamscape Treks'};
export default function Page(){return <JourneyShell page="activities"><PageHero eyebrow="THERE’S MORE THAN ONE WAY" title="Follow your curiosity." accent="Find your adventure." description="A mountain trail, a cultural detour, an ambition worth discussing. Let your interests shape the journey." image="222-370-imgHimalayanMountainPassTrekkerReflection"/><section className="container section activity-grid">{activities.map((a,i)=><Link href={`/activities/${a.slug}`} className="activity-card" key={a.slug}><div><img src={asset(a.image)} alt={a.name} loading="lazy" width="512" height="279"/><span>0{i+1} / NEPAL</span></div><section><p className="eyebrow">{a.name}</p><h2>{a.line}</h2><p>{a.description}</p><span className="text-link">Explore {a.name.toLowerCase()} ↗︎</span></section></Link>)}</section><PlanInvitation/></JourneyShell>;}
