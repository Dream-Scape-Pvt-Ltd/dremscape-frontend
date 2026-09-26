import {Suspense} from 'react';
import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import TrekCatalog from '@/components/trek-catalog';
import {isUuid} from '@/lib/links';
import TrekDetailPage,{trekMetadata} from './trek-detail-page';

type Props={searchParams:Promise<{id?:string|string[]}>};
const catalogMetadata:Metadata={title:'Find your trek | Dreamscape — Beyond the Horizon',description:'Explore Dreamscape journeys in Nepal. Filter by region, duration and difficulty to find your trail.'};

export async function generateMetadata({searchParams}:Props):Promise<Metadata>{
  const {id}=await searchParams;
  return isUuid(id)?trekMetadata(id):catalogMetadata;
}

/** /treks lists every trek; /treks?id=<uuid> opens one. Any other id is not a page. */
export default async function Page({searchParams}:Props){
  const {id}=await searchParams;
  if(id!==undefined){
    if(!isUuid(id))notFound();
    return <TrekDetailPage id={id}/>;
  }
  return <Suspense fallback={<p className="status">Loading journeys…</p>}><TrekCatalog/></Suspense>;
}
