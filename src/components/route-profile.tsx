'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {profileSegments,type ProfilePoint} from '@/lib/altitude-profile';
import styles from './route-profile.module.css';
export {profilePoints} from '@/lib/altitude-profile';
export const metres=(value:number)=>`${value.toLocaleString('en-US')} m`;
export default function RouteProfile({points,itineraryLinks=true}:{points:ProfilePoint[];itineraryLinks?:boolean}){
  const [selected,setSelected]=useState<number|null>(null);
  const frame=useRef<HTMLElement>(null);
  const [width,setWidth]=useState(960);
  const gradient=useId().replace(/:/g,'');
  useEffect(()=>{const node=frame.current;if(!node)return;const observer=new ResizeObserver(([entry])=>setWidth(Math.max(280,Math.round(entry.contentRect.width))));observer.observe(node);return()=>observer.disconnect();},[]);
  if(!points.length)return null;
  const peak=points.reduce((best,p,i)=>p.elevation>points[best].elevation?i:best,0);
  const current=points.find(p=>p.day===selected)||points[peak];
  const highest=points[peak],restDays=points.filter(p=>p.rest).length;
  const top=Math.ceil((highest.elevation+350)/500)*500;
  const bottom=Math.max(0,Math.floor((Math.min(...points.map(p=>p.elevation))-350)/500)*500);
  const first=points[0].day,last=points[points.length-1].day;
  const left=48,right=22,floor=252,ceiling=30,plotWidth=width-left-right;
  const x=(day:number)=>left+(last===first?plotWidth/2:(day-first)/(last-first)*plotWidth);
  const y=(elevation:number)=>floor-(elevation-bottom)/(top-bottom)*(floor-ceiling);
  const ticks=Array.from({length:5},(_,i)=>bottom+(top-bottom)*i/4);
  const labelStep=Math.max(1,Math.ceil((last-first)*34/plotWidth));
  const paths=profileSegments(points).map(segment=>{
    const line=segment.reduce((path,p,i)=>{
      if(!i)return `M ${x(p.day)} ${y(p.elevation)}`;
      const previous=segment[i-1],step=(x(p.day)-x(previous.day))/3;
      return `${path} C ${x(previous.day)+step} ${y(previous.elevation)}, ${x(p.day)-step} ${y(p.elevation)}, ${x(p.day)} ${y(p.elevation)}`;
    },'');
    return {line,area:`${line} L ${x(segment[segment.length-1].day)} ${floor} L ${x(segment[0].day)} ${floor} Z`};
  });
  return <figure className={styles.profile} ref={frame}>
    <dl className={styles.metrics}>
      <div><dt>Starting night</dt><dd>{metres(points[0].elevation)}</dd><span>{points[0].stay}</span></div>
      <div><dt>Highest overnight stay</dt><dd>{metres(highest.elevation)}</dd><span>Day {highest.day} · {highest.stay}</span></div>
      <div><dt>Acclimatisation</dt><dd>{restDays} {restDays===1?'day':'days'}</dd><span>Marked in the itinerary</span></div>
    </dl>
    <div className={styles.chartPanel}>
      <div className={styles.readout} aria-live="polite"><div><span>DAY {String(current.day).padStart(2,'0')}</span><strong>{current.stay}</strong></div><div className={styles.readoutHeight}><strong>{metres(current.elevation)}</strong><span>{current.rest?'Acclimatisation day':'Overnight elevation'}</span></div></div>
      <svg className={styles.chart} viewBox={`0 0 ${width} 290`} role="group" aria-label="Overnight altitude by itinerary day. Select a stop to see its place and elevation.">
        <defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2e7051" stopOpacity=".25"/><stop offset="100%" stopColor="#2e7051" stopOpacity=".025"/></linearGradient></defs>
        {ticks.map(t=><g className={styles.grid} key={t}><line x1={left} x2={width-right} y1={y(t)} y2={y(t)}/><text x={left-10} y={y(t)+4} textAnchor="end">{Math.round(t).toLocaleString('en-US')}</text></g>)}
        {points.filter(p=>p.rest).map(p=><line key={p.day} className={styles.restGuide} x1={x(p.day)} x2={x(p.day)} y1={ceiling} y2={floor}/>)}
        {paths.map((path,i)=><g key={i}><path d={path.area} fill={`url(#${gradient})`} stroke="none"/><path className={styles.line} d={path.line}/></g>)}
        <line className={styles.selectedGuide} x1={x(current.day)} x2={x(current.day)} y1={ceiling} y2={floor}/>
        {points.map((p,i)=><g key={p.day}>
          {p.day===current.day&&<circle className={styles.halo} cx={x(p.day)} cy={y(p.elevation)} r="12"/>}
          <g role="button" tabIndex={0} aria-label={`Day ${p.day}, ${p.stay}, ${metres(p.elevation)}${p.rest?', acclimatisation day':''}`} aria-pressed={p.day===current.day} className={styles.stop} onClick={()=>setSelected(p.day)} onFocus={()=>setSelected(p.day)} onPointerEnter={()=>setSelected(p.day)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();setSelected(p.day);}if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();const next=points[Math.max(0,Math.min(points.length-1,points.findIndex(point=>point.day===current.day)+(event.key==='ArrowRight'?1:-1)))];setSelected(next.day);}}}>
            <circle cx={x(p.day)} cy={y(p.elevation)} r="16" fill="transparent" stroke="none"/>
            <circle className={p.rest?styles.restStop:styles.normalStop} cx={x(p.day)} cy={y(p.elevation)} r={p.day===current.day?6:4.5}/>
          </g>
          {(i===0||i===points.length-1||(p.day-first)%labelStep===0&&last-p.day>=labelStep/2)&&<text className={styles.axis} x={x(p.day)} y="278" textAnchor="middle">D{p.day}</text>}
        </g>)}
      </svg>
      <div className={styles.legend}><span><i/>Overnight stay</span><span><i className={styles.restKey}/>Acclimatisation day</span><small>Elevation in metres</small></div>
    </div>
    <div className={styles.days} role="group" aria-label="Choose an itinerary day">{points.map(p=><button key={p.day} type="button" aria-pressed={current.day===p.day} onClick={()=>setSelected(p.day)}><span>Day {p.day}{p.rest&&<i aria-label="Acclimatisation day"/>}</span><strong>{p.stay}</strong><small>{metres(p.elevation)}</small></button>)}</div>
    <figcaption className={styles.caption}><span>Shows where you sleep each night, rather than the highest point reached during the day.</span>{itineraryLinks&&<a href={`#day-${current.day}`}>View day {current.day} itinerary ↗︎</a>}</figcaption>
  </figure>;
}
