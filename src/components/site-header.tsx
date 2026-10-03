'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { asset } from '@/lib/assets';
import { searchSite } from '@/lib/search';
import { toHits } from '@/lib/search-hits';
import { useSearchIndex } from '@/hooks/useSearchIndex';
import { navigationGroups } from '@/lib/navigation';

const inspiration = [{ label: 'All treks', href: '/treks?kind=treks' }, { label: 'Expeditions', href: '/treks?kind=expeditions' }, ...[{label:'Eastern Nepal',zone:'eastern'},{label:'Central Nepal',zone:'central'},{label:'Western Nepal',zone:'western'},{label:'Mid-Western Nepal',zone:'mid-western'},{label:'Far-Western Nepal',zone:'far-western'}].map(({label,zone})=>({label,href:`/treks?kind=treks&zone=${zone}`}))];
const hitLabel = { trek: 'Trek', expedition: 'Expedition', destination: 'Destination', story: 'Story' };

export default function SiteHeader({ page = 'home', onPlan }: { page?: string; activeSection?: string; onPlan: () => void }) {
  const [menu, setMenu] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cmsTours,setCmsTours]=useState<{label:string;description:string;href:string}[]>([]);
  const [query, setQuery] = useState('');
  const searchButton = useRef<HTMLButtonElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (!searchOpen) return; const timer = window.setTimeout(() => searchInput.current?.focus({ preventScroll: true }), matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 400); return () => window.clearTimeout(timer); }, [searchOpen]);
  useEffect(()=>{const controller=new AbortController();fetch('/api/categories',{signal:controller.signal}).then(response=>response.json()).then((body:{categories?:{name:string;slug:string;description:string}[]})=>{const tours=(body.categories||[]).filter(item=>/tour|culture|sightsee|wildlife|safari|luxury|heli/i.test(`${item.name} ${item.slug}`)).map(item=>({label:item.name,description:item.description||'Explore this style of journey',href:`/treks?kind=tours&tour=${encodeURIComponent(item.slug)}`}));if(!controller.signal.aborted&&tours.length)setCmsTours(tours);}).catch(()=>{});return()=>controller.abort();},[]);
  useEffect(() => {
    const escape = (e: KeyboardEvent) => { if (e.key !== 'Escape') return; const expanded = document.querySelector<HTMLButtonElement>('.nav-group-trigger[aria-expanded="true"]'); if(expanded){setOpenGroup(null);expanded.focus();} else if (searchButton.current?.getAttribute('aria-expanded') === 'true') { setSearchOpen(false); searchButton.current.focus(); } else if (menuButton.current?.getAttribute('aria-expanded') === 'true') { setMenu(false); menuButton.current.focus(); } };
    const outside = (e: PointerEvent) => { if (e.target instanceof Element && !e.target.closest('.header')) { setMenu(false); setSearchOpen(false); setOpenGroup(null); } };
    const resize = () => { if (window.innerWidth > 900) setMenu(false); };
    document.addEventListener('keydown', escape); document.addEventListener('pointerdown', outside); window.addEventListener('resize', resize);
    return () => { document.removeEventListener('keydown', escape); document.removeEventListener('pointerdown', outside); window.removeEventListener('resize', resize); };
  }, []);
  function closeNavigation(){setMenu(false);setOpenGroup(null);}
  const term = query.trim();
  // Load the index the first time search opens, then answer every keystroke locally.
  const index = useSearchIndex(searchOpen);
  const hits = useMemo(() => index && term.length >= 2 ? toHits(searchSite(term, index),{preview:index.demo}) : [], [index, term]);
  const searching = term.length >= 2 && !index;
  const groups=navigationGroups.map(group=>group.id==='tours'&&cmsTours.length?{...group,items:cmsTours}:group);
  return <header data-page={page} className={`header site-navigation apple-nav ${searchOpen ? 'search-open' : ''}`} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) { closeNavigation(); setSearchOpen(false); } }}><div className="container header-inner">
    <Link href="/" aria-label="Dreamscape Treks home"><img className="brand" src={asset('222-694-imgLinkBrandLogoDreamscapeTreks')} alt="Dreamscape Treks" width="166" height="57" /></Link>
    <nav className={`nav ${menu ? 'open' : ''}`} id="main-navigation" aria-label="Main navigation">{groups.map(group=><div className="nav-group" key={group.id}>
      <button type="button" className="nav-group-trigger" aria-expanded={openGroup===group.id} aria-controls={`nav-${group.id}`} onClick={()=>{setSearchOpen(false);setOpenGroup(openGroup===group.id?null:group.id);}} onKeyDown={e=>{if(e.key==='ArrowDown'){e.preventDefault();setOpenGroup(group.id);requestAnimationFrame(()=>document.querySelector<HTMLAnchorElement>(`#nav-${group.id} a`)?.focus());}}}>{group.label}<svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" aria-hidden="true"><path d="m3 4.5 3 3 3-3"/></svg></button>
      <div id={`nav-${group.id}`} className="nav-mega-panel" hidden={openGroup!==group.id}>
        <div className="nav-mega-intro"><p>{group.eyebrow}</p><h2>{group.title}</h2><span>{group.intro}</span><Link href={group.href} onClick={closeNavigation}>{group.allLabel} <span className="ui-arrow" aria-hidden="true" /></Link></div>
        <div className="nav-mega-links">{group.items.map(item=><Link key={item.label} href={item.href} onClick={closeNavigation}><strong>{item.label}<span className="ui-arrow" aria-hidden="true" /></strong><small>{item.description}</small></Link>)}</div>
        <img className="nav-mega-photo" src={asset(group.image)} alt="" width="320" height="240" loading="lazy"/>
        <div className="nav-mega-foot"><Link href="/departures" onClick={closeNavigation}>Upcoming departures →</Link><Link href="/blog" onClick={closeNavigation}>Journal & travel notes →</Link></div>
      </div>
    </div>)}<Link href="/blog" aria-current={page==='journal'?'page':undefined} onClick={closeNavigation}>Journal</Link><Link href="/contact" aria-current={page==='contact'?'page':undefined} onClick={closeNavigation}>Contact</Link></nav>
    <div className="header-actions"><button ref={searchButton} type="button" className="search-link" aria-label={searchOpen ? 'Close journey search' : 'Search journeys'} aria-controls="journey-search" aria-expanded={searchOpen} onClick={() => { closeNavigation(); setSearchOpen(!searchOpen); }}><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{searchOpen ? <path d="m6 6 12 12M6 18 18 6" /> : <><circle cx="10.8" cy="10.8" r="6.7" /><path d="m16 16 4.5 4.5" /></>}</svg></button><button className="button header-cta" onClick={() => { closeNavigation(); setSearchOpen(false); onPlan(); }}>Plan my journey <span className="ui-arrow" aria-hidden="true" /></button><button ref={menuButton} className="menu-toggle" aria-controls="main-navigation" aria-expanded={menu} aria-label={menu ? 'Close menu' : 'Open menu'} onClick={() => { setSearchOpen(false); setOpenGroup(null); setMenu(!menu); }}><span className="menu-lines" aria-hidden="true"><i /><i /></span></button></div>
  </div>
    <div id="journey-search" className="nav-search-panel" inert={!searchOpen} aria-hidden={!searchOpen}>
      <div className="nav-search-clip"><div className="nav-search-content">
        <form action="/search" method="get" role="search" aria-label="Find a Dreamscape journey">
          <label htmlFor="nav-search-input">Where will your next story begin?</label>
          <div className="nav-search-field"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.7" /><path d="m16 16 4.5 4.5" /></svg><input ref={searchInput} id="nav-search-input" name="q" type="search" autoComplete="off" placeholder="Search treks, expeditions or destinations" value={query} onChange={e => setQuery(e.target.value)} /><button type="submit" aria-label="Find journeys"><span>Explore</span> ↗︎</button></div>
        </form>
        {term.length < 2 ? <div className="nav-search-suggestions"><p>Browse by category or place</p><div>{inspiration.map((item, index) => <a key={item.label} href={item.href} style={{ animationDelay: `${index * 45}ms` }}>{item.label}<span className="ui-arrow" aria-hidden="true" /></a>)}</div></div>
          : <div className="nav-search-results" aria-live="polite" aria-busy={searching}>{hits.length ? <ul>{hits.map(hit => <li key={hit.href}><a href={hit.href} onClick={() => setSearchOpen(false)}>{hit.image ? <img src={hit.image} alt="" width="56" height="42" loading="lazy" /> : <span className="nav-search-thumb" aria-hidden="true" />}<span className="nav-search-hit"><small>{hitLabel[hit.type]}</small><strong>{hit.title}</strong><span>{hit.meta}</span></span></a></li>)}</ul> : <p className="nav-search-hint">{searching ? 'Searching…' : <>No match for “{term}” yet. Try a region, a trek name or “12 days”.</>}</p>}</div>}
        <a className="nav-search-all" href={term.length >= 2 ? `/search?q=${encodeURIComponent(term)}` : '/treks'}>{term.length >= 2 ? <>See all results for “{term}”</> : 'Browse all journeys'} <span aria-hidden="true">→</span></a>
      </div></div>
    </div></header>;
}
