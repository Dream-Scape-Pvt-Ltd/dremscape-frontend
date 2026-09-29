import { NextResponse } from 'next/server';
import {listJourneys} from '@/lib/journeys';
import {apiError,noStore} from '@/lib/backend';
export async function GET() {
  try {return NextResponse.json(await listJourneys(),{headers:noStore});} catch(error){return apiError(error);}
}
