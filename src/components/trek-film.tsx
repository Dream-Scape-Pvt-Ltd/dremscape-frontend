'use client';

import {useEffect,useRef,useState} from 'react';
import {asset} from '@/lib/assets';

type YouTubeState={status:'loading'|'ready'|'preview'|'unavailable';videoId?:string;title?:string;videoTitle?:string;videoDescription?:string;thumbnail?:string;channelUrl?:string};
const channelFallback='https://www.youtube.com/@Dreamscapetreks';
export default function TrekFilm({onClose,onExplore}:{onClose:()=>void;onExplore:()=>void}){
  const dialog=useRef<HTMLDialogElement>(null);
  const [youtube,setYoutube]=useState<YouTubeState>({status:'loading'});
  const [imageFailed,setImageFailed]=useState(false);
  useEffect(()=>{
    const controller=new AbortController();
    fetch('/api/youtube/latest',{signal:controller.signal}).then(response=>{if(!response.ok)throw new Error();return response.json();}).then(setYoutube).catch(()=>{if(!controller.signal.aborted)setYoutube({status:'unavailable'});});
    return()=>controller.abort();
  },[]);
  useEffect(()=>{
    const focus=document.activeElement as HTMLElement|null;
    const overflow=document.body.style.overflow;
    dialog.current?.showModal();document.body.style.overflow='hidden';
    return()=>{document.body.style.overflow=overflow;focus?.focus();};
  },[]);
  const channelUrl=youtube.channelUrl||channelFallback;
  const isVideo=youtube.status==='ready'&&youtube.videoId;
  const image=youtube.thumbnail||'/images/trek-memories/home-slide-3.jpg';
  return <dialog ref={dialog} className="film-dialog" aria-label="Explore Dreamscape Treks videos" onCancel={onClose} onClick={event=>{if(event.target===event.currentTarget)onClose();}}><div className="film-shell"><button type="button" className="film-close" onClick={onClose} aria-label="Close video">×</button>
    {youtube.status==='loading'?<div className="film-loading" role="status"><span className="film-loading-ring"/>Finding the latest Dreamscape video…</div>:isVideo?<div className="youtube-film"><iframe title={youtube.title||'Latest Dreamscape channel video'} src={`https://www.youtube-nocookie.com/embed/${youtube.videoId}?autoplay=1&playsinline=1&rel=0`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/></div>:<div className="film-preview"><img src={asset(imageFailed?'/images/trek-memories/home-slide-3.jpg':image)} alt="Trekkers sharing a moment in the Himalayas" onError={()=>setImageFailed(true)}/><div className="film-preview-shade"/><div className="film-preview-kicker">DREAMSCAPE TREKS · YOUTUBE</div><div className="film-preview-copy"><span>CHANNEL PREVIEW</span><h2>{youtube.videoTitle||'A journey through Nepal'}</h2><p>{youtube.videoDescription||'Explore Nepal through mountain trails, local stories and the people who make each journey memorable.'}</p></div><a className="film-preview-play" href={channelUrl} target="_blank" rel="noopener noreferrer" aria-label="Open Dreamscape Treks on YouTube">▶</a></div>}
    <div className="film-footer"><div><strong>{isVideo?youtube.title:(youtube.videoTitle||'Explore Dreamscape on YouTube')}</strong><p>{isVideo?'The latest public video from the Dreamscape channel.':youtube.videoDescription||'New videos from the trail will appear here as they are published.'}</p><a className="film-channel-link" href={isVideo?`https://www.youtube.com/watch?v=${youtube.videoId}`:channelUrl} target="_blank" rel="noopener noreferrer">{isVideo?'Watch video on YouTube':'Visit Dreamscape on YouTube'} ↗</a></div><button className="button gold" onClick={onExplore}>Find My Trek <span aria-hidden="true">↗</span></button></div>
  </div></dialog>;
}
