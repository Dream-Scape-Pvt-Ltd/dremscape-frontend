import { NextResponse } from 'next/server';
import {listJourneys} from '@/lib/journeys';
import {listDestinationContent} from '@/lib/destination-content';
import {apiError,noStore} from '@/lib/backend';
export async function GET() {
  try {
    const catalog=await listJourneys();
    const destinations=await listDestinationContent();
    const countryById=new Map(destinations.map(destination=>[destination.id,destination.country]));
    const countryBySlug=new Map(destinations.map(destination=>[destination.slug,destination.country]));
    return NextResponse.json({...catalog,trips:catalog.trips.map(trip=>({...trip,destination_country:countryById.get(trip.destination_id||'')||countryBySlug.get(trip.destination_slug)||trip.destination_country}))},{headers:noStore});
  } catch(error){return apiError(error);}
}
