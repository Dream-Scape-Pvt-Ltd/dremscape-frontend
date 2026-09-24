import type {Trip} from './catalog';

export type HomeFilters={destination:string;difficulty:string;budget:string};
export function filterHomeTrips(trips:Trip[],filters:HomeFilters,countries:Record<string,string>){
  return trips.filter(trip=>{
    const country=countries[trip.destination_slug]?.toUpperCase();
    const destinationMatches=!filters.destination||(filters.destination==='nepal'?country==='NEPAL':filters.destination==='beyond-nepal'?!!country&&country!=='NEPAL':trip.destination_slug===filters.destination);
    const price=Number(trip.starting_price_usd);
    const budgetMatches=!filters.budget||(Number.isFinite(price)&&price>0&&(filters.budget==='under-1500'?price<1500:filters.budget==='1500-2500'?price>=1500&&price<=2500:price>2500));
    return destinationMatches&&(!filters.difficulty||trip.difficulty_grade.toLowerCase()===filters.difficulty)&&budgetMatches;
  });
}
