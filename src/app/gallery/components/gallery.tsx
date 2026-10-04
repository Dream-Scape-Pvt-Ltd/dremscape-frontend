'use client';
import UiArrow from '@/components/ui-arrow';
import { useState, useEffect, useRef } from 'react';
import { galleryPhotos } from '@/lib/editorial-content';
import { asset } from '@/lib/assets';

export default function Gallery() {
  const [filter, setFilter] = useState('All'),
    [selected, setSelected] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const previous = useRef<HTMLElement | null>(null);
  const visible = galleryPhotos
    .map((photo, index) => ({ ...photo, index }))
    .filter(p => filter === 'All' || p.group === filter);

  useEffect(() => {
    if (selected === null) return;
    previous.current = document.activeElement as HTMLElement;
    const overflow = document.body.style.overflow;
    dialog.current?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.current?.close();
      document.body.style.overflow = overflow;
      previous.current?.focus();
    };
  }, [selected === null]);

  function step(direction: number) {
    if (selected === null) return;
    const pos = visible.findIndex(x => x.index === selected);
    setSelected(visible[(pos + direction + visible.length) % visible.length].index);
  }

  return (
    <>
      <div className="gallery-heading">
        <div className="filter-chips" role="group" aria-label="Gallery categories">
          {['All', 'Landscapes', 'On the trail', 'Culture'].map(c => (
            <button key={c} aria-pressed={filter === c} onClick={() => setFilter(c)}>
              {c}
            </button>
          ))}
        </div>
        <span aria-live="polite">{visible.length} moments</span>
      </div>
      <div className="gallery-grid">
        {visible.map(p => (
          <button
            className="gallery-tile"
            key={p.image}
            onClick={() => setSelected(p.index)}
            aria-label={`View ${p.title}`}
          >
            <img src={asset(p.image)} alt={p.title} loading="lazy"  width="512" height="279"/>
            <span>
              <small>{p.group}</small>
              <strong>{p.title}</strong>
              <span className="ui-arrow" aria-hidden="true" />
            </span>
          </button>
        ))}
      </div>
      <p className="gallery-note">
        A visual collection from the Dreamscape design. Images are inspiration, not a record of a particular departure.
      </p>
      <dialog
        ref={dialog}
        className="gallery-dialog"
        aria-labelledby="gallery-caption"
        onCancel={() => setSelected(null)}
        onClick={e => {
          if (e.target === e.currentTarget) setSelected(null);
        }}
        onKeyDown={e => {
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            step(1);
          }
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            step(-1);
          }
        }}
      >
        {selected !== null && (
          <>
            <button className="gallery-close" aria-label="Close photo" onClick={() => setSelected(null)}>
              ×
            </button>
            <img src={asset(galleryPhotos[selected].image)} alt={galleryPhotos[selected].title}  width="512" height="279"/>
            <div className="gallery-dialog-foot">
              <button aria-label="Previous photo" onClick={() => step(-1)}>←</button>
              <p id="gallery-caption">{galleryPhotos[selected].title}</p>
              <button aria-label="Next photo" onClick={() => step(1)}><UiArrow/></button>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
