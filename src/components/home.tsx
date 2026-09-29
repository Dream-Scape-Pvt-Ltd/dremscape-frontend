'use client';
import UpcomingDepartures from './upcoming-departures';

import { storyHref } from '@/lib/links';
import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { asset } from '@/lib/assets';
import { trips as sampleTrips, type Trip } from '@/lib/catalog';
import { filterHomeTrips } from '@/lib/home-filters';
import HomeSlideshow from './home-slideshow';
import JourneySelect from './journey-select';
import TrekFilm from './trek-film';
import SiteHeader from './site-header';
import SiteFooter from './site-footer';
import PhotoShowcase from './photo-showcase';
import JourneyCard from './journey-card';
import InquiryForm from './inquiry-form';
import { journalPosts } from '@/lib/editorial-content';
import { nepalZones } from '@/lib/nepal-zones';
import { homepageRegions } from '@/lib/homepage-regions';
import type { HomeReview } from '@/lib/homepage-reviews';

function Icon({ name = 'heroContext-imgSvg', className = '' }: { name?: string; className?: string }) { return <img className={`icon ${className}`} src={asset(name)} width="18" height="18" alt="" />; }
function Eyebrow({ children }: { children: ReactNode }) { return <p className="eyebrow"><span />{children}</p>; }
// CMS content can arrive without an image (e.g. a journal post with no cover); show a house photo instead of failing the page.
const FALLBACK_PHOTO = '/images/trek-memories/mountain-amphitheatre.jpg';
function Photo({ name, alt, className = '' }: { name?: string; alt: string; className?: string }) { return <img src={asset(name?.trim() || FALLBACK_PHOTO)} alt={alt} className={className} loading="lazy" />; }
const defaultArticles = journalPosts.map(p => ({ ...p, tag: p.category, date: p.reading + ' read' }));

