import {NextResponse} from 'next/server';
import {getSearchIndex} from '@/lib/site-search';

/** The catalogue search index, loaded once by browsers so search can answer as visitors type. */
export async function GET() {
  const index=await getSearchIndex();
  return NextResponse.json(index,{headers:{'Cache-Control':index.catalogUnavailable?'no-store':'private, max-age=300'}});
}
