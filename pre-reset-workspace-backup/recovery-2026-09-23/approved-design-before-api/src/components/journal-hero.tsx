import Link from 'next/link';
import {MemoryImage} from './trek-memories';
import {memoryPhoto} from '@/lib/trek-memories';

export default function JournalHero(){return <section className="memory-hero container">
  <div className="memory-hero-copy"><p className="eyebrow"><span/>THE DREAMSCAPE JOURNAL</p><h1>Some trails<br/>stay <em>with you.</em></h1><p>The climb is only part of the story. These are the people, places and little moments we brought back from past treks.</p><div className="button-row"><a href="#journal-stories" className="button green">Explore the stories <span aria-hidden="true">↘</span></a><a href="#trek-memories" className="text-link">Open the photo archive ↗</a></div><div className="memory-hero-note"><span className="memory-note-line"/><span>FROM OUR PAST TREKS<br/><strong>Real photographs. Lasting memories.</strong></span></div></div>
  <div className="memory-hero-visual"><Link className="memory-hero-main" href="/blog/finding-your-own-pace"><MemoryImage photo={memoryPhoto('together-in-the-mountains')} priority/><span className="memory-hero-caption"><span><small>MEMORIES FROM THE TRAIL</small><strong>Better, together.</strong></span><span className="memory-round-arrow" aria-hidden="true">↗</span></span></Link><figure className="memory-hero-inset"><MemoryImage photo={memoryPhoto('prayer-flags-and-friends')} sizes="240px"/><figcaption>A moment worth keeping.</figcaption></figure><span className="memory-vertical-label">NEPAL · BEYOND THE HORIZON</span></div>
</section>;}
