'use client';

import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {asset} from '@/lib/assets';

export default function SiteHeader({page='home',activeSection='home',onPlan}:{page?:string;activeSection?:string;onPlan:()=>void}) {
  const [menu,setMenu]=useState(false);
  const [searchOpen,setSearchOpen]=useState(false);
  const [query,setQuery]=useState('');
  const searchButton=useRef<HTMLButtonElement>(null);
  const searchInput=useRef<HTMLInputElement>(null);
  const menuButton=useRef<HTMLButtonElement>(null);
  const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{if(!searchOpen)return;const timer=window.setTimeout(()=>searchInput.current?.focus({preventScroll:true}),matchMedia('(prefers-reduced-motion: reduce)').matches?0:400);return()=>window.clearTimeout(timer);},[searchOpen]);
  useEffect(()=>{
    const scroll=()=>setScrolled(window.scrollY>40);scroll();
    const escape=(e:KeyboardEvent)=>{if(e.key!=='Escape')return;if(searchButton.current?.getAttribute('aria-expanded')==='true'){setSearchOpen(false);searchButton.current.focus();}else if(menuButton.current?.getAttribute('aria-expanded')==='true'){setMenu(false);menuButton.current.focus();}};
    const outside=(e:PointerEvent)=>{if(e.target instanceof Element&&!e.target.closest('.header')){setMenu(false);setSearchOpen(false);}};
    const resize=()=>{if(window.innerWidth>900)setMenu(false);};
    window.addEventListener('scroll',scroll,{passive:true});document.addEventListener('keydown',escape);document.addEventListener('pointerdown',outside);window.addEventListener('resize',resize);
    return()=>{window.removeEventListener('scroll',scroll);document.removeEventListener('keydown',escape);document.removeEventListener('pointerdown',outside);window.removeEventListener('resize',resize);};
  },[]);
  const links=[{label:'Home',href:'/#home',id:'home'},{label:'Destinations',href:'/destinations',id:'destinations'},{label:'Treks',href:'/treks',id:'treks'},{label:'Our story',href:'/about',id:'about'},{label:'Journal',href:'/blog',id:'journal'},{label:'Contact',href:'/contact',id:'contact'}];
  const suggestions=['Everest','Annapurna','Manaslu','Mustang'].filter(name=>name.toLowerCase().includes(query.trim().toLowerCase()));
  return <header data-page={page} className={`header site-navigation apple-nav ${scrolled?'scrolled':''} ${searchOpen?'search-open':''}`} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget)){setMenu(false);setSearchOpen(false);}}}><div className="container header-inner">
    <Link href="/" aria-label="Dreamscape Treks home"><img className="brand" src={asset('222-694-imgLinkBrandLogoDreamscapeTreks')} alt="Dreamscape Treks" width="166" height="57" /></Link>
    <nav className={`nav ${menu?'open':''}`} id="main-navigation" aria-label="Main navigation">{links.map(link=><Link key={link.id} href={link.href} aria-current={page==='home'?(link.id===activeSection?'location':undefined):(link.id===page?'page':undefined)} onClick={()=>setMenu(false)}>{link.label}</Link>)}</nav>
    <div className="header-actions"><button ref={searchButton} type="button" className="search-link" aria-label={searchOpen?'Close journey search':'Search journeys'} aria-controls="journey-search" aria-expanded={searchOpen} onClick={()=>{setMenu(false);setSearchOpen(!searchOpen);}}><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{searchOpen?<path d="m6 6 12 12M6 18 18 6"/>:<><circle cx="10.8" cy="10.8" r="6.7"/><path d="m16 16 4.5 4.5"/></>}</svg></button><button className="button header-cta" onClick={()=>{setMenu(false);setSearchOpen(false);onPlan();}}>Plan my journey <span aria-hidden="true">↗</span></button><button ref={menuButton} className="menu-toggle" aria-controls="main-navigation" aria-expanded={menu} onClick={()=>{setSearchOpen(false);setMenu(!menu);}}><span className="menu-label">{menu?'Close':'Menu'}</span><span className="menu-lines" aria-hidden="true"><i/><i/></span></button></div>
  </div>
  <div id="journey-search" className="nav-search-panel" inert={!searchOpen} aria-hidden={!searchOpen}>
    <div className="nav-search-clip"><div className="nav-search-content">
      <form action="/search" method="get" role="search" aria-label="Find a Dreamscape journey">
        <label htmlFor="nav-search-input">Where will your next story begin?</label>
        <div className="nav-search-field"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.7"/><path d="m16 16 4.5 4.5"/></svg><input ref={searchInput} id="nav-search-input" name="q" type="search" autoComplete="off" placeholder="Search treks or destinations" value={query} onChange={e=>setQuery(e.target.value)}/><button type="submit" aria-label="Find journeys"><span>Explore</span> ↗</button></div>
      </form>
      <div className="nav-search-suggestions"><p>{query.trim()?'Suggested destinations':'A little inspiration'}</p><div>{suggestions.map((name,index)=><a key={name} href={`/treks?q=${encodeURIComponent(name)}`} style={{animationDelay:`${index*45}ms`}}>{name}<span aria-hidden="true">↗</span></a>)}{suggestions.length===0&&<span className="nav-search-hint">Press Enter to search all journeys for “{query.trim()}”.</span>}</div></div>
      <a className="nav-search-all" href="/treks">Browse all journeys <span aria-hidden="true">→</span></a>
    </div></div>
  </div></header>;
}
