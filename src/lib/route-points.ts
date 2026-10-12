export type RoutePoint={day:number;lat:number;lng:number;stay:string;rest:boolean};
type Day={day_number:number;latitude?:number|string|null;longitude?:number|string|null;overnight_stay:string;title:string;is_acclimatization_day:boolean};
const coordinate=(value:unknown,limit:number)=>{
  if(value===null||value===undefined||value==='')return null;
  const n=Number(value);
  return Number.isFinite(n)&&Math.abs(n)<=limit?n:null;
};
/** Days with usable coordinates, in day order. The API sends decimals as strings. */
export function routePoints(days:Day[]):RoutePoint[]{
  const seen=new Set<number>();
  return [...days].sort((a,b)=>a.day_number-b.day_number).flatMap(d=>{
    const lat=coordinate(d.latitude,90),lng=coordinate(d.longitude,180);
    if(!Number.isInteger(d.day_number)||d.day_number<1||seen.has(d.day_number)||lat===null||lng===null)return [];
    seen.add(d.day_number);
    return [{day:d.day_number,lat,lng,stay:d.overnight_stay||d.title,rest:d.is_acclimatization_day}];
  });
}
