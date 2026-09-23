'use client';

import Link from 'next/link';
import {useEffect,useState} from 'react';
import {asset} from '@/lib/assets';

export default function SiteHeader({page='home',activeSection='home',onPlan}:{page?:string;activeSection?:string;onPlan:()=>void}) {
  const [menu,setMenu]=useState(false);
  const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{
    const scroll=()=>setScrolled(window.scrollY>40);scroll();
    const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){setMenu(false);}};
    const outside=(e:PointerEvent)=>{if(e.target instanceof Element&&!e.target.closest('.header'))setMenu(false);};
    const resize=()=>{if(window.innerWidth>900)setMenu(false);};
    window.addEventListener('scroll',scroll,{passive:true});document.addEventListener('keydown',escape);document.addEventListener('pointerdown',outside);window.addEventListener('resize',resize);
    return()=>{window.removeEventListener('scroll',scroll);document.removeEventListener('keydown',escape);document.removeEventListener('pointerdown',outside);window.removeEventListener('resize',resize);};
  },[]);
  const links=[{label:'Home',href:'/#home',id:'home'},{label:'Destinations',href:'/destinations',id:'destinations'},{label:'Treks',href:'/treks',id:'treks'},{label:'Our story',href:'/about',id:'about'},{label:'Journal',href:'/blog',id:'journal'},{label:'Contact',href:'/contact',id:'contact'}];
  return <header data-page={page} className={`header ${scrolled?'scrolled':''}`}><div className="container header-inner">
    <Link href="/" aria-label="Dreamscape Treks home"><img className="brand" src={asset('222-694-imgLinkBrandLogoDreamscapeTreks')} alt="Dreamscape Treks" width="128" height="44" /></Link>
    <nav className={`nav ${menu?'open':''}`} id="main-navigation" aria-label="Main navigation">{links.map(link=><Link key={link.id} href={link.href} aria-current={page==='home'?(link.id===activeSection?'location':undefined):(link.id===page?'page':undefined)} onClick={()=>setMenu(false)}>{link.label}</Link>)}</nav>
    <div className="header-actions"><a className="search-link" href="/search" aria-label="Search journeys"><img className="icon" src={asset('222-694-imgSvg')} alt="" width="18" height="18" /></a><button className="button gold header-cta" onClick={()=>{setMenu(false);onPlan();}}>Plan My Journey</button><button className="menu-toggle" aria-controls="main-navigation" aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?'Close':'Menu'}<span aria-hidden="true">{menu?'×':'☰'}</span></button></div>
  </div></header>;
}
