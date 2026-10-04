'use client';
import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { siteImage } from '@/lib/site-images';
import { MemoryReveal } from './trek-memories';
import type { Guide } from '@/lib/guides';
import {memoryPhotos} from '@/lib/trek-memories';

export default function JournalIndex({ guides }: { guides: Guide[] }) {
  const [category, setCategory] = useState(''),
    [q, setQ] = useState('');
  const categories = Array.from(new Set(guides.map(g => g.category)));
  const visible = guides.filter(
    g => (!category || g.category === category) && `${g.title} ${g.excerpt}`.toLowerCase().includes(q.trim().toLowerCase())
  );
  return (
    <>
      <div className="journal-controls">
        <div className="filter-chips" role="group" aria-label="Article categories">
          <button aria-pressed={!category} onClick={() => setCategory('')}>All stories</button>
          {categories.map(c => (
            <button aria-pressed={category === c} key={c} onClick={() => setCategory(c)}>{c.replaceAll('_', ' ')}</button>
          ))}
        </div>
        <label>
          <span className="sr-only">Search stories</span>
          <input type="search" placeholder="Find a story…" value={q} onChange={e => setQ(e.target.value)} />
        </label>
      </div>
      <p className="results-count" aria-live="polite">
        {visible.length} {visible.length === 1 ? 'story' : 'stories'} to discover
      </p>
      {visible.length ? (
        <div className="journal-grid">
          {visible.map(g => (
            <MemoryReveal key={g.slug}>
              <Link className="journal-card" href={`/blog/${g.slug}`}>
                <div>
                  {g.image ? (
                    <Image
                      className={g.photoIds ? 'memory-photo' : ''}
                      src={siteImage(g.image)}
                      alt=""
                      fill
                      sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw"
                      unoptimized={!g.photoIds}
                    />
                  ) : (
                    <span className="journal-image-fallback">
                      Dreamscape<br />
                      <em>Journal.</em>
                    </span>
                  )}
                </div>
                <section>
                  <p className="eyebrow">{g.category.replaceAll('_', ' ')}</p>
                  <h2>{g.title}</h2>
                  <p>{g.excerpt}</p><div className="journal-card-previews">{(g.galleryImages?.length?g.galleryImages:g.photoIds?.map(id=>memoryPhotos.find(p=>p.id===id)?.src).filter((src):src is string=>!!src)||[]).slice(0,3).map((src,index)=><img key={`${src}-${index}`} src={src} alt="" loading="lazy" width="512" height="279"/>)}</div>
                  <span className="journal-card-foot">
                    <span>{g.reading ? `${g.reading} read` : 'Read the story'}</span>
                    <span>↗︎</span>
                  </span>
                </section>
              </Link>
            </MemoryReveal>
          ))}
        </div>
      ) : (
        <div className="status">
          <h3>{guides.length ? 'No stories match just yet.' : 'A new chapter is on its way.'}</h3>
          <p>{guides.length ? 'Try another word or browse all stories.' : 'Published journal stories will appear here.'}</p>
          {guides.length > 0 && <button className="button green" onClick={() => { setCategory(''); setQ(''); }}>Reset filters</button>}
        </div>
      )}
    </>
  );
}
