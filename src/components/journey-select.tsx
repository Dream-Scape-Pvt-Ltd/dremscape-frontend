'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';

export type JourneyOption = { value:string; label:string; detail?:string; image?:string };

export default function JourneySelect({label,value,options,onChange}:{label:string;value:string;options:JourneyOption[];onChange:(value:string)=>void}) {
  const id=useId();
  const trigger=useRef<HTMLButtonElement>(null);
  const popup=useRef<HTMLDivElement>(null);
  const query=useRef({text:'',time:0});
  const [open,setOpen]=useState(false);
  const [active,setActive]=useState(0);
  const [position,setPosition]=useState({left:0,top:0,width:300,maxHeight:340});
  const selected=options.find(option=>option.value===value)??options[0];

  function place(){
    const bounds=trigger.current!.getBoundingClientRect();
    const width=Math.min(Math.max(bounds.width,310),window.innerWidth-32);
    const spaceBelow=window.innerHeight-bounds.bottom-24;
    const height=Math.min(340,Math.max(spaceBelow,bounds.top-24));
    setPosition({left:Math.max(16,Math.min(bounds.left,window.innerWidth-width-16)),top:spaceBelow>=Math.min(300,height)?bounds.bottom+10:Math.max(16,bounds.top-Math.min(340,height)-10),width,maxHeight:height});
  }
  function show(){
    place();
    setActive(Math.max(0,options.findIndex(option=>option.value===value)));
    setOpen(true);
  }
  function choose(index:number){onChange(options[index].value);setOpen(false);trigger.current?.focus();}
  useEffect(()=>{
    if(!open)return;
    const outside=(event:PointerEvent)=>{if(!popup.current?.contains(event.target as Node)&&!trigger.current?.contains(event.target as Node))setOpen(false);};
    const reposition=()=>setOpen(false);
    const scroll=(event:Event)=>{
      if(popup.current?.contains(event.target as Node))return;
      const bounds=trigger.current?.getBoundingClientRect();
      if(bounds&&(bounds.bottom<0||bounds.top>window.innerHeight))setOpen(false);
      else place();
    };
    document.addEventListener('pointerdown',outside);window.addEventListener('resize',reposition);window.addEventListener('scroll',scroll,true);
    return()=>{document.removeEventListener('pointerdown',outside);window.removeEventListener('resize',reposition);window.removeEventListener('scroll',scroll,true);};
  },[open]);
  useEffect(()=>{if(open)document.getElementById(`${id}-option-${active}`)?.scrollIntoView({block:'nearest',behavior:'instant'});},[active,open,id]);
  function keyboard(event:KeyboardEvent<HTMLButtonElement>){
    if(event.key==='Tab'){setOpen(false);return;}
    if(event.key==='Escape'){event.preventDefault();setOpen(false);return;}
    if(['ArrowDown','ArrowUp','Home','End','Enter',' '].includes(event.key)){
      event.preventDefault();
      if(!open){show();return;}
      if(event.key==='Enter'||event.key===' '){choose(active);return;}
      setActive(index=>event.key==='Home'?0:event.key==='End'?options.length-1:(index+(event.key==='ArrowDown'?1:-1)+options.length)%options.length);
    }else if(event.key.length===1&&!event.ctrlKey&&!event.metaKey){
      event.preventDefault();
      const now=Date.now();query.current={text:(now-query.current.time<600?query.current.text:'')+event.key.toLowerCase(),time:now};
      const index=options.findIndex(option=>option.label.toLowerCase().startsWith(query.current.text));
      if(!open)show();if(index>=0)setActive(index);
    }
  }
  return <div className="journey-field"><span id={`${id}-label`} className="field-label">{label}</span><button ref={trigger} type="button" className="journey-select" role="combobox" aria-labelledby={`${id}-label ${id}-value`} aria-haspopup="listbox" aria-expanded={open} aria-controls={open?`${id}-list`:undefined} aria-activedescendant={open?`${id}-option-${active}`:undefined} onKeyDown={keyboard} onClick={()=>open?setOpen(false):show()}><span><strong id={`${id}-value`}>{selected.label}</strong><small>{selected.detail}</small></span><span className={`select-chevron ${open?'up':''}`} aria-hidden="true" /></button>
    {open&&createPortal(<div ref={popup} className="journey-options" style={position}><div className="options-heading">{label}</div><div id={`${id}-list`} role="listbox" aria-labelledby={`${id}-label`}>{options.map((option,index)=><div key={option.value} id={`${id}-option-${index}`} role="option" aria-selected={option.value===value} className={`journey-option ${active===index?'focused':''}`} onPointerMove={()=>setActive(index)} onPointerDown={event=>event.preventDefault()} onClick={()=>choose(index)}>{option.image?<img src={option.image} alt=""  width="80" height="60"/>:<span className="option-marker" aria-hidden="true">{String(index+1).padStart(2,'0')}</span>}<span><strong>{option.label}</strong><small>{option.detail}</small></span>{option.value===value&&<span className="option-check" aria-hidden="true">✓</span>}</div>)}</div></div>,document.body)}
  </div>;
}
