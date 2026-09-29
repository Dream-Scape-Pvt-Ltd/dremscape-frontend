import {NextResponse} from 'next/server';
import {getJourney} from '@/lib/journeys';
import {apiError,noStore} from '@/lib/backend';
export async function GET(_:Request,{params}:{params:Promise<{slug:string}>}) {
  try {return NextResponse.json(await getJourney((await params).slug),{headers:noStore});} catch(error){return apiError(error);}
}
