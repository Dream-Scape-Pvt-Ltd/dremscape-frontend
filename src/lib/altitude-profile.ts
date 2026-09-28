export type ProfilePoint={day:number;elevation:number;stay:string;title:string;rest:boolean};
type Day={day_number:number;elevation_meters:number|null;overnight_stay:string;title:string;is_acclimatization_day:boolean};
export function profilePoints(days:Day[]):ProfilePoint[]{
  const seen=new Set<number>();
  return [...days].sort((a,b)=>a.day_number-b.day_number).filter(d=>{
    if(!Number.isInteger(d.day_number)||d.day_number<1||seen.has(d.day_number)||typeof d.elevation_meters!=='number'||!Number.isFinite(d.elevation_meters)||d.elevation_meters<0||d.elevation_meters>8849)return false;
    seen.add(d.day_number);return true;
  }).map(d=>({day:d.day_number,elevation:d.elevation_meters as number,stay:d.overnight_stay||d.title,title:d.title,rest:d.is_acclimatization_day}));
}

/** Keep unknown nights as gaps; never interpolate a height that staff have not entered. */
export function profileSegments(points:ProfilePoint[]):ProfilePoint[][] {
  return points.reduce<ProfilePoint[][]>((segments,point)=>{
    const previous=segments.at(-1)?.at(-1);
    if(!previous||point.day!==previous.day+1)segments.push([point]);
    else segments[segments.length-1].push(point);
    return segments;
  },[]);
}
