'use client';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import type { Journey } from '@/lib/journeys';
import { availabilityLabel, bookable, upcoming, waitlistable } from '@/lib/journeys';
import { asset } from '@/lib/assets';
import { difficulty, dateLabel, money } from '@/lib/format';
import JourneyShell from '@/components/journey-shell';
import { fallbackTrekImage } from '@/lib/trek-images';
import AltitudeChart, { altitudePoints } from './altitude-chart';
import InquiryDialog from '@/components/inquiry-dialog';

/** Small line icons for the facts row. Decorative: the label beside each carries the meaning. */
const factIcons: Record<string, ReactNode> = {
  time: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  peak: <path d="m3 20 6-11 4 6 2-3 6 8z" />,
  grade: <path d="M4 20V14M10 20V9M16 20V4M22 20H2" />,
  group: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M16 5.5a3 3 0 0 1 0 5M18 14.5c2 .8 3 2.8 3 5.5" /></>,
};

function FactIcon({ name }: { name: keyof typeof factIcons }) {
  return (
    <svg className="fact-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {factIcons[name]}
    </svg>
  );
}

function monthDay(value: string) {
  const d = new Date(`${value}T00:00:00`);
  return {
    day: d.toLocaleDateString('en-GB', { day: '2-digit' }),
    month: d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
  };
}

