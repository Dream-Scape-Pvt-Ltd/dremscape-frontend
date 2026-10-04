'use client';

import { useEffect, useRef, useState } from 'react';
import { asset } from '@/lib/assets';

const scenes = [
  { image: 'heroContext-imgHimalayanAlpineSunriseWithPrayerFlagsAndSnowPeaks', place: 'The Nepal Himalaya', title: 'Beyond the Horizon.', caption: 'Some journeys stay with you forever.' },
  { image: '222-78-imgNepalEverestBaseCampAndAmaDablamPeak', place: 'Everest & Khumbu', title: 'Walk among giants.', caption: 'Follow the trails that lead you closer to the sky.' },
  { image: '222-78-imgAnnapurnaRangeAndHighGlacialLakesNepal', place: 'Annapurna', title: 'Find a different rhythm.', caption: 'Still lakes. High passes. A little more wonder.' },
  { image: '222-370-imgTrekkersSmilingWithHimalayanSnowPeaksBackground', place: 'Your next chapter', title: 'Come back with a story.', caption: 'Discover Nepal with Dreamscape Treks.' },
];

export default function TrekFilm({ onClose, onExplore }: { onClose: () => void; onExplore: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [scene, setScene] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [youtube, setYoutube] = useState<{videoId:string;title:string}|null>(null);
  const filmUrl = process.env.NEXT_PUBLIC_TREK_FILM_URL;

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/youtube/latest', {signal:controller.signal}).then(r=>r.json()).then(data=>{
      if(data.status==='ready' && /^[\w-]{11}$/.test(data.videoId)) {
        setYoutube({videoId:data.videoId,title:data.title||'Dreamscape Treks'});
        setPlaying(false);
      }
    }).catch(()=>{});
    return ()=>controller.abort();
  }, []);

  useEffect(() => {
    const focus = document.activeElement as HTMLElement;
    const overflow = document.body.style.overflow;
    dialog.current?.showModal();
    document.body.style.overflow = 'hidden';
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPlaying(!motion.matches);
    const change = () => { if (motion.matches) setPlaying(false); };
    motion.addEventListener('change', change);
    return () => {
      document.body.style.overflow = overflow;
      focus?.focus();
      motion.removeEventListener('change', change);
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setScene(index => (index + 1) % scenes.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [playing, scene]);

  return (
    <dialog
      ref={dialog}
      className="film-dialog"
      aria-label="Explore Nepal — Beyond the Horizon"
      onCancel={onClose}
      onClick={event => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="film-shell">
        <button className="film-close" onClick={onClose} aria-label="Close film">×</button>
        {youtube ? <div className="youtube-film"><iframe title={youtube.title} src={`https://www.youtube-nocookie.com/embed/${youtube.videoId}?rel=0`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/></div> : filmUrl && !videoError ? (
          <video
            className="trek-video"
            controls
            playsInline
            preload="metadata"
            poster={asset(scenes[0].image)}
            onError={() => setVideoError(true)}
          >
            <source src={filmUrl} />
            Your browser does not support video playback.
          </video>
        ) : (
          <div className={`cinematic-preview ${playing ? 'is-playing' : ''}`}>
            {scenes.map((item, index) => (
              <img
                key={item.image}
                className={`film-scene ${scene === index ? 'current' : ''}`}
                src={asset(item.image)}
                alt=""
               width="512" height="279"/>
            ))}
            <div className="film-vignette" />
            <div className="film-topline">
              <span>Dreamscape Treks</span>
              <span>NEPAL · ANIMATED PREVIEW</span>
            </div>
            <div className="film-copy" key={scene}>
              <span>{scenes[scene].place}</span>
              <h2>{scenes[scene].title}</h2>
              <p>{scenes[scene].caption}</p>
            </div>
            <div className="film-controls">
              <button
                onClick={() => setPlaying(!playing)}
                aria-label={playing ? 'Pause preview' : 'Play preview'}
              >
                {playing ? 'Ⅱ Pause' : '▶ Play'}
              </button>
              <div className="film-chapters">
                {scenes.map((item, index) => (
                  <button
                    key={item.place}
                    aria-label={`Show ${item.place}`}
                    aria-pressed={scene === index}
                    onClick={() => setScene(index)}
                  >
                    <span style={{ width: scene === index ? '100%' : '0%' }} />
                  </button>
                ))}
              </div>
              <span>0{scene + 1} / 04</span>
            </div>
          </div>
        )}
        <div className="film-footer">
          <div>
            <a className="film-channel" href="https://www.youtube.com/@Dreamscapetreks" target="_blank" rel="noopener noreferrer">Dreamscape channel ↗︎</a>
            <strong>Your journey begins with a little curiosity.</strong>
            <p>
              {filmUrl && !videoError
                ? 'Discover your next Himalayan journey.'
                : 'A moving glimpse of Nepal. Our full trekking film is coming soon.'}
            </p>
          </div>
          <button className="button gold" onClick={onExplore}>
            Find My Trek <span className="ui-arrow" aria-hidden="true" />
          </button>
        </div>
      </div>
    </dialog>
  );
}
