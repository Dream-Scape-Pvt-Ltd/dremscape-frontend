import {Suspense} from 'react';
import TrekCatalog from '@/components/trek-catalog';
export const metadata={title:'Find your trek | Dreamscape — Beyond the Horizon',description:'Explore Dreamscape journeys in Nepal. Filter by region, duration and difficulty to find your trail.'};
export default function Page(){return <Suspense fallback={<p className="status">Loading journeys…</p>}><TrekCatalog/></Suspense>;}
