import type {Trip} from './catalog.ts';
export function matchesTripMetrics(trip:Trip,budget:string,altitude:string){
 const price=Number(trip.starting_price_usd),height=trip.altitude_max_meters;
 const priced=Number.isFinite(price)&&price>0;
 return (!budget||(priced&&(budget==='under-1500'?price<1500:budget==='1500-2500'?price>=1500&&price<=2500:budget==='over-2500'?price>2500:true)))&&(!altitude||(height>0&&(altitude==='under-4000'?height<4000:altitude==='4000-5500'?height>=4000&&height<=5500:altitude==='over-5500'?height>5500:true)));
}
