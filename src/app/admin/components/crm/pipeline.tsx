'use client';

import {useState} from 'react';
import type {FunnelData, Inquiry, InquiryStatus, LostReason, PipelineSummary, TrekPipeline, TrekPipelineRow} from '@/types/inquiry';
import {date, formatCurrency, label} from '../admin-utils';
import {holdsSeats, interestLabel, lostReasonOptions, statuses, type BookingChoice} from './crm-utils';
import {BookingPrompt} from './inquiry-drawer';
import styles from '@/app/admin/admin.module.css';

/** The CRM's landing page: every active trek, with its leads by stage and what it has earned. */
export function CrmTrekList({pipeline, summary, loading, onOpen}: {
  pipeline: TrekPipeline | null;
  summary: PipelineSummary | null;
  loading: boolean;
  onOpen: (slug: string) => void;
}) {
  const rows = pipeline?.results ?? [];
  const openLeads = (row: TrekPipelineRow) => row.by_status.NEW + row.by_status.IN_CONTACT;

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div>
          <p style={{fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.4px', color: '#74897d', fontWeight: 800, margin: '0 0 4px'}}>Sales & Leads</p>
          <h2>CRM · Active Treks</h2>
        </div>
        <button type="button" className={styles.secondary} onClick={() => onOpen('ALL')}>All leads →</button>
      </div>

      <div className={styles.pipelineStats}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Active treks</span>
          <strong className={styles.statValue}>{pipeline ? rows.length : '—'}</strong>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Completed trek revenue</span>
          <strong className={styles.statValue}>{pipeline ? formatCurrency(Number(pipeline.total_revenue_usd) || 0) : '—'}</strong>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>SLA breaches</span>
          <strong className={styles.statValue}>{summary?.sla_breached_count ?? '—'}</strong>
        </div>
      </div>

      {loading && !pipeline ? (
        <p className={styles.empty}>Loading treks…</p>
      ) : rows.length === 0 ? (
        <p className={styles.empty}>No active treks yet.</p>
      ) : (
        <div className={styles.crmTrekGrid}>
          {rows.map(row => (
            <button key={row.slug} type="button" className={styles.crmTrekCard} onClick={() => onOpen(row.slug)}>
              <strong>{row.title}</strong>
              <small>{row.destination_name || '—'} · {row.total_leads} lead{row.total_leads === 1 ? '' : 's'}</small>
              <div className={styles.crmTrekCounts}>
                <span><b>{openLeads(row)}</b>Open</span>
                <span><b>{row.by_status.BOOKED}</b>Booked</span>
                <span><b>{row.by_status.TRAVELING}</b>Traveling</span>
                <span><b>{row.by_status.COMPLETED}</b>Completed</span>
              </div>
              <div className={styles.crmTrekRevenue}>
                <span>{row.travelers_completed} travelled</span>
                <strong>{formatCurrency(Number(row.revenue_usd) || 0)}</strong>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export function PipelineView({summary, funnel, trek, inquiries, loading, onBack, onOpen, onStatusChange}: {
  summary: PipelineSummary | null;
  funnel: FunnelData | null;
  /** The trek this board is scoped to; null for the all-leads board. */
  trek: TrekPipelineRow | null;
  inquiries: Inquiry[];
  loading: boolean;
  onBack: () => void;
  onOpen: (reference: string) => void;
  onStatusChange: (inquiry: Inquiry, next: InquiryStatus, lostReason?: LostReason | '', booking?: BookingChoice) => void;
}) {
  const columns = statuses.map(value => ({
    value,
    items: inquiries.filter(item => item.status === value),
  }));

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div>
          <button type="button" className={styles.crmBackBtn} onClick={onBack}>← Active treks</button>
          <h2>{trek ? trek.title : 'All leads'}</h2>
        </div>
      </div>

      <div className={styles.pipelineStats}>
        {trek ? (
          <>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Leads</span>
              <strong className={styles.statValue}>{trek.total_leads}</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Booked</span>
              <strong className={styles.statValue}>{trek.by_status.BOOKED}</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Traveling now</span>
              <strong className={styles.statValue}>{trek.by_status.TRAVELING}</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>People travelled</span>
              <strong className={styles.statValue}>{trek.travelers_completed}</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Trek revenue</span>
              <strong className={styles.statValue}>{formatCurrency(Number(trek.revenue_usd) || 0)}</strong>
            </div>
          </>
        ) : (
          <>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Total leads</span>
              <strong className={styles.statValue}>{funnel?.total_leads ?? '—'}</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Conversion rate</span>
              <strong className={styles.statValue}>{funnel ? `${funnel.conversion_rate_percent}%` : '—'}</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Avg days to close</span>
              <strong className={styles.statValue}>{funnel?.avg_days_to_close ?? '—'}</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>SLA breaches</span>
              <strong className={styles.statValue}>{summary?.sla_breached_count ?? '—'}</strong>
            </div>
          </>
        )}
      </div>

      {loading ? (
        <p className={styles.empty}>Loading pipeline…</p>
      ) : (
        <div className={styles.kanbanBoard}>
          {columns.map(column => (
            <div key={column.value} className={styles.kanbanColumn}>
              <div className={styles.kanbanColumnHead}>
                <h4>{label(column.value)}</h4>
                <span className={styles.kanbanColumnCount}>{column.items.length}</span>
              </div>
              <div className={styles.kanbanCards}>
                {column.items.map(item => (
                  <KanbanCard key={item.inquiry_number} inquiry={item} onOpen={onOpen} onStatusChange={onStatusChange} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function KanbanCard({inquiry, onOpen, onStatusChange}: {
  inquiry: Inquiry;
  onOpen: (reference: string) => void;
  onStatusChange: (inquiry: Inquiry, next: InquiryStatus, lostReason?: LostReason | '', booking?: BookingChoice) => void;
}) {
  const [pendingStatus, setPendingStatus] = useState<InquiryStatus | null>(null);
  const [lostReason, setLostReason] = useState<LostReason | ''>('');

  function handleChange(next: InquiryStatus) {
    if (next === 'CLOSED' && !inquiry.converted_booking_reference) {
      setPendingStatus(next);
      setLostReason('');
      return;
    }
    // Moving into Booked puts people on a departure, so ask which one first.
    if (holdsSeats(next) && !holdsSeats(inquiry.status)) {
      setPendingStatus(next);
      return;
    }
    onStatusChange(inquiry, next);
  }

  return (
    <div className={styles.kanbanCard}>
      <div onClick={() => onOpen(inquiry.inquiry_number)} role="button" tabIndex={0}>
        <strong>{inquiry.full_name}</strong>
        <small>{inquiry.trip_title || inquiry.journey || interestLabel(inquiry)}</small>
        {inquiry.departure_label && <small>{inquiry.departure_label}</small>}
        {holdsSeats(inquiry.status) && inquiry.travelers_count ? (
          <small>
            {inquiry.travelers_count} traveller{inquiry.travelers_count === 1 ? '' : 's'}
            {inquiry.revenue_usd ? ` · ${formatCurrency(Number(inquiry.revenue_usd))}` : ''}
          </small>
        ) : null}
      </div>
      <div className={styles.kanbanCardMeta}>
        <span>{inquiry.sla_breached && <span className={styles.slaDot} title="SLA breached" />}{date(inquiry.created_at)}</span>
        <select value={inquiry.status} onClick={event => event.stopPropagation()} onChange={event => handleChange(event.target.value as InquiryStatus)}>
          {statuses.map(value => <option key={value} value={value}>{value}</option>)}
        </select>
      </div>
      {pendingStatus === 'CLOSED' && (
        <div className={styles.lostReasonPrompt} onClick={event => event.stopPropagation()}>
          <small>Why is this lead closing?</small>
          <select value={lostReason} onChange={event => setLostReason(event.target.value as LostReason)}>
            <option value="">Select a reason…</option>
            {lostReasonOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <button
            type="button"
            className={styles.primary}
            disabled={!lostReason}
            style={{marginTop: '6px'}}
            onClick={() => { onStatusChange(inquiry, 'CLOSED', lostReason); setPendingStatus(null); }}
          >
            Confirm close
          </button>
        </div>
      )}
      {pendingStatus && holdsSeats(pendingStatus) && (
        <BookingPrompt
          inquiry={inquiry}
          onConfirm={booking => { onStatusChange(inquiry, pendingStatus, '', booking); setPendingStatus(null); }}
          onCancel={() => setPendingStatus(null)}
        />
      )}
    </div>
  );
}
