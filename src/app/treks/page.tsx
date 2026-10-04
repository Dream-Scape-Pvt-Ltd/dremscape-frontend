import {Suspense} from 'react';
import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import TrekCatalog from '@/components/trek-catalog';
import {isUuid} from '@/lib/links';
import {nepalZones} from '@/lib/nepal-zones';
import TrekDetailPage,{trekMetadata} from './trek-detail-page';

type Props={searchParams:Promise<{id?:string|string[];kind?:string;zone?:string;region?:string;tour?:string;climb?:string;country?:string}>};
const catalogMetadata:Metadata={title:'Find your trek | Dreamscape Treks',description:'Explore Dreamscape journeys in Nepal. Filter by region, duration and difficulty to find your trail.'};

export async function generateMetadata({searchParams}:Props):Promise<Metadata>{
  const {id,kind,zone,climb,country}=await searchParams;
  if(isUuid(id))return trekMetadata(id);
  if(kind==='expeditions'&&climb==='peak')return {title:'Peak Climbing | Dreamscape Treks',description:'Explore published peak-climbing journeys and plan a route with the Dreamscape team.'};
  if(kind==='expeditions'&&climb==='expedition')return {title:'Expedition Climbing | Dreamscape Treks',description:'Explore published mountain expeditions with Dreamscape Treks.'};
  if(country==='bhutan')return {title:'Bhutan Journeys | Dreamscape Treks',description:'Explore published journeys across Bhutan and its destinations.'};
  const region=nepalZones.find(item=>item.value===zone);
  if(region)return {title:`${region.label} ${kind==='tours'?'tours':'treks'} | Dreamscape Treks`,description:`Explore ${region.label} journey ideas by area, length and difficulty. Ask Dreamscape Treks for an itinerary tailored to your dates.`};
  if(kind==='tours')return {title:'Tours in Nepal | Dreamscape Treks',description:'Explore cultural, wildlife, day and comfortable tour ideas in Nepal. Plan the details with Dreamscape Treks.'};
  return catalogMetadata;
}

/** /treks lists every trek; /treks?id=<uuid> opens one. Any other id is not a page. */
export default async function Page({searchParams}:Props){
  const {id,...collection}=await searchParams;
  if(id!==undefined){
    if(!isUuid(id))notFound();
    return <TrekDetailPage id={id}/>;
  }
  return <Suspense fallback={<p className="status">Loading journeys…</p>}><TrekCatalog key={JSON.stringify(collection)}/></Suspense>;
}
