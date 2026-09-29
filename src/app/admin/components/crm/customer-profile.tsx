'use client';

import type {CustomerProfile} from '@/types/inquiry';
import {date, formatCurrency, label} from '../admin-utils';
import {interestLabel} from './crm-utils';
import styles from '@/app/admin/admin.module.css';

export default function CustomerProfileModal({customer, loading, onClose, onOpenInquiry}: {
  customer: CustomerProfile | null;
  loading: boolean;
  onClose: () => void;
  onOpenInquiry: (reference: string) => void;
}) {
  return (
    <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-label="Customer history">
      <div className={styles.editor} style={{maxWidth: '640px'}}>
        <button className={styles.close} onClick={onClose}>×</button>
        {loading || !customer ? (
          <p className={styles.empty}>Loading customer history…</p>
        ) : (
          <>
            <p style={{fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.4px', color: '#74897d', fontWeight: 800, margin: '0 0 4px'}}>Customer</p>
            <h2>{customer.full_name || customer.email}</h2>
            <a href={`mailto:${customer.email}`}>{customer.email}</a>
            {customer.phone && <a href={`tel:${customer.phone}`} style={{marginLeft: '12px'}}>{customer.phone}</a>}

            <div className={styles.customerStats}>
              <div><strong>{customer.lifetime_inquiries}</strong><span>Inquiries</span></div>
              <div><strong>{customer.lifetime_bookings}</strong><span>Bookings</span></div>
              <div><strong>{formatCurrency(Number(customer.lifetime_value_usd) || 0)}</strong><span>Lifetime value</span></div>
            </div>

            <section className={styles.notes}>
              <h3>Inquiries</h3>
              {customer.inquiries.length === 0 && <p className={styles.empty}>No inquiries yet.</p>}
              {customer.inquiries.map(item => (
                <article key={item.id}>
                  <strong>{item.inquiry_number}</strong>
                  <small>{date(item.created_at)} · {label(item.status)}</small>
                  <p>
                    {interestLabel(item)}{' '}
                    <button type="button" className={styles.taskDoneBtn} onClick={() => onOpenInquiry(item.inquiry_number)}>Open →</button>
                  </p>
                </article>
              ))}
            </section>

            <section className={styles.notes}>
              <h3>Bookings</h3>
              {customer.bookings.length === 0 && <p className={styles.empty}>No bookings yet.</p>}
              {customer.bookings.map(item => (
                <article key={item.id}>
                  <strong>{item.booking_reference}</strong>
                  <small>{date(item.created_at)} · {label(item.status)}</small>
                  <p>{formatCurrency(Number(item.total_amount_usd) || 0)} · Trip starts {date(item.trip_start_date)}</p>
                </article>
              ))}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
