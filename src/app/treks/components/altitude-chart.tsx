'use client';
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import type { ItineraryDay } from '@/lib/journeys';

type Point = { day: number; elevation: number; title: string; stay: string; acclimatization: boolean };

const HEIGHT = 280;
const PAD = { top: 34, right: 18, bottom: 34, left: 58 };

/** Itinerary days that carry an elevation, in day order. */
export function altitudePoints(days: ItineraryDay[]): Point[] {
  return days
    .filter(day => typeof day.elevation_meters === 'number' && day.elevation_meters > 0)
    .sort((a, b) => a.day_number - b.day_number)
    .map(day => ({
      day: day.day_number,
      elevation: day.elevation_meters as number,
      title: day.title,
      stay: day.overnight_stay,
      acclimatization: day.is_acclimatization_day,
    }));
}

const metres = (value: number) => `${value.toLocaleString('en-US')} m`;

/** Clean 1,000 m ticks spanning the data, with a little headroom. */
function yTicks(min: number, max: number) {
  const step = max - min > 4000 ? 1000 : 500;
  const low = Math.max(0, Math.floor(min / step) * step);
  const high = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = low; v <= high; v += step) ticks.push(v);
  return ticks;
}

/**
 * Day-by-day altitude profile for a trek: one line over a light wash, the high
 * point labelled, a crosshair readout on hover or arrow keys, and the same
 * numbers in a table for anyone who cannot use the chart.
 */
export default function AltitudeChart({ points }: { points: Point[] }) {
  const frame = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const node = frame.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.round(entry.contentRect.width))));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const ticks = yTicks(Math.min(...points.map(p => p.elevation)), Math.max(...points.map(p => p.elevation)));
  const yMin = ticks[0];
  const yMax = ticks[ticks.length - 1];
  const firstDay = points[0].day;
  const lastDay = points[points.length - 1].day;
  const plotW = width - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const x = (day: number) => PAD.left + (lastDay === firstDay ? plotW / 2 : ((day - firstDay) / (lastDay - firstDay)) * plotW);
  const y = (elevation: number) => PAD.top + (1 - (elevation - yMin) / (yMax - yMin || 1)) * plotH;

  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(p.day).toFixed(1)},${y(p.elevation).toFixed(1)}`).join(' ');
  const area = `${line} L${x(lastDay).toFixed(1)},${PAD.top + plotH} L${x(firstDay).toFixed(1)},${PAD.top + plotH} Z`;
  const peakIndex = points.reduce((best, p, i) => (p.elevation > points[best].elevation ? i : best), 0);
  const peak = points[peakIndex];
  // Day labels thin out on narrow screens so they never collide.
  const labelEvery = Math.max(1, Math.ceil(points.length / Math.max(2, Math.floor(plotW / 44))));
  const current = active === null ? null : points[active];

  function nearest(event: PointerEvent<SVGRectElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - box.left + PAD.left;
    let best = 0;
    points.forEach((p, i) => { if (Math.abs(x(p.day) - px) < Math.abs(x(points[best].day) - px)) best = i; });
    setActive(best);
  }

  function onKey(event: KeyboardEvent<SVGSVGElement>) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const step = event.key === 'ArrowRight' ? 1 : -1;
      setActive(value => Math.min(points.length - 1, Math.max(0, (value ?? (step > 0 ? -1 : points.length)) + step)));
    } else if (event.key === 'Escape') {
      setActive(null);
    }
  }

  const tipLeft = current ? Math.min(Math.max(x(current.day), 110), width - 110) : 0;

  return (
    <div className="altitude-chart">
      <div className="altitude-frame" ref={frame}>
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label={`Altitude profile: from ${metres(points[0].elevation)} on day ${firstDay} to a high point of ${metres(peak.elevation)} on day ${peak.day}. Use the arrow keys to step through the days.`}
          tabIndex={0}
          onKeyDown={onKey}
          onBlur={() => setActive(null)}
        >
          {ticks.map(tick => (
            <g key={tick}>
              <line className="altitude-grid" x1={PAD.left} x2={width - PAD.right} y1={y(tick)} y2={y(tick)} />
              <text className="altitude-axis" x={PAD.left - 10} y={y(tick)} dy="0.32em" textAnchor="end">{tick.toLocaleString('en-US')}</text>
            </g>
          ))}
          <text className="altitude-axis" x={PAD.left - 10} y={PAD.top - 16} textAnchor="end">m</text>
          {points.map((p, i) => (i === points.length - 1 || (i % labelEvery === 0 && points.length - 1 - i >= labelEvery)) && (
            <text key={p.day} className="altitude-axis" x={x(p.day)} y={HEIGHT - 10} textAnchor="middle">Day {p.day}</text>
          ))}

          <path className="altitude-area" d={area} />
          <path className="altitude-line" d={line} />

          <circle className="altitude-dot" cx={x(peak.day)} cy={y(peak.elevation)} r={5} />
          <text
            className="altitude-peak-label"
            x={x(peak.day)}
            y={y(peak.elevation) - 13}
            textAnchor={x(peak.day) > width - 90 ? 'end' : x(peak.day) < PAD.left + 60 ? 'start' : 'middle'}
          >
            {metres(peak.elevation)}
          </text>

          {current && (
            <g aria-hidden="true">
              <line className="altitude-crosshair" x1={x(current.day)} x2={x(current.day)} y1={PAD.top} y2={PAD.top + plotH} />
              <circle className="altitude-dot" cx={x(current.day)} cy={y(current.elevation)} r={5} />
            </g>
          )}

          <rect
            className="altitude-hit"
            x={PAD.left}
            y={0}
            width={plotW}
            height={HEIGHT}
            onPointerMove={nearest}
            onPointerDown={nearest}
            onPointerLeave={() => setActive(null)}
          />
        </svg>
        {current && (
          <div className="altitude-tooltip" style={{ left: tipLeft, top: Math.max(8, y(current.elevation) - 92) }} aria-live="polite">
            <strong>{metres(current.elevation)}</strong>
            <span>Day {current.day}{current.acclimatization ? ' · Acclimatization' : ''}</span>
            <small>{current.stay || current.title}</small>
          </div>
        )}
      </div>

      <details className="altitude-table">
        <summary>View as table</summary>
        <table>
          <thead>
            <tr><th scope="col">Day</th><th scope="col">Overnight</th><th scope="col">Altitude</th></tr>
          </thead>
          <tbody>
            {points.map(p => (
              <tr key={p.day}>
                <td>{p.day}</td>
                <td>{p.stay || p.title}</td>
                <td>{metres(p.elevation)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
