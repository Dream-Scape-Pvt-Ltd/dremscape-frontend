'use client';

import {FormEvent, RefObject, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import styles from '@/app/admin/admin.module.css';

type Api = <T>(path: string, options?: RequestInit) => Promise<T>;

interface MonthRow {
  month: string;
  label: string;
  full_label: string;
  completed_revenue: number;
  manual_revenue: number;
  revenue: number;
  completed_trips: number;
  new_bookings: number;
}

interface RevenueSummary {
  months: number;
  totals: {
    all_time: number;
    completed_total: number;
    manual_total: number;
    this_month: number;
    last_month: number;
    mom_growth_percent: number | null;
    completed_trips: number;
    travelers_completed: number;
    avg_trip_value: number;
    window_total: number;
  };
  monthly: MonthRow[];
  by_destination: {name: string; revenue: number; share_percent: number}[];
  by_trek: {title: string; slug: string; revenue: number; completed_trips: number; travelers: number}[];
  recent: {source: 'TREK_COMPLETED' | 'MANUAL'; date: string; label: string; detail: string; amount: number; reference: string}[];
}

interface RevenueEntry {
  id: string;
  amount_usd: string;
  earned_on: string;
  description: string;
  trip_id: string | null;
  trip_title: string | null;
  created_by_name: string | null;
}

// Validated categorical order (dataviz validate_palette: all checks pass on white).
const COLOR = {completed: '#0e7a50', manual: '#d97706', bookings: '#2f6fc0'};

const usd = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0});
const money = (value: number) => usd.format(Math.round(value || 0));
function compactMoney(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(value % 1_000_000 ? 1 : 0)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(value % 1_000 ? 1 : 0)}k`;
  return `$${Math.round(value)}`;
}
function shortDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', {month: 'short', day: 'numeric', year: 'numeric'}).format(new Date(`${iso}T00:00:00`));
}

/** A rounded axis maximum and its evenly spaced ticks (0, 5k, 10k …). */
function niceScale(max: number, ticks = 4) {
  if (max <= 0) return {top: ticks, step: 1};
  const rough = max / ticks;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map(m => m * magnitude).find(s => s >= rough) || rough;
  return {top: step * ticks, step};
}

/** Bar whose top corners are rounded and whose base sits square on the axis. */
function topRoundedBar(x: number, y: number, w: number, h: number, r = 4) {
  const radius = Math.min(r, h, w / 2);
  return `M${x},${y + h}V${y + radius}Q${x},${y} ${x + radius},${y}H${x + w - radius}Q${x + w},${y} ${x + w},${y + radius}V${y + h}Z`;
}

const H = 250;
const PAD = {top: 22, right: 12, bottom: 30, left: 54};
const PLOT_H = H - PAD.top - PAD.bottom;

/** Tooltip centre as a % of the chart width, kept clear of the card edges. */
const tooltipLeft = (x: number, width: number) => `${Math.min(84, Math.max(16, (x / width) * 100))}%`;

/**
 * Draw charts at their real pixel width rather than scaling one fixed drawing,
 * so axis text stays readable on a phone.
 */
function useChartWidth(ref: RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState(640);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const update = () => setWidth(Math.max(280, Math.round(node.getBoundingClientRect().width)));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

/** Thin out month labels when columns get narrow (e.g. 12 months on a phone). */
const showLabel = (index: number, count: number, band: number) => band >= 34 || (count - 1 - index) % 2 === 0;

function RevenueTrendChart({rows}: {rows: MonthRow[]}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const W = useChartWidth(wrapRef);
  const PLOT_W = W - PAD.left - PAD.right;
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...rows.map(r => r.revenue), 0);
  const {top, step} = niceScale(max);
  const band = PLOT_W / rows.length;
  const barW = Math.min(34, band * 0.56);
  const yFor = (value: number) => PAD.top + PLOT_H - (value / top) * PLOT_H;
  const ticks = Array.from({length: 5}, (_, i) => i * step);
  const current = rows.length - 1;
  const shown = active ?? null;

  return (
    <div className={styles.chartWrap} ref={wrapRef} onMouseLeave={() => setActive(null)}>
      <svg
        className={styles.trendSvg}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Revenue by month, ${rows[0]?.full_label} to ${rows[current]?.full_label}. Total ${money(rows.reduce((sum, r) => sum + r.revenue, 0))}.`}
      >
        {ticks.map(tick => (
          <g key={tick}>
            <line x1={PAD.left} x2={W - PAD.right} y1={yFor(tick)} y2={yFor(tick)} className={tick === 0 ? styles.chartBaseline : styles.chartGridLine} />
            <text x={PAD.left - 8} y={yFor(tick) + 4} className={styles.chartTickText} textAnchor="end">{max > 0 ? compactMoney(tick) : tick === 0 ? '$0' : ''}</text>
          </g>
        ))}
        {rows.map((row, i) => {
          const cx = PAD.left + band * i + band / 2;
          const x = cx - barW / 2;
          const completedH = (row.completed_revenue / top) * PLOT_H;
          const manualH = (row.manual_revenue / top) * PLOT_H;
          const gap = completedH > 0 && manualH > 0 ? 2 : 0;
          const base = PAD.top + PLOT_H;
          return (
            <g key={row.month}>
              {shown === i && <rect x={PAD.left + band * i + 2} y={PAD.top} width={band - 4} height={PLOT_H} rx={6} className={styles.chartHoverBand} />}
              {completedH > 0 && (
                manualH > 0
                  ? <rect x={x} y={base - completedH} width={barW} height={completedH} fill={COLOR.completed} />
                  : <path d={topRoundedBar(x, base - completedH, barW, completedH)} fill={COLOR.completed} />
              )}
              {manualH > 0 && <path d={topRoundedBar(x, base - completedH - gap - manualH, barW, manualH)} fill={COLOR.manual} />}
              {i === current && row.revenue > 0 && (
                <text x={cx} y={yFor(row.revenue) - 7} className={styles.chartValueText}>{compactMoney(row.revenue)}</text>
              )}
              {showLabel(i, rows.length, band) && <text x={cx} y={H - 9} className={`${styles.chartAxisText} ${i === current ? styles.chartAxisCurrent : ''}`}>{row.label}</text>}
              {/* Hit target: the whole month column, larger than the bar. */}
              <rect
                x={PAD.left + band * i}
                y={PAD.top}
                width={band}
                height={PLOT_H + PAD.bottom}
                fill="transparent"
                tabIndex={0}
                aria-label={`${row.full_label}: ${money(row.revenue)}`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              />
            </g>
          );
        })}
        {max === 0 && (
          <text x={PAD.left + PLOT_W / 2} y={PAD.top + PLOT_H * 0.375 + 4} className={styles.chartEmptyText}>No completed treks in this period yet</text>
        )}
      </svg>
      {shown !== null && rows[shown] && (
        <div
          className={styles.chartTooltip}
          style={{left: tooltipLeft(PAD.left + band * shown + band / 2, W)}}
          role="status"
        >
          <strong>{rows[shown].full_label}</strong>
          <span className={styles.tooltipTotal}>{money(rows[shown].revenue)}</span>
          <span><i style={{background: COLOR.completed}} />Completed treks {money(rows[shown].completed_revenue)}</span>
          <span><i style={{background: COLOR.manual}} />Added manually {money(rows[shown].manual_revenue)}</span>
          <small>{rows[shown].completed_trips} trip{rows[shown].completed_trips === 1 ? '' : 's'} completed · {rows[shown].new_bookings} new booking{rows[shown].new_bookings === 1 ? '' : 's'}</small>
        </div>
      )}
    </div>
  );
}

