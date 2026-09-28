export type PublishedReview={id:string;reviewer_name:string;reviewer_country?:string;rating_overall:number;title:string;content:string;is_verified?:boolean;is_published?:boolean;created_at:string};
export type HomeReview=PublishedReview & {trip_slug:string;trip_title:string};

/** Read public, moderated reviews with bounded concurrency; never substitute sample endorsements. */
export async function collectHomepageReviews(
  trips:{slug:string;title:string}[],
  read:(slug:string)=>Promise<PublishedReview[]>,
  limit=3,
):Promise<{reviews:HomeReview[];unavailable:boolean}>{
  const rows:HomeReview[]=[];
  let index=0,failed=0;
  async function worker(){
    while(index<trips.length){
      const trip=trips[index++];
      try {
        const reviews=await read(trip.slug);
        for(const review of reviews){
          if(review.is_published===false||!review.id||!review.reviewer_name?.trim()||!review.content?.trim()||!Number.isFinite(review.rating_overall)||review.rating_overall<1||review.rating_overall>5)continue;
          rows.push({...review,trip_slug:trip.slug,trip_title:trip.title});
        }
      } catch {failed++;}
    }
  }
  await Promise.all(Array.from({length:Math.min(4,trips.length)},worker));
  const seen=new Set<string>();
  const time=(value:string)=>{const t=Date.parse(value);return Number.isFinite(t)?t:0;};
  const reviews=rows.sort((a,b)=>time(b.created_at)-time(a.created_at)||a.id.localeCompare(b.id))
    .filter(review=>!seen.has(review.id)&&Boolean(seen.add(review.id))).slice(0,limit);
  return {reviews,unavailable:trips.length>0&&failed===trips.length};
}