export default function Home({ articles = defaultArticles, reviews = [], reviewsUnavailable = false, heroCaption, heroLocation, heroTitle = "Beyond the Horizon.", heroDescription = "Nepal treks, shaped around you. Explore the Himalaya with a team rooted here.", heroEyebrow = "Local journeys · Since 2005", heroImage, heroImageAlt, destinationCountries = { everest: "NEPAL", annapurna: "NEPAL", manaslu: "NEPAL" }, finderDestinations = '|Anywhere\nnepal|Nepal\nbeyond-nepal|Beyond Nepal', finderDifficulties = '|Any difficulty\neasy|Easy\nnormal|Normal\ndifficult|Difficult\nextreme|Extreme', finderBudgets = '|Any budget\nunder-1500|Under $1,500\n1500-2500|$1,500 – $2,500\nover-2500|Above $2,500' }: { articles?: { id: string; slug: string; title: string; image: string; tag: string; date: string; excerpt: string }[]; reviews?: HomeReview[]; reviewsUnavailable?: boolean; heroTitle?: string; heroDescription?: string; heroEyebrow?: string; heroImage?: string; heroImageAlt?: string; heroCaption?: string; heroLocation?: string; destinationCountries?: Record<string, string>; finderDestinations?: string; finderDifficulties?: string; finderBudgets?: string }) {

  const [filmOpen, setFilmOpen] = useState(false);

  const [activeSection, setActiveSection] = useState('home');
  const [destination, setDestination] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [budget, setBudget] = useState('');
  const [catalog, setCatalog] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [demo, setDemo] = useState(true);
  const [filters, setFilters] = useState({ destination: '', difficulty: '', budget: '' });
  const [searched, setSearched] = useState(false);
  const [modal, setModal] = useState<{ kind: 'inquiry' | 'article' | 'info'; title: string; message?: string } | null>(null);
  const parseOptions = (value: string) => value.split(/\r?\n/).map(row => { const [optionValue, ...label] = row.split('|'); return optionValue !== undefined ? { value: optionValue.trim(), label: label.join('|').trim() } : null; }).filter((option): option is { value: string; label: string } => !!option && !!option.label);
  const dialog = useRef<HTMLDialogElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  async function loadCatalog() {
    setLoading(true); setError('');
    try { const response = await fetch('/api/trips'); const data = await response.json(); if (!response.ok) throw new Error(data.error); const hasPublishedJourneys = data.trips.length > 0; setCatalog(hasPublishedJourneys ? data.trips : sampleTrips); setDemo(data.demo || !hasPublishedJourneys); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not load journeys.'); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    void loadCatalog(); const onScroll = () => {

      const sections = ['home', 'journeys', 'upcoming-departures', 'destinations', 'about', 'traveller-stories', 'journal', 'contact'];
      const current = sections.filter(id => (document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) <= 180).at(-1);
      setActiveSection(current || 'home');
    }; onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { if (modal) { lastFocus.current = document.activeElement as HTMLElement; dialog.current?.showModal(); document.body.style.overflow = 'hidden'; } else { dialog.current?.close(); document.body.style.overflow = ''; lastFocus.current?.focus(); } return () => { document.body.style.overflow = ''; }; }, [modal]);
  function openInquiry(title = 'Plan your Himalayan journey', message = '') { setModal({ kind: 'inquiry', title, message }); }
  function search(event: FormEvent) { event.preventDefault(); setFilters({ destination, difficulty, budget }); setSearched(true); document.getElementById('journeys')?.scrollIntoView({ behavior: 'smooth' }); }
  const visible = filterHomeTrips(catalog, filters, destinationCountries);
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <SiteHeader activeSection={activeSection} onPlan={() => openInquiry()} />
    <main id="main" className="home-discovery">
      <section className="hero home-hero" id="home">
        <HomeSlideshow image={heroImage} imageAlt={heroImageAlt} />
        <div className="hero-shade" />
        <div className="container hero-content"><div className="hero-headline"><Eyebrow>{heroEyebrow}</Eyebrow><h1>{heroTitle}</h1></div><p className="hero-description">{heroDescription}</p><div className="hero-buttons"><button className="button gold" onClick={() => document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>Find My Trek <Icon /></button><button className="explore-link" onClick={() => setFilmOpen(true)}><span className="play"><Icon name="heroContext-imgSvg1" /></span><span>A glimpse of Nepal<small>Meet the mountains</small></span></button></div></div>
        <div className="hero-caption"><span className="caption-line" /><div><strong>{heroCaption || "A world above the ordinary."}</strong><span>{heroLocation || "The Himalayas, Nepal"}</span></div><a href="#planner" aria-label="Discover your journey">↓</a></div>
      </section>
      <section id="planner" className="planner container simple-planner" aria-label="Find your journey">
        <div className="planner-heading"><h2>Where will your story begin?</h2><p>Find a journey at your pace.</p></div>
        <form className="search-form" onSubmit={search}>
          <JourneySelect label="Destination" value={destination} onChange={setDestination} options={parseOptions(finderDestinations)} />
          <JourneySelect label="Difficulty" value={difficulty} onChange={setDifficulty} options={parseOptions(finderDifficulties)} />
          <JourneySelect label="Budget · USD / person" value={budget} onChange={setBudget} options={parseOptions(finderBudgets)} />
          <button className="button green" type="submit">Find my journey <span aria-hidden="true">↗</span></button>
        </form>
      </section>
      <section className="trust container reveal" aria-label="Why travel with Dreamscape">{[['Dreamscape Treks since 2005', 'Local knowledge and personal connections'], ['Planned around you', 'Thoughtful routes shaped to your pace'], ['People before peaks', 'Respect for our mountain communities'], ['Travel a little lighter', 'Care for the places we call home']].map(([title, text], i) => <div key={title}><span className="trust-icon"><Icon name={`222-3-imgSvg${i || ''}`} /></span><h3>{title}</h3><p>{text}</p></div>)}</section>
      <section className="section container" id="journeys"><div className="section-heading reveal"><div><Eyebrow>Handpicked expeditions</Eyebrow><h2>{searched ? 'Find Your Himalayan Journey' : 'Featured Himalayan Journeys'}</h2></div><a className="text-link" href="/treks">View All Journeys <Icon /></a></div>
        {demo && <p className="catalog-note">Route ideas to help you start dreaming. Itineraries, pricing and departures are confirmed with our team.</p>}
        {loading ? <p className="status" role="status">Finding your next adventure…</p> : error ? <div className="status" role="alert"><p>{error}</p><button className="button green" onClick={() => void loadCatalog()}>Try again</button></div> : visible.length === 0 ? <div className="status"><h3>No journeys match these filters yet.</h3><p>Try another region or ask us to tailor a journey for you.</p><button className="button gold" onClick={() => openInquiry('Create a custom journey', 'I’m interested in a personally planned journey.')}>Build My Journey <Icon /></button></div> : <><div className={`trip-grid${searched ? ' trip-grid-results' : ''}`}>{(searched ? visible : visible.slice(0, 4)).map(trip => <JourneyCard key={trip.slug} trip={trip} preview={demo} />)}</div>{!searched && visible.length > 1 && <p className="home-trip-swipe">Swipe to explore the journeys <span aria-hidden="true">→</span></p>}</>}
      </section>
      <UpcomingDepartures />
      <section className="container section home-regions" id="destinations"><div className="section-heading"><div><Eyebrow>Six ways into the Himalaya</Eyebrow><h2>Find your corner of Nepal.</h2></div><Link className="text-link" href="/destinations/nepal">Explore Nepal <span aria-hidden="true">↗</span></Link></div><div className="home-region-grid">{homepageRegions.map(region => <Link className="home-region-card" key={region.value} href={region.href}><Photo name={region.image} alt={`${region.label} landscape`} /><div><h3>{region.label}</h3><p>{region.description}</p><span aria-hidden="true">↗</span></div></Link>)}</div><div className="home-beyond"><div><p className="eyebrow">BEYOND NEPAL</p><h3>Let the journey take you further.</h3><p>Explore Bhutan, Tibet and India with our team.</p></div><Link className="text-link" href="/destinations/beyond-nepal">Discover beyond Nepal <span aria-hidden="true">↗</span></Link></div></section>
      <section id="about" className="story section">
        <div className="story-wave story-wave-top" aria-hidden="true">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0 L1440 0 L1440 42 C1180 78 880 96 520 86 C290 80 130 52 0 32 Z" />
          </svg>
        </div>
        <div className="story-backdrop" aria-hidden="true">
          <img src="/images/story-mountain-backdrop.svg" alt="" className="story-backdrop-mountains" />
          <div className="story-backdrop-glow" />
        </div>
        <div className="container story-grid">
          <div>
            <Eyebrow>Our story · Since 2005</Eyebrow>
            <h2>Rooted in Nepal.<br /><em>Built around people.</em></h2>
            <p>We’re a Nepal-based team creating personally planned journeys. Since 2005, our work has brought travellers closer to the mountains, cultures and communities we call home.</p>
            <ul className="story-values" aria-label="Our approach">
              <li>We listen first</li>
              <li>Experience in the field</li>
              <li>Travel with respect</li>
            </ul>
            <a className="button gold" href="/about">Meet Dreamscape <Icon /></a>
          </div>
          <PhotoShowcase />
        </div>
        <div className="story-wave story-wave-bottom" aria-hidden="true">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120 L1440 120 L1440 55 C1100 35 800 88 460 96 C200 102 80 68 0 38 Z" />
          </svg>
        </div>
      </section>
      <section className="section container home-reviews" id="traveller-stories"><div className="section-heading"><div><Eyebrow>The trail, in their words</Eyebrow><h2>Stories from our travellers.</h2></div><Link href="/reviews" className="text-link">All traveller stories <span aria-hidden="true">↗</span></Link></div>{reviews.length > 0 ? <div className="home-review-grid">{reviews.map(review => <article key={review.id}><span className="review-stars" aria-label={`${review.rating_overall} out of 5 stars`}>{'★'.repeat(Math.round(review.rating_overall))}</span><h3>{review.title}</h3><p className="home-review-excerpt">{review.content}</p><footer><strong>{review.reviewer_name}</strong>{review.reviewer_country && <span>{review.reviewer_country}</span>}<span>{review.trip_title}</span>{review.is_verified && <small>Verified booking</small>}</footer><Link className="text-link" href={`/reviews?trek=${encodeURIComponent(review.trip_slug)}#review-${review.id}`}>Read full story <span aria-hidden="true">↗</span></Link></article>)}</div> : <div className="home-review-empty"><p>{reviewsUnavailable ? 'Traveller stories are temporarily unavailable. You can visit our reviews page or speak with the team.' : 'Our next chapter is yours. Published traveller stories will appear here as they’re shared with our team.'}</p><Link className="text-link" href="/reviews">Share your experience <span aria-hidden="true">↗</span></Link></div>}</section>
      <section className="section container reveal" id="journal"><div className="section-heading"><div><Eyebrow>From our past treks</Eyebrow><h2>Some trails stay with you.</h2></div><a className="text-link" href="/blog">Explore the journal ↗</a></div>{articles.length ? <div className="article-grid">{articles.map(article => <article className="article-card" key={article.title}><Photo name={article.image} alt={article.title} /><div><p className="article-tag">{article.tag}</p><h3>{article.title}</h3><p className="home-story-excerpt">{article.excerpt}</p><p className="article-date">{article.date}</p><a className="text-link" href={storyHref(article.id)}>Read Story <Icon name="222-465-imgSvg" /></a></div></article>)}</div> : <p className="status" role="status">Journal stories are temporarily unavailable. Please check back soon.</p>}</section>
      <section className="container home-plan section"><div><Eyebrow>Your dates. Your pace.</Eyebrow><h2>Let’s plan your next chapter.</h2><p>Tell us what draws you to Nepal. We’ll help you find the right trail.</p></div><button className="button gold" onClick={() => openInquiry()}>Plan my journey <span aria-hidden="true">↗</span></button></section>
    </main>
    {filmOpen && <TrekFilm onClose={() => setFilmOpen(false)} onExplore={() => { setFilmOpen(false); document.getElementById('journeys')?.scrollIntoView({ behavior: 'smooth' }); }} />}
    <SiteFooter />
    <dialog ref={dialog} onCancel={() => setModal(null)} onClick={e => { if (e.target === e.currentTarget) setModal(null); }} aria-labelledby="dialog-title"><div className="dialog-inner"><button className="close-dialog" aria-label="Close dialog" onClick={() => setModal(null)}>×</button><Eyebrow>Dreamscape Treks</Eyebrow><h2 id="dialog-title">{modal?.title}</h2>
      {modal?.kind === 'inquiry' ? <InquiryForm initialMessage={modal.message} /> : <><p className="dialog-description">{modal?.message}</p><button className="button green" onClick={() => openInquiry('Ask the Dreamscape team', `I would like to know more about ${modal?.title}.`)}>Ask the Team <Icon /></button></>}
    </div></dialog>
  </>;
}
