'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { COUNTRIES, flagUrl, type Country } from '@/lib/countries';

const Flag = ({ iso2 }: { iso2: string }) => <img className="phone-flag" src={flagUrl(iso2)} alt="" width={20} height={15} loading="lazy" />;

/**
 * Phone/WhatsApp field: a searchable country-code picker beside a plain
 * `tel` input. The picker starts unselected on purpose (no default country)
 * so the user always makes a deliberate choice. The number input keeps
 * `name`/`required` so native browser validation is unaffected; the chosen
 * dial code rides along as `${name}_dial_code` for the consuming form to
 * combine before it sends the request.
 */
export default function PhoneField({ name, label, required, optionalHint }: { name: string; label: string; required?: boolean; optionalHint?: boolean }) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [active, setActive] = useState(0);
  const [country, setCountry] = useState<Country | null>(null);
  const [position, setPosition] = useState({ left: 0, top: 0, width: 280, maxHeight: 340 });
  const [host, setHost] = useState<HTMLElement | null>(null);

  const results = filter.trim()
    ? COUNTRIES.filter(c => c.name.toLowerCase().includes(filter.trim().toLowerCase()) || c.dial.includes(filter.trim().replace(/^\+/, '')))
    : COUNTRIES;

  function place() {
    const bounds = trigger.current!.getBoundingClientRect();
    const width = Math.min(Math.max(bounds.width, 280), window.innerWidth - 32);
    const spaceBelow = window.innerHeight - bounds.bottom - 24;
    const height = Math.min(340, Math.max(spaceBelow, bounds.top - 24));
    setPosition({
      left: Math.max(16, Math.min(bounds.left, window.innerWidth - width - 16)),
      top: spaceBelow >= Math.min(300, height) ? bounds.bottom + 10 : Math.max(16, bounds.top - Math.min(340, height) - 10),
      width,
      maxHeight: height,
    });
  }
  function show() {
    // A modal <dialog> sits in the top layer, so a popup portaled to <body> would render behind it.
    setHost(trigger.current?.closest('dialog') ?? document.body);
    place();
    setFilter('');
    setActive(0);
    setOpen(true);
  }
  function choose(picked: Country) {
    setCountry(picked);
    setOpen(false);
    trigger.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    search.current?.focus();
    const outside = (event: PointerEvent) => {
      if (!popup.current?.contains(event.target as Node) && !trigger.current?.contains(event.target as Node)) setOpen(false);
    };
    const reposition = () => setOpen(false);
    const scroll = (event: Event) => {
      if (popup.current?.contains(event.target as Node)) return;
      const bounds = trigger.current?.getBoundingClientRect();
      if (bounds && (bounds.bottom < 0 || bounds.top > window.innerHeight)) setOpen(false);
      else place();
    };
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', scroll, true);
    return () => {
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', scroll, true);
    };
  }, [open]);

  useEffect(() => {
    if (open) document.getElementById(`${id}-option-${active}`)?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }, [active, open, id]);

  useEffect(() => setActive(0), [filter]);

  function keyboard(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      trigger.current?.focus();
      return;
    }
    if (event.key === 'Tab') {
      setOpen(false);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (results.length) setActive(index => (index + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (results[active]) choose(results[active]);
    }
  }

  return (
    <label className="phone-field" htmlFor={`${id}-number`}>
      <span>
        {label} {optionalHint && <small>(optional)</small>}
      </span>
      <div className="phone-input-row">
        <button
          ref={trigger}
          type="button"
          className="phone-cc-trigger"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? `${id}-list` : undefined}
          aria-label="Country code"
          onClick={() => (open ? setOpen(false) : show())}
          onKeyDown={event => {
            if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
              event.preventDefault();
              show();
            }
          }}
        >
          {country ? <><Flag iso2={country.iso2} /><span>+{country.dial}</span></> : <span>Code</span>}
          <span className={`select-chevron ${open ? 'up' : ''}`} aria-hidden="true" />
        </button>
        <input
          id={`${id}-number`}
          name={name}
          type="tel"
          required={required}
          minLength={6}
          maxLength={25}
          autoComplete="tel"
          inputMode="tel"
          pattern="[0-9\s\-\(\)\+]{6,25}"
          title="Please enter a valid phone number (6 to 15 digits)"
          placeholder="98…"
        />
        <input type="hidden" name={`${name}_dial_code`} value={country ? `+${country.dial}` : ''} />
      </div>
      {open &&
        host &&
        createPortal(
          <div ref={popup} className="phone-cc-panel" style={position}>
            <input
              ref={search}
              type="text"
              className="phone-cc-search"
              placeholder="Search country or code…"
              value={filter}
              onChange={event => setFilter(event.target.value)}
              onKeyDown={keyboard}
              role="combobox"
              aria-expanded="true"
              aria-controls={`${id}-list`}
              aria-activedescendant={results[active] ? `${id}-option-${active}` : undefined}
            />
            <div id={`${id}-list`} role="listbox" aria-label="Countries" className="phone-cc-list">
              {results.length === 0 && <div className="phone-cc-empty">No matches</div>}
              {results.map((c, index) => (
                <div
                  key={c.iso2}
                  id={`${id}-option-${index}`}
                  role="option"
                  aria-selected={country?.iso2 === c.iso2}
                  className={`phone-cc-option ${active === index ? 'focused' : ''}`}
                  onPointerMove={() => setActive(index)}
                  onPointerDown={event => event.preventDefault()}
                  onClick={() => choose(c)}
                >
                  <Flag iso2={c.iso2} />
                  <span>{c.name}</span>
                  <small>+{c.dial}</small>
                </div>
              ))}
            </div>
          </div>,
          host,
        )}
    </label>
  );
}
