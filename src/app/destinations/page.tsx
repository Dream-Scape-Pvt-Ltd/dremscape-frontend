import type {Metadata} from 'next';
import Destinations from './components/destinations';
import {listDestinationContent} from '@/lib/destination-content';
export const metadata:Metadata={title:'Destinations in Nepal — Dreamscape Treks',description:'Find your Himalayan region. Explore Everest and Khumbu, Annapurna and Mustang, Manaslu and Tsum Valley, and Dolpo with Dreamscape Treks.'};
export default async function DestinationsPage(){const regions=await listDestinationContent().catch(()=>[]);return <Destinations regions={regions}/>;}