function ActivityChart({rows}: {rows: MonthRow[]}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const W = useChartWidth(wrapRef);
  const PLOT_W = W - PAD.left - PAD.right;
  const [active, setActive] = useState<number | null>(null);
  const height = 170;
  const plotH = height - PAD.top - PAD.bottom;
  const max = Math.max(...rows.flatMap(r => [r.new_bookings, r.completed_trips]), 0);
  // Whole-number ticks: counts of bookings and trips.
  const step = Math.max(1, Math.ceil(max / 2));
  const top = step * 2;
  const band = PLOT_W / rows.length;
  const barW = Math.min(14, band * 0.26);
  const yFor = (value: number) => PAD.top + plotH - (value / top) * plotH;
  const base = PAD.top + plotH;

  return (
    <div className={styles.chartWrap} ref={wrapRef} onMouseLeave={() => setActive(null)}>
      <svg
        className={styles.activitySvg}
        viewBox={`0 0 ${W} ${height}`}
        role="img"
        aria-label={`New bookings and completed trips by month: ${rows.reduce((s, r) => s + r.new_bookings, 0)} bookings, ${rows.reduce((s, r) => s + r.completed_trips, 0)} completed trips.`}
      >
        {[0, step, step * 2].map(tick => (
          <g key={tick}>
            <line x1={PAD.left} x2={W - PAD.right} y1={yFor(tick)} y2={yFor(tick)} className={tick === 0 ? styles.chartBaseline : styles.chartGridLine} />
            <text x={PAD.left - 8} y={yFor(tick) + 4} className={styles.chartTickText} textAnchor="end">{tick}</text>
          </g>
        ))}
        {rows.map((row, i) => {
          const cx = PAD.left + band * i + band / 2;
          const bookingsH = (row.new_bookings / top) * plotH;
          const tripsH = (row.completed_trips / top) * plotH;
          return (
            <g key={row.month}>
              {active === i && <rect x={PAD.left + band * i + 2} y={PAD.top} width={band - 4} height={plotH} rx={6} className={styles.chartHoverBand} />}
              {bookingsH > 0 && <path d={topRoundedBar(cx - barW - 1, base - bookingsH, barW, bookingsH, 3)} fill={COLOR.bookings} />}
              {tripsH > 0 && <path d={topRoundedBar(cx + 1, base - tripsH, barW, tripsH, 3)} fill={COLOR.completed} />}
              {showLabel(i, rows.length, band) && <text x={cx} y={height - 9} className={styles.chartAxisText}>{row.label}</text>}
              <rect
                x={PAD.left + band * i}
                y={PAD.top}
                width={band}
                height={plotH + PAD.bottom}
                fill="transparent"
                tabIndex={0}
                aria-label={`${row.full_label}: ${row.new_bookings} new bookings, ${row.completed_trips} completed trips`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              />
            </g>
          );
        })}
      </svg>
      {active !== null && rows[active] && (
        <div className={styles.chartTooltip} style={{left: tooltipLeft(PAD.left + band * active + band / 2, W)}} role="status">
          <strong>{rows[active].full_label}</strong>
          <span><i style={{background: COLOR.bookings}} />New bookings {rows[active].new_bookings}</span>
          <span><i style={{background: COLOR.completed}} />Completed trips {rows[active].completed_trips}</span>
        </div>
      )}
    </div>
  );
}

function ManualRevenuePanel({
  api, isAdmin, treks, onChanged,
}: {
  api: Api;
  isAdmin: boolean;
  treks: {id: string; title: string}[];
  onChanged: () => void;
}) {
  const [entries, setEntries] = useState<RevenueEntry[]>([]);
  const [form, setForm] = useState({amount_usd: '', earned_on: '', description: '', trip_id: ''});
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    try {
      const page = await api<{results: RevenueEntry[]}>('/api/admin/crm/revenue-entries');
      setEntries(page.results);
    } catch (error) {
      setNote(error instanceof Error ? error.message : 'Unable to load manual revenue.');
    }
  }, [api]);
  useEffect(() => { void load(); }, [load]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setNote('');
    try {
      await api('/api/admin/crm/revenue-entries', {
        method: 'POST',
        body: JSON.stringify({...form, amount_usd: Number(form.amount_usd), trip_id: form.trip_id || null}),
      });
      setForm({amount_usd: '', earned_on: '', description: '', trip_id: ''});
      setNote('Revenue added.');
      await load();
      onChanged();
    } catch (error) {
      setNote(error instanceof Error ? error.message : 'Unable to add revenue.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(entry: RevenueEntry) {
    if (!window.confirm(`Remove ${money(Number(entry.amount_usd))} — “${entry.description}”?`)) return;
    try {
      await api(`/api/admin/crm/revenue-entries/${entry.id}`, {method: 'DELETE'});
      await load();
      onChanged();
    } catch (error) {
      setNote(error instanceof Error ? error.message : 'Unable to remove this entry.');
    }
  }

  return (
    <section className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div>
          <h2 className={styles.chartTitle}>Manual revenue</h2>
          <p className={styles.chartSubtitle}>Income that doesn’t come from a completed CRM trek.</p>
        </div>
      </div>
      {isAdmin && (
        <form className={styles.manualRevenueForm} onSubmit={submit}>
          <label>Amount (USD)
            <input type="number" min="0.01" step="0.01" required value={form.amount_usd} onChange={e => setForm({...form, amount_usd: e.target.value})} placeholder="500" />
          </label>
          <label>Date earned
            <input type="date" value={form.earned_on} onChange={e => setForm({...form, earned_on: e.target.value})} />
          </label>
          <label className={styles.manualRevenueWide}>Description
            <input type="text" required maxLength={255} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="e.g. Private jeep safari for the Walker group" />
          </label>
          <label className={styles.manualRevenueWide}>Trek (optional)
            <select value={form.trip_id} onChange={e => setForm({...form, trip_id: e.target.value})}>
              <option value="">Not tied to a trek</option>
              {treks.map(trek => <option key={trek.id} value={trek.id}>{trek.title}</option>)}
            </select>
          </label>
          <button className={styles.primary} disabled={saving || !form.amount_usd || !form.description.trim()}>{saving ? 'Saving…' : 'Add revenue'}</button>
        </form>
      )}
      {note && <p className={styles.revenueNote} role="status">{note}</p>}
      <ul className={styles.revenueEntryList}>
        {entries.length === 0 && <li className={styles.revenueEmpty}>No manual revenue recorded.</li>}
        {entries.map(entry => (
          <li key={entry.id}>
            <div>
              <strong>{entry.description}</strong>
              <small>{shortDate(entry.earned_on)}{entry.trip_title ? ` · ${entry.trip_title}` : ''}{entry.created_by_name ? ` · by ${entry.created_by_name}` : ''}</small>
            </div>
            <span className={styles.revenueEntryAmount}>{money(Number(entry.amount_usd))}</span>
            {isAdmin && <button type="button" className={styles.revenueEntryRemove} onClick={() => void remove(entry)} aria-label={`Remove ${entry.description}`}>×</button>}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function RevenueView({api, isAdmin, treks}: {api: Api; isAdmin: boolean; treks: {id: string; title: string}[]}) {
  const [months, setMonths] = useState<6 | 12>(6);
  const [data, setData] = useState<RevenueSummary | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await api<RevenueSummary>(`/api/admin/crm/revenue?months=${months}`));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load revenue.');
    } finally {
      setLoading(false);
    }
  }, [api, months]);
  useEffect(() => { void load(); }, [load]);

  const totals = data?.totals;
  const growth = totals?.mom_growth_percent;
  const windowBookings = useMemo(() => data?.monthly.reduce((sum, row) => sum + row.new_bookings, 0) ?? 0, [data]);

  if (!data && loading) return <div className={styles.revenueContainer}><p className={styles.revenueEmpty} role="status">Loading revenue…</p></div>;
  if (!data) return (
    <div className={styles.revenueContainer}>
      <div className={styles.revenueError} role="alert">{error || 'Unable to load revenue.'} <button type="button" className={styles.secondary} onClick={() => void load()}>Try again</button></div>
    </div>
  );

  return (
    <div className={styles.revenueContainer}>
      <p className={styles.revenueExplainer}>
        Revenue is counted when a trek is <strong>completed</strong> (departure price × travellers, automatically from the CRM), plus revenue you add manually. Deposits and upcoming bookings are not included until the trip is done.
      </p>

      <div className={styles.revenueOverviewGrid}>
        <div className={`${styles.revenueCard} ${styles.revenueCardDark}`}>
          <div className={styles.revenueCardTitle}>REVENUE THIS MONTH</div>
          <div className={styles.revenueCardAmount}>{money(totals!.this_month)}</div>
          <div className={styles.revenueCardNote}>
            {growth === null || growth === undefined
              ? (totals!.last_month > 0 ? '—' : 'No revenue last month to compare')
              : `${growth > 0 ? '▲ +' : growth < 0 ? '▼ ' : ''}${growth}% vs last month`}
          </div>
        </div>
        <div className={styles.revenueCard}>
          <div className={styles.revenueCardTitle}>ALL-TIME REVENUE</div>
          <div className={styles.revenueCardAmount}>{money(totals!.all_time)}</div>
          <div className={styles.revenueCardNote}>{money(totals!.completed_total)} from treks · {money(totals!.manual_total)} manual</div>
        </div>
        <div className={styles.revenueCard}>
          <div className={styles.revenueCardTitle}>COMPLETED TRIPS</div>
          <div className={styles.revenueCardAmount}>{totals!.completed_trips}</div>
          <div className={styles.revenueCardNote}>{totals!.travelers_completed} traveller{totals!.travelers_completed === 1 ? '' : 's'} brought home</div>
        </div>
        <div className={styles.revenueCard}>
          <div className={styles.revenueCardTitle}>AVERAGE TRIP VALUE</div>
          <div className={styles.revenueCardAmount}>{totals!.completed_trips ? money(totals!.avg_trip_value) : '—'}</div>
          <div className={styles.revenueCardNote}>Per completed CRM trip</div>
        </div>
      </div>

      <div className={styles.revenueMainGrid}>
        <section className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.chartTitle}>Revenue by month</h2>
              <p className={styles.chartSubtitle}>{money(totals!.window_total)} in the last {months} months</p>
            </div>
            <div className={styles.segmented} role="group" aria-label="Time range">
              {([6, 12] as const).map(value => (
                <button key={value} type="button" aria-pressed={months === value} className={months === value ? styles.segmentedActive : ''} onClick={() => setMonths(value)}>
                  {value} months
                </button>
              ))}
            </div>
          </div>
          <div className={styles.chartLegend} style={{marginBottom: 6}}>
            <span className={styles.legendItem}><span className={styles.legendSwatch} style={{background: COLOR.completed}} />Completed treks</span>
            <span className={styles.legendItem}><span className={styles.legendSwatch} style={{background: COLOR.manual}} />Added manually</span>
          </div>
          <RevenueTrendChart rows={data.monthly} />

          <div className={styles.activityHeader}>
            <h3>Bookings &amp; completed trips</h3>
            <div className={styles.chartLegend}>
              <span className={styles.legendItem}><span className={styles.legendSwatch} style={{background: COLOR.bookings}} />New bookings ({windowBookings})</span>
              <span className={styles.legendItem}><span className={styles.legendSwatch} style={{background: COLOR.completed}} />Completed trips</span>
            </div>
          </div>
          <ActivityChart rows={data.monthly} />

          <table className="sr-only">
            <caption>Revenue, bookings and completed trips by month</caption>
            <thead><tr><th>Month</th><th>Completed treks</th><th>Manual</th><th>Total</th><th>Trips completed</th><th>New bookings</th></tr></thead>
            <tbody>{data.monthly.map(row => <tr key={row.month}><td>{row.full_label}</td><td>{money(row.completed_revenue)}</td><td>{money(row.manual_revenue)}</td><td>{money(row.revenue)}</td><td>{row.completed_trips}</td><td>{row.new_bookings}</td></tr>)}</tbody>
          </table>
        </section>

        <div className={styles.revenueSideColumn}>
          <section className={styles.destBreakdownCard}>
            <h2 className={styles.chartTitle}>Revenue by destination</h2>
            <p className={styles.chartSubtitle}>All time, completed treks and manual revenue.</p>
            <div className={styles.breakdownList}>
              {data.by_destination.length === 0 && <p className={styles.revenueEmpty}>No completed treks yet.</p>}
              {data.by_destination.map(row => (
                <div className={styles.breakdownItem} key={row.name}>
                  <div className={styles.breakdownItemHead}>
                    <span>{row.name}</span>
                    <span className={styles.breakdownItemVal}>{money(row.revenue)} · {row.share_percent}%</span>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div className={styles.progressBarFill} style={{width: `${row.share_percent}%`, background: COLOR.completed}} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.destBreakdownCard}>
            <h2 className={styles.chartTitle}>Top treks</h2>
            <ol className={styles.topTrekList}>
              {data.by_trek.length === 0 && <li className={styles.revenueEmpty}>Complete a trek in the CRM to see it here.</li>}
              {data.by_trek.map(trek => (
                <li key={trek.slug}>
                  <div>
                    <strong>{trek.title}</strong>
                    <small>{trek.completed_trips} trip{trek.completed_trips === 1 ? '' : 's'} · {trek.travelers} traveller{trek.travelers === 1 ? '' : 's'}</small>
                  </div>
                  <span>{money(trek.revenue)}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      <div className={styles.revenueMainGrid}>
        <section className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Recent revenue</h2>
          <ul className={styles.revenueEventList}>
            {data.recent.length === 0 && <li className={styles.revenueEmpty}>Nothing yet. Revenue appears here when a trek is completed or added manually.</li>}
            {data.recent.map(event => (
              <li key={`${event.source}-${event.reference}`}>
                <span className={styles.revenueEventBadge} data-source={event.source}>{event.source === 'MANUAL' ? 'Manual' : 'Trek completed'}</span>
                <div>
                  <strong>{event.label}</strong>
                  <small>{shortDate(event.date)} · {event.detail}{event.source === 'TREK_COMPLETED' ? ` · ${event.reference}` : ''}</small>
                </div>
                <span className={styles.revenueEntryAmount}>+{money(event.amount)}</span>
              </li>
            ))}
          </ul>
        </section>
        <ManualRevenuePanel api={api} isAdmin={isAdmin} treks={treks} onChanged={() => void load()} />
      </div>
    </div>
  );
}