export default function JourneyDetail({ journey: t, related }: { journey: Journey; demo?: boolean; related?: ReactNode }) {
  const [inquiry, setInquiry] = useState(false);
  // Every upcoming departure is listed, full ones included — a hidden batch
  // cannot invite anyone onto its waitlist.
  const departures = t.departures.filter(upcoming);
  const hasOpenDeparture = departures.some(d => bookable(d) || waitlistable(d));
  // Only chart the profile when at least two days have a recorded altitude.
  const altitude = altitudePoints(t.itinerary_days);
  const hasAltitude = altitude.length >= 2;

  return (
    <JourneyShell>
      <section className="trek-hero">
        <img src={t.image ? asset(t.image) : fallbackTrekImage(t.slug, t.destination_slug)} alt={t.title} fetchPriority="high" />
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/treks">Treks</Link>
            <span>/</span>
            <span>{t.destination_name}</span>
          </nav>
          <p className="eyebrow">{t.destination_name} · NEPAL</p>
          <h1>{t.title}</h1>
          <p>{t.tags || 'A new perspective. A little further beyond the horizon.'}</p>
          <div className="trek-hero-meta">
            <span>{t.duration_days} days</span>
            {t.altitude_max_meters ? <span>{t.altitude_max_meters.toLocaleString()} m high point</span> : null}
            <span>From {money(t.starting_price_usd)}</span>
          </div>
        </div>
      </section>
      <div className="container">
        <dl className="trek-facts">
          {([
            ['time', 'TIME ON THE TRAIL', `${t.duration_days} days`],
            ['peak', 'HIGHEST POINT', t.altitude_max_meters ? `${t.altitude_max_meters.toLocaleString()} m` : 'Ask the team'],
            ['grade', 'TRAIL DIFFICULTY', difficulty(t.difficulty_grade)],
            ['group', 'GROUP SIZE', `${t.min_group_size}–${t.max_group_size} travellers`]
          ] as const).map(([icon, label, value]) => (
            <div key={label}>
              <FactIcon name={icon} />
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <div className="trek-layout">
          <article className="trek-story">
            <nav className="trek-section-nav" aria-label="Journey sections">
              <a href="#overview">The journey</a>
              {t.gallery_images.length > 0 && <a href="#gallery">Gallery</a>}
              <a href="#itinerary">Itinerary</a>
              <a href="#included">Inclusions</a>
              <a href="#departures">Dates</a>
              {hasAltitude && <a href="#altitude">Altitude</a>}
            </nav>
            <section id="overview">
              <p className="eyebrow">A LITTLE FURTHER. A LITTLE CLOSER.</p>
              <h2>The journey<br /><em>stays with you.</em></h2>
              <p className="preserve-lines">{t.overview}</p>
              {t.best_seasons?.length > 0 && <p className="season-note">Best seasons: {t.best_seasons.join(' · ')}</p>}
            </section>
            {t.gallery_images.length > 0 && (
              <section id="gallery" className="trek-gallery-section">
                <p className="eyebrow">MOMENTS FROM THE TRAIL</p>
                <h2>A glimpse of<br /><em>the journey.</em></h2>
                <div className="trek-gallery-grid">
                  {t.gallery_images.map((image, index) => (
                    <img
                      key={`${image}-${index}`}
                      src={asset(image)}
                      alt={`${t.title} gallery image ${index + 1}`}
                      loading="lazy"
                    />
                  ))}
                </div>
              </section>
            )}
            <section id="itinerary">
              <p className="eyebrow">DAY BY DAY</p>
              <h2>The path ahead.</h2>
              {t.itinerary_days.length ? (
                <div className="itinerary-list itinerary-timeline">
                  {[...t.itinerary_days]
                    .sort((a, b) => a.day_number - b.day_number)
                    .map(day => (
                      <details key={day.day_number}>
                        <summary>
                          <span className="day-number">{String(day.day_number).padStart(2, '0')}</span>
                          <span>{day.title}{day.is_acclimatization_day && <small>Acclimatization day</small>}</span>
                          <span className="itinerary-plus">+</span>
                        </summary>
                        <div>
                          <p className="preserve-lines">{day.description}</p>
                          <p className="day-meta">{day.overnight_stay}{day.elevation_meters ? ` · ${day.elevation_meters.toLocaleString()} m` : ''}</p>
                        </div>
                      </details>
                    ))}
                </div>
              ) : (
                <div className="quiet-panel">
                  <p>The detailed itinerary is being prepared. Ask the team for the current route and daily walking plan.</p>
                  <button className="text-link" onClick={() => setInquiry(true)}>Ask for the itinerary ↗︎</button>
                </div>
              )}
            </section>
            <section id="included">
              <p className="eyebrow">KNOW BEFORE YOU GO</p>
              <h2>The details that matter.</h2>
              <div className="inclusion-grid">
                {[
                  ['Included', t.inclusions, 'inclusion-yes'],
                  ['Not included', t.exclusions, 'inclusion-no']
                ].map(([title, list, tone]) => (
                  <div key={String(title)} className={String(tone)}>
                    <h3>{String(title)}</h3>
                    {Array.isArray(list) && list.length ? (
                      <ul>{list.map((item, i) => <li key={i}>{item}</li>)}</ul>
                    ) : (
                      <p>To be confirmed with your itinerary.</p>
                    )}
                  </div>
                ))}
              </div>
              {t.packing_list?.length > 0 && (
                <details className="packing-list">
                  <summary>Your packing list +</summary>
                  <ul>{t.packing_list.map((item, i) => <li key={i}>{item}</li>)}</ul>
                </details>
              )}
            </section>
            <section id="departures">
              <p className="eyebrow">MAKE IT A DATE</p>
              <h2>Your next chapter.</h2>
              {departures.length ? (
                <div className="departure-list">
                  {departures.map(d => {
                    const open = bookable(d);
                    const waitlist = waitlistable(d);
                    return (
                      <div key={d.id} data-state={d.availability_state}>
                        <span className="departure-date" aria-hidden="true">
                          <b>{monthDay(d.start_date).day}</b>
                          {monthDay(d.start_date).month}
                        </span>
                        <div>
                          <strong>{dateLabel(d.start_date)}</strong>
                          <p>to {dateLabel(d.end_date)}</p>
                          <small className="seat-pill" data-seats={d.availability_state}>
                            {availabilityLabel(d)}
                          </small>
                        </div>
                        <div>
                          <strong>{money(d.price_usd)}</strong>
                          <small>per person</small>
                        </div>
                        {open ? (
                          <Link className="button green" href={`/booking?trek=${t.slug}&departure=${d.id}`}>Choose date ↗︎</Link>
                        ) : waitlist ? (
                          <Link className="button outline-dark" href={`/booking?trek=${t.slug}&departure=${d.id}`}>Join waitlist ↗︎</Link>
                        ) : (
                          <span className="button disabled" aria-disabled="true">Unavailable</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="quiet-panel">
                  <p>No departures are listed right now. Ask about upcoming dates or a private journey.</p>
                  <button className="button green" onClick={() => setInquiry(true)}>Ask about dates</button>
                </div>
              )}
              {departures.length > 0 && !hasOpenDeparture && (
                <div className="quiet-panel">
                  <p>Every listed departure is closed. Ask the team about additional dates or a private journey.</p>
                  <button className="button green" onClick={() => setInquiry(true)}>Ask about dates</button>
                </div>
              )}
            </section>
          </article>
          <aside className="trek-reserve">
            <span className="eyebrow">YOUR HIMALAYAN CHAPTER</span>
            <p className="reserve-price"><small>From</small>{money(t.starting_price_usd)}<small>USD per person</small></p>
            <hr />
            <p>{t.duration_days} days of new perspectives.</p>
            <a className="button gold" href="#departures">Explore departures ↓</a>
            <button className="button outline-dark" onClick={() => setInquiry(true)}>Talk to the team</button>
            <small>Questions first. A journey that fits you.</small>
          </aside>
        </div>
        {hasAltitude && (
          <section id="altitude" className="altitude-profile">
            <p className="eyebrow">HIGHS AND LOWS</p>
            <h2>The altitude profile.</h2>
            <p>Where you sleep each night, from {altitude[0].elevation.toLocaleString('en-US')} m to a high point of {Math.max(...altitude.map(p => p.elevation)).toLocaleString('en-US')} m.</p>
            <AltitudeChart points={altitude} />
          </section>
        )}
        {related}
      </div>
      {inquiry && <InquiryDialog journey={t.title} tripId={t.id} onClose={() => setInquiry(false)} />}
    </JourneyShell>
  );
}
