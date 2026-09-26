'use client';
import {useEffect,useId,useRef,useState} from 'react';
import type {ItineraryDay} from '@/lib/journeys';

export type ProfilePoint={day:number;elevation:number;stay:string;title:string;rest:boolean};
const SNOWLINE=5000;
const HEIGHT=300;
const PAD={top:54,right:28,bottom:44,left:28};

/** Days that carry an overnight altitude, in order. */
export function profilePoints(days:ItineraryDay[]):ProfilePoint[]{
  return days.filter(d=>typeof d.elevation_meters==='number'&&d.elevation_meters>0).sort((a,b)=>a.day_number-b.day_number)
    .map(d=>({day:d.day_number,elevation:d.elevation_meters as number,stay:d.overnight_stay||d.title,title:d.title,rest:d.is_acclimatization_day}));
}
export const metres=(value:number)=>`${value.toLocaleString('en-US')} m`;

/** A smooth line through the points that never overshoots them (monotone cubic). */
function ridgePath(xy:[number,number][]){
  if(xy.length<2)return '';
  const slopes=xy.slice(0,-1).map(([x,y],i)=>(xy[i+1][1]-y)/(xy[i+1][0]-x));
  const tangents=xy.map((_,i)=>i===0?slopes[0]:i===xy.length-1?slopes[i-1]:slopes[i-1]*slopes[i]<=0?0:(slopes[i-1]+slopes[i])/2);
  let d=`M${xy[0][0]},${xy[0][1]}`;
  for(let i=0;i<xy.length-1;i++){
    const [x0,y0]=xy[i],[x1,y1]=xy[i+1],h=(x1-x0)/3;
    d+=` C${x0+h},${y0+tangents[i]*h} ${x1-h},${y1-tangents[i+1]*h} ${x1},${y1}`;
  }
  return d;
}

/**
 * The trek drawn as the climb it is: one ridge through every night's altitude,
 * tinted where it rises above the 5,000 m snowline, with the start and the high
 * point named. Each night is a link to that day in the itinerary.
 */
export default function RouteProfile({points}:{points:ProfilePoint[]}){
  const frame=useRef<HTMLDivElement>(null);
  const clip=useId().replace(/:/g,'');
  const [width,setWidth]=useState(960);
  const [active,setActive]=useState<number|null>(null);
  useEffect(()=>{const node=frame.current;if(!node)return;const observer=new ResizeObserver(([entry])=>setWidth(Math.max(300,Math.round(entry.contentRect.width))));observer.observe(node);return()=>observer.disconnect();},[]);

  const top=Math.max(...points.map(p=>p.elevation)),bottom=Math.min(...points.map(p=>p.elevation));
  const yMax=Math.ceil((top+250)/500)*500,yMin=Math.max(0,Math.floor((bottom-600)/500)*500);
  const plotW=width-PAD.left-PAD.right,plotH=HEIGHT-PAD.top-PAD.bottom;
  const x=(i:number)=>PAD.left+(points.length===1?plotW/2:i*plotW/(points.length-1));
  const y=(e:number)=>PAD.top+plotH*(1-(e-yMin)/(yMax-yMin));
  const xy=points.map((p,i)=>[x(i),y(p.elevation)] as [number,number]);
  const line=ridgePath(xy);
  const area=`${line} L${x(points.length-1)},${HEIGHT} L${x(0)},${HEIGHT} Z`;
  const peak=points.reduce((best,p,i)=>p.elevation>points[best].elevation?i:best,0);
  const snowY=y(SNOWLINE),showSnow=top>=SNOWLINE&&SNOWLINE>yMin;
  const shown=active??peak;
  const labelX=(i:number)=>Math.min(Math.max(x(i),PAD.left+70),width-PAD.right-70);
  const compact=width<560;

  return <figure className="route-profile" ref={frame}>
    <svg width={width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} role="img" aria-label={`Altitude profile: starts at ${metres(points[0].elevation)} in ${points[0].stay}, highest night ${metres(top)} at ${points[peak].stay} on day ${points[peak].day}.`}>
      <defs><clipPath id={`above-${clip}`}><rect x="0" y="0" width={width} height={Math.max(0,snowY)}/></clipPath></defs>
      <path className="route-profile-ground" d={area}/>
      {showSnow&&<path className="route-profile-snow" d={area} clipPath={`url(#above-${clip})`}/>}
      {showSnow&&<g className="route-profile-snowline"><line x1={PAD.left} x2={width-PAD.right} y1={snowY} y2={snowY}/><text x={width-PAD.right} y={snowY-7} textAnchor="end">{compact?'5,000 m':'Snowline 5,000 m'}</text></g>}
      <path className="route-profile-line" d={line} pathLength={1}/>
      {points.map((p,i)=><a key={p.day} href={`#day-${p.day}`} aria-label={`Day ${p.day}: ${p.stay}, ${metres(p.elevation)}${p.rest?', rest day':''}`} onMouseEnter={()=>setActive(i)} onMouseLeave={()=>setActive(null)} onFocus={()=>setActive(i)} onBlur={()=>setActive(null)}>
        <rect className="route-profile-hit" x={x(i)-Math.max(8,plotW/points.length/2)} y={0} width={Math.max(16,plotW/points.length)} height={HEIGHT}/>
        <circle className={`route-profile-stop ${i===peak?'is-peak':''} ${p.rest?'is-rest':''} ${i===shown?'is-shown':''}`} cx={x(i)} cy={y(p.elevation)} r={i===peak?6:i===shown?5.5:3.5}/>
      </a>)}
      <g className="route-profile-callout" aria-hidden="true" transform={`translate(${labelX(shown)},${Math.max(18,y(points[shown].elevation)-34)})`}>
        <text className="route-profile-callout-alt" textAnchor="middle">{metres(points[shown].elevation)}</text>
        <text className="route-profile-callout-place" textAnchor="middle" y="17">Day {points[shown].day}, {points[shown].stay}</text>
      </g>
      <g className="route-profile-axis" aria-hidden="true">
        <text x={x(0)} y={HEIGHT-14}>Day {points[0].day}</text>
        <text x={x(points.length-1)} y={HEIGHT-14} textAnchor="end">Day {points[points.length-1].day}</text>
      </g>
    </svg>
    <figcaption>Altitude where you sleep each night. Select a night to read that day.</figcaption>
  </figure>;
}
