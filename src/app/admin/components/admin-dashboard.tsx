'use client';

import React, {FormEvent, useEffect, useMemo, useState} from 'react';
import Link from 'next/link';
import type {
  Inquiry,
  InquiryNote,
  InquiryStatus,
  LostReason,
  PipelineSummary,
  FunnelData,
  CustomerProfile,
  TrekPipeline,
  TrekPipelineRow,
} from '@/types/inquiry';
import type {TravelGuideAdminItem, TravelGuideDetail, GuidePayload, GuideSection} from '@/types/content';
import AdminLogin from '@/components/admin-login';
import ReviewEditor from './review-editor';
import DeparturesEditor from './departures-editor';
import ScheduleBoard from './schedule-board';
import SiteSettingsEditor from './site-settings-editor';
import DestinationEditor from './destination-editor';
import RevenueView from './revenue-view';
import type {AdminDeparture} from './capacity-types';
import styles from '@/app/admin/admin.module.css';
import {fallbackTrekImage} from '@/lib/trek-images';

type Tab = 'dashboard' | 'treks' | 'revenue' | 'journal' | 'inquiries' | 'pipeline' | 'reviews' | 'settings' | 'destinations';
type Page<T> = {count: number; next: string | null; previous: string | null; results: T[]};
interface AdminProfile {full_name: string; role: string; email?: string;}
const statuses: InquiryStatus[] = ['NEW','IN_CONTACT','BOOKED','TRAVELING','COMPLETED','CLOSED'];
/** Which departure a lead is booked onto, and for how many people. */
type BookingChoice = {departureId: string; travelersCount: number};
/** Statuses in which a lead's travellers occupy seats on its departure. */
function holdsSeats(value: InquiryStatus) {
  return value === 'BOOKED' || value === 'TRAVELING' || value === 'COMPLETED';
}
const lostReasonOptions: {value: LostReason; label: string}[] = [
  {value: 'PRICE', label: 'Price Too High'},
  {value: 'DATES', label: "Dates Didn't Work"},
  {value: 'COMPETITOR', label: 'Booked With Competitor'},
  {value: 'NO_RESPONSE', label: 'Went Unresponsive'},
  {value: 'NOT_SUITABLE', label: 'Trip Not Suitable'},
  {value: 'OTHER', label: 'Other'},
];
const emptySection = (): GuideSection => ({heading: '', body: '', image_url: '', image_caption: ''});
const emptyGuide: GuidePayload = {title: '', slug: '', country: 'NEPAL', category: 'ADVENTURE', hero_image_url: '', gallery_images: [], sections: [emptySection()], is_published: false};
/**
 * The editor always works in sections. A post written before sections existed
 * is split on its `## ` headings (text before the first heading becomes an
 * untitled section), and its old story images are placed on sections in order.
 */
function sectionsForEditor(guide: TravelGuideDetail): GuideSection[] {
  if (guide.sections?.length) return guide.sections.map(section => ({...emptySection(), ...section}));
  const markdown = (guide.body_markdown || '').trim();
  const sections: GuideSection[] = [];
  if (markdown) {
    for (const block of markdown.split(/^## /m)) {
      if (!block.trim()) continue;
      const startsWithHeading = sections.length > 0 || markdown.startsWith('## ');
      const newline = block.indexOf('\n');
      const heading = startsWithHeading ? (newline === -1 ? block : block.slice(0, newline)).trim() : '';
      const body = startsWithHeading ? (newline === -1 ? '' : block.slice(newline + 1)).trim() : block.trim();
      sections.push({...emptySection(), heading, body});
    }
  }
  if (!sections.length) sections.push(emptySection());
  (guide.gallery_images || []).forEach((url, index) => {
    if (sections[index]) sections[index].image_url = url;
    else sections.push({...emptySection(), image_url: url});
  });
  return sections;
}

export interface AnalyticsMetrics {
  total_treks: number;
  active_treks: number;
  featured_treks: number;
  treks_this_month: number;
  new_inquiries: number;
  inquiries_last_48h: number;
  total_inquiries: number;
  in_contact_inquiries: number;
  active_expeditions: number;
  monthly_revenue: number;
  last_month_revenue: number;
  total_revenue: number;
  mom_growth_percent: number;
  action_needed: boolean;
}

export interface MonthlyTrend {
  month_label: string;
  full_label: string;
  revenue: number;
  bookings_count: number;
  inquiries_count: number;
}

export interface RecentActivity {
  id: string;
  type: 'INQUIRY' | 'BOOKING' | 'TREK' | 'GUIDE';
  title: string;
  description: string;
  timestamp: string;
  relative_time: string;
  status?: string;
}

export interface DashboardAnalyticsData {
  metrics: AnalyticsMetrics;
  monthly_trends: MonthlyTrend[];
  inquiries_by_status: Record<string, number>;
  bookings_by_status: Record<string, number>;
  recent_activities: RecentActivity[];
  server_time: string;
}

export interface AdminTrek {
  id: string;
  title: string;
  slug: string;
  destination_name?: string;
  destination_slug?: string;
  destination?: string | {id: string; name: string};
  category_name?: string;
  category_slug?: string;
  category?: string | {id: string; name: string};
  duration_days: number;
  starting_price_usd: string | number;
  altitude_max_meters?: number | null;
  difficulty_grade: string;
  max_group_size?: number;
  hero_image_url?: string;
  gallery_images?: string[];
  is_featured?: boolean;
  is_highlighted?: boolean;
  is_active: boolean;
  overview?: string;
  rating_avg?: number | null;
  reviews_count?: number;
}

export interface AdminItineraryDay {
  id?: string;
  day_number: number;
  title: string;
  description: string;
  overnight_stay: string;
  elevation_meters: number | null | '';
  accommodation_type: string;
  is_acclimatization_day: boolean;
  meals_included?: string[];
}

export interface AdminTrekDetail {
  id?: string;
  title: string;
  slug: string;
  destination: string;
  destination_name?: string;
  destination_slug?: string;
  category: string;
  category_name?: string;
  category_slug?: string;
  duration_days: number;
  altitude_max_meters: number | null | '';
  difficulty_grade: string;
  starting_price_usd: number | string;
  single_supplement_usd?: number | string | null;
  min_group_size?: number;
  max_group_size?: number;
  best_seasons: string[];
  inclusions: string[];
  exclusions: string[];
  packing_list: string[];
  overview: string;
  hero_image_url?: string;
  gallery_images: string[];
  is_active: boolean;
  is_featured: boolean;
  itinerary_days: AdminItineraryDay[];
}

export function getTrekImage(slug?: string, destSlug?: string, customImage?: string): string {
  if (customImage && typeof customImage === 'string' && customImage.trim()) {
    return customImage.trim();
  }
  return fallbackTrekImage(slug, destSlug);
}

export interface DestinationOption {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

const difficultyGrades = [
  {value: 'GRADE_1', label: 'Grade 1 - Easy'},
  {value: 'GRADE_2', label: 'Grade 2 - Moderate'},
  {value: 'GRADE_3', label: 'Grade 3 - Demanding'},
  {value: 'GRADE_4', label: 'Grade 4 - Strenuous'},
  {value: 'GRADE_5', label: 'Grade 5 - Challenging'},
  {value: 'ALPINE', label: 'Alpine / Technical'},
];

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  if (!(options?.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(path, {
    ...options,
    headers,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || 'The request could not be completed.');
  return body?.data as T;
}

function date(value?: string | null) {
  return value ? new Intl.DateTimeFormat('en-US', {month: 'short', day: 'numeric', year: 'numeric'}).format(new Date(value)) : '—';
}

/** What a lead is about: its trek, or its kind when it has none (B2B partnership, general…). */
function interestLabel(item: {trip_title?: string | null; inquiry_type?: string | null}) {
  if (item.trip_title) return item.trip_title;
  if (item.inquiry_type === 'PARTNER_DMC') return 'B2B partnership';
  if (item.inquiry_type === 'TAILOR_MADE') return 'Tailor-made trip';
  return 'General inquiry';
}
function label(value?: string | null) {
  return value?.replaceAll('_', ' ') || '—';
}

// Django nests the note author as a user object; older payloads sent a plain name.
function authorName(author?: InquiryNote['author']) {
  return (typeof author === 'string' ? author : author?.full_name || author?.email) || 'Staff';
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 10000) {
    return `$${(amount / 1000).toFixed(0)}k`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return `$${amount.toLocaleString('en-US')}`;
}

function formatNumber(num: number): string {
  return num < 10 && num >= 0 ? `0${num}` : `${num}`;
}

export default function AdminDashboard({backgroundImage}: {backgroundImage?: string}) {
  const [adminUser, setAdminUser] = useState<AdminProfile | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [tab, setTab] = useState<Tab>('dashboard');
  const [analytics, setAnalytics] = useState<DashboardAnalyticsData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string>('');
  const [inquiries, setInquiries] = useState<Page<Inquiry> | null>(null);
  const [guides, setGuides] = useState<Page<TravelGuideAdminItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [notes, setNotes] = useState<InquiryNote[]>([]);
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);
  const [editor, setEditor] = useState<TravelGuideDetail | null>(null);

  // CRM: pipeline board + funnel analytics
  const [pipelineSummary, setPipelineSummary] = useState<PipelineSummary | null>(null);
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [pipelineInquiries, setPipelineInquiries] = useState<Inquiry[]>([]);
  const [loadingPipeline, setLoadingPipeline] = useState(false);
  // CRM lives under each active trek: null shows the trek list, 'ALL' every lead.
  const [crmTrek, setCrmTrek] = useState<string | null>(null);
  const [trekPipeline, setTrekPipeline] = useState<TrekPipeline | null>(null);

  // CRM: tour-based filtering
  const [tripFilter, setTripFilter] = useState('ALL');
  const [scheduleTrek, setScheduleTrek] = useState<AdminTrek | null>(null);
  const [capacityAlerts, setCapacityAlerts] =useState<{total: number; bySlug: Record<string, number>}>({total: 0, bySlug: {}});

  // CRM: customer 360
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);

  // Trek Management states
  const [treks, setTreks] = useState<AdminTrek[]>([]);
  const [destinations, setDestinations] = useState<DestinationOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingTreks, setLoadingTreks] = useState(false);
  const [trekQuery, setTrekQuery] = useState('');
  const [trekStatusFilter, setTrekStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'FEATURED'>('ALL');
  const [selectedTrekSlug, setSelectedTrekSlug] = useState<string | null>(null);
  const [selectedTrekDetail, setSelectedTrekDetail] = useState<AdminTrekDetail | null>(null);
  const [loadingTrekDetail, setLoadingTrekDetail] = useState(false);
  const [trekToDelete, setTrekToDelete] = useState<AdminTrek | null>(null);
  const [trekSaving, setTrekSaving] = useState(false);

  // The server-issued session cookie is the source of truth for admin access.
  useEffect(() => {
    async function verifySession() {
      try {
        const res = await fetch('/api/admin/verify');
        const data = await res.json();
        if (res.ok && data?.authenticated && data?.user) {
          setAdminUser(data.user);
        } else {
          sessionStorage.removeItem('dreamscape_admin_unlocked');
          sessionStorage.removeItem('dreamscape_admin_user');
          setAdminUser(null);
        }
      } catch {
        sessionStorage.removeItem('dreamscape_admin_unlocked');
        sessionStorage.removeItem('dreamscape_admin_user');
        setAdminUser(null);
      } finally {
        setCheckingAuth(false);
      }
    }

    void verifySession();
  }, []);

  const loadInquiries = async () => {
    if (!adminUser) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({status, search: query});
      if (tripFilter !== 'ALL') params.set('trip', tripFilter);
      setInquiries(await api<Page<Inquiry>>(`/api/admin/inquiries?${params}`));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load inquiries.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Oversubscribed departures across every trek: the total badges the Trek
   * Management tab, the per-slug counts flag rows in the trek list.
   */
  const loadCapacityAlerts = async () => {
    if (!adminUser) return;
    try {
      const page = await api<Page<AdminDeparture>>('/api/admin/departures?capacity_state=OVERSUBSCRIBED');
      const bySlug: Record<string, number> = {};
      for (const row of page.results) {
        if (row.trip_slug) bySlug[row.trip_slug] = (bySlug[row.trip_slug] || 0) + 1;
      }
      setCapacityAlerts({total: page.count, bySlug});
    } catch {
      setCapacityAlerts({total: 0, bySlug: {}});
    }
  };

  const loadGuides = async () => {
    if (!adminUser) return;
    setLoading(true);
    try {
      setGuides(await api<Page<TravelGuideAdminItem>>('/api/admin/guides/'));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load guides.');
    } finally {
      setLoading(false);
    }
  };

  const loadTreks = async () => {
    if (!adminUser) return;
    setLoadingTreks(true);
    try {
      const res = await api<{
        treks: {results?: AdminTrek[]} | AdminTrek[];
        destinations?: DestinationOption[];
        categories?: CategoryOption[];
      }>('/api/admin/treks');
      const rawTreks = res?.treks;
      const trekList = Array.isArray(rawTreks) ? rawTreks : rawTreks?.results || [];
      setTreks(trekList);
      if (res?.destinations) setDestinations(res.destinations);
      if (res?.categories) setCategories(res.categories);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load treks.');
    } finally {
      setLoadingTreks(false);
    }
  };

  const loadPipeline = async () => {
    if (!adminUser) return;
    setLoadingPipeline(true);
    try {
      const trekQuery = crmTrek && crmTrek !== 'ALL' ? `&trip=${encodeURIComponent(crmTrek)}` : '';
      const [summary, funnelData, treksData, ...columns] = await Promise.all([
        api<PipelineSummary>('/api/admin/crm/pipeline-summary'),
        api<FunnelData>('/api/admin/crm/funnel'),
        api<TrekPipeline>('/api/admin/crm/treks'),
        ...(crmTrek ? statuses.map(value => api<Page<Inquiry>>(`/api/admin/inquiries?status=${encodeURIComponent(value)}${trekQuery}`)) : []),
      ]);
      setPipelineSummary(summary);
      setFunnel(funnelData);
      setTrekPipeline(treksData);
      setPipelineInquiries(columns.flatMap(page => page.results));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load the pipeline.');
    } finally {
      setLoadingPipeline(false);
    }
  };

  const loadAnalytics = async (isManual = false) => {
    if (!adminUser) return;
    if (isManual) setRefreshing(true);
    try {
      const data = await api<DashboardAnalyticsData>('/api/admin/analytics');
      if (data && data.metrics) {
        setAnalytics(data);
        const now = new Date();
        setLastSynced(now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', second: '2-digit'}));
      }
    } catch {
      // Gracefully maintain existing data
    } finally {
      if (isManual) setRefreshing(false);
    }
  };

  const handleManualRefresh = async () => {
    await Promise.all([
      loadAnalytics(true),
      loadInquiries(),
      loadTreks(),
      loadGuides(),
    ]);
  };

  useEffect(() => {
    if (adminUser) {
      void loadAnalytics();
      void loadInquiries();
      void loadGuides();
      void loadTreks();
      void loadCapacityAlerts();
    }
  }, [adminUser]);

  useEffect(() => {
    if (!adminUser) return;
    if (tab === 'dashboard') void loadAnalytics();
    if (tab === 'inquiries') void loadInquiries();
    if (tab === 'journal') void loadGuides();
    if (tab === 'treks') {
      void loadTreks();
      void loadCapacityAlerts();
    }
    if (tab === 'pipeline') void loadPipeline();
    if (tab !== 'treks') {
      setSelectedTrekSlug(null);
      setSelectedTrekDetail(null);
    }
  }, [tab, status, tripFilter, adminUser, crmTrek]);

  const metrics = useMemo(() => ({
    total: inquiries?.count || 0,
    new: inquiries?.results.filter(item => item.status === 'NEW').length || 0,
    active: inquiries?.results.filter(item => ['IN_CONTACT', 'BOOKED', 'TRAVELING'].includes(item.status)).length || 0,
    published: guides?.results.filter(item => item.is_published).length || 0
  }), [guides, inquiries]);

  const handleToggleTrekActive = async (trek: AdminTrek) => {
    const nextActive = !trek.is_active;
    setTrekSaving(true);
    setMessage('');
    try {
      await api(`/api/admin/treks/${trek.slug}`, {
        method: 'PATCH',
        body: JSON.stringify({is_active: nextActive})
      });
      setTreks(prev => prev.map(t => t.id === trek.id ? {...t, is_active: nextActive} : t));
      if (selectedTrekDetail && selectedTrekDetail.slug === trek.slug) {
        setSelectedTrekDetail(prev => prev ? {...prev, is_active: nextActive} : null);
      }
      setMessage(`Trek "${trek.title}" ${nextActive ? 'activated' : 'deactivated'} successfully.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to update trek status.');
    } finally {
      setTrekSaving(false);
    }
  };

  const handleToggleTrekFeatured = async (trek: AdminTrek) => {
    const nextFeatured = !trek.is_featured;
    setTrekSaving(true);
    setMessage('');
    try {
      await api(`/api/admin/treks/${trek.slug}`, {
        method: 'PATCH',
        body: JSON.stringify({is_featured: nextFeatured})
      });
      setTreks(prev => prev.map(t => t.id === trek.id ? {...t, is_featured: nextFeatured} : t));
      if (selectedTrekDetail && selectedTrekDetail.slug === trek.slug) {
        setSelectedTrekDetail(prev => prev ? {...prev, is_featured: nextFeatured} : null);
      }
      setMessage(`Trek "${trek.title}" ${nextFeatured ? 'is now FEATURED (shown in Home Page Trending Top 5)!' : 'removed from featured list.'}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to update featured status.');
    } finally {
      setTrekSaving(false);
    }
  };

  const handleConfirmDeleteTrek = async () => {
    if (!trekToDelete) return;
    setTrekSaving(true);
    setMessage('');
    try {
      await api(`/api/admin/treks/${trekToDelete.slug}`, {
        method: 'DELETE'
      });
      setTreks(prev => prev.filter(t => t.id !== trekToDelete.id));
      setMessage(`Trek "${trekToDelete.title}" deleted successfully.`);
      setTrekToDelete(null);
      if (selectedTrekSlug === trekToDelete.slug) {
        setSelectedTrekSlug(null);
        setSelectedTrekDetail(null);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to delete trek.');
    } finally {
      setTrekSaving(false);
    }
  };

  const loadTrekDetail = async (slug: string) => {
    setMessage('');
    setLoadingTrekDetail(true);
    setSelectedTrekSlug(slug);
    try {
      if (slug === 'new') {
        setSelectedTrekDetail({
          title: '',
          slug: '',
          destination: destinations[0]?.id || '',
          category: categories[0]?.id || '',
          duration_days: 12,
          altitude_max_meters: 5000,
          difficulty_grade: 'GRADE_3',
          starting_price_usd: 1800,
          single_supplement_usd: 350,
          min_group_size: 1,
          max_group_size: 14,
          best_seasons: [],
          inclusions: [],
          exclusions: [],
          packing_list: [],
          overview: '',
          hero_image_url: '',
          gallery_images: [],
          is_active: true,
          is_featured: false,
          itinerary_days: [
            {
              day_number: 1,
              title: 'Arrival in Kathmandu & Expedition Briefing',
              description: 'Land at Tribhuvan International Airport (KTM). Meet your expedition leader for hotel transfer and gear check.',
              overnight_stay: 'Kathmandu',
              elevation_meters: 1400,
              accommodation_type: 'HOTEL',
              is_acclimatization_day: false,
            }
          ]
        });
      } else {
        const raw = await api<{
          id: string;
          title: string;
          slug: string;
          destination?: {id: string; name: string; slug: string} | string;
          destination_name?: string;
          destination_slug?: string;
          category?: {id: string; name: string; slug: string} | string;
          category_name?: string;
          category_slug?: string;
          duration_days: number;
          altitude_max_meters?: number | null;
          difficulty_grade: string;
          starting_price_usd: number | string;
          single_supplement_usd?: number | string | null;
          min_group_size?: number;
          max_group_size?: number;
          best_seasons?: string[];
          inclusions?: string[];
          exclusions?: string[];
          packing_list?: string[];
          overview?: string;
          hero_image_url?: string;
          gallery_images?: string[];
          is_active?: boolean;
          is_featured?: boolean;
          itinerary_days?: Array<{
            id?: string;
            day_number: number;
            title?: string;
            description?: string;
            overnight_stay?: string;
            elevation_meters?: number | null;
            accommodation_type?: string;
            is_acclimatization_day?: boolean;
            meals_included?: string[];
          }>;
        }>(`/api/admin/treks/${slug}`);

        const destId = typeof raw.destination === 'object' && raw.destination ? raw.destination.id : (typeof raw.destination === 'string' ? raw.destination : (destinations[0]?.id || ''));
        const catId = typeof raw.category === 'object' && raw.category ? raw.category.id : (typeof raw.category === 'string' ? raw.category : (categories[0]?.id || ''));

        const destObj = typeof raw.destination === 'object' && raw.destination ? raw.destination : destinations.find(d => d.id === destId);
        const catObj = typeof raw.category === 'object' && raw.category ? raw.category : categories.find(c => c.id === catId);

        setSelectedTrekDetail({
          id: raw.id,
          title: raw.title || '',
          slug: raw.slug || slug,
          destination: destId,
          destination_name: destObj?.name || raw.destination_name || 'Nepal Himalayas',
          destination_slug: destObj?.slug || raw.destination_slug || 'nepal',
          category: catId,
          category_name: catObj?.name || raw.category_name || 'Classic Trekking',
          category_slug: catObj?.slug || raw.category_slug || 'trekking',
          duration_days: raw.duration_days || 1,
          altitude_max_meters: raw.altitude_max_meters ?? '',
          difficulty_grade: raw.difficulty_grade || 'GRADE_3',
          starting_price_usd: Number(raw.starting_price_usd) || '',
          single_supplement_usd: raw.single_supplement_usd ? Number(raw.single_supplement_usd) : '',
          min_group_size: raw.min_group_size ?? 1,
          max_group_size: raw.max_group_size ?? 14,
          best_seasons: Array.isArray(raw.best_seasons) ? raw.best_seasons : [],
          inclusions: Array.isArray(raw.inclusions) ? raw.inclusions : [],
          exclusions: Array.isArray(raw.exclusions) ? raw.exclusions : [],
          packing_list: Array.isArray(raw.packing_list) ? raw.packing_list : [],
          overview: raw.overview || '',
          hero_image_url: raw.hero_image_url || '',
          gallery_images: Array.isArray(raw.gallery_images) ? raw.gallery_images : [],
          is_active: Boolean(raw.is_active),
          is_featured: Boolean(raw.is_featured),
          itinerary_days: Array.isArray(raw.itinerary_days) && raw.itinerary_days.length > 0
            ? raw.itinerary_days.map(d => ({
                id: d.id,
                day_number: d.day_number,
                title: d.title || '',
                description: d.description || '',
                overnight_stay: d.overnight_stay || '',
                elevation_meters: d.elevation_meters ?? '',
                accommodation_type: d.accommodation_type || 'TEAHOUSE',
                is_acclimatization_day: Boolean(d.is_acclimatization_day),
                meals_included: d.meals_included || []
              }))
            : [
                {
                  day_number: 1,
                  title: 'Arrival & Welcome',
                  description: 'Welcome to Nepal. Transfer to hotel and journey briefing.',
                  overnight_stay: 'Kathmandu',
                  elevation_meters: 1400,
                  accommodation_type: 'HOTEL',
                  is_acclimatization_day: false
                }
              ]
        });
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to load trek detail.');
      setSelectedTrekSlug(null);
      setSelectedTrekDetail(null);
    } finally {
      setLoadingTrekDetail(false);
    }
  };

  const handleSaveFullTrek = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedTrekDetail) return;
    setTrekSaving(true);
    setMessage('');
    try {
      const payload = {
        title: selectedTrekDetail.title,
        slug: selectedTrekDetail.slug,
        destination: selectedTrekDetail.destination,
        category: selectedTrekDetail.category,
        duration_days: Number(selectedTrekDetail.duration_days),
        starting_price_usd: Number(selectedTrekDetail.starting_price_usd),
        single_supplement_usd: selectedTrekDetail.single_supplement_usd ? Number(selectedTrekDetail.single_supplement_usd) : null,
        altitude_max_meters: selectedTrekDetail.altitude_max_meters ? Number(selectedTrekDetail.altitude_max_meters) : null,
        difficulty_grade: selectedTrekDetail.difficulty_grade,
        min_group_size: selectedTrekDetail.min_group_size ? Number(selectedTrekDetail.min_group_size) : 1,
        max_group_size: selectedTrekDetail.max_group_size ? Number(selectedTrekDetail.max_group_size) : 14,
        overview: selectedTrekDetail.overview,
        hero_image_url: selectedTrekDetail.hero_image_url || '',
        gallery_images: selectedTrekDetail.gallery_images || [],
        is_active: selectedTrekDetail.is_active,
        is_featured: selectedTrekDetail.is_featured,
        best_seasons: selectedTrekDetail.best_seasons,
        inclusions: selectedTrekDetail.inclusions,
        exclusions: selectedTrekDetail.exclusions,
        packing_list: selectedTrekDetail.packing_list,
        itinerary_days: selectedTrekDetail.itinerary_days.map((d, i) => ({
          day_number: i + 1,
          title: d.title || `Day ${i + 1}`,
          description: d.description || '',
          overnight_stay: d.overnight_stay || '',
          elevation_meters: d.elevation_meters !== '' && d.elevation_meters !== null ? Number(d.elevation_meters) : null,
          accommodation_type: d.accommodation_type || 'TEAHOUSE',
          is_acclimatization_day: Boolean(d.is_acclimatization_day),
          meals_included: d.meals_included || []
        }))
      };

      let savedSlug = selectedTrekDetail.slug;
      let successMessage = '';
      if (selectedTrekDetail.id && selectedTrekSlug !== 'new') {
        const updated = await api<{slug?: string}>(`/api/admin/treks/${selectedTrekSlug}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
        savedSlug = updated?.slug || savedSlug;
        successMessage = `Trek "${selectedTrekDetail.title}" updated successfully with ${payload.itinerary_days.length} itinerary days.`;
      } else {
        const created = await api<{slug?: string}>('/api/admin/treks', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        savedSlug = created?.slug || savedSlug;
        successMessage = `Trek "${selectedTrekDetail.title}" created successfully. It is now loaded for editing.`;
      }
      await loadTreks();
      if (savedSlug) await loadTrekDetail(savedSlug);
      setMessage(successMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save trek details.');
    } finally {
      setTrekSaving(false);
    }
  };

  const handleLockWorkspace = async () => {
    try {
      await fetch('/api/admin/logout', {method: 'POST'});
    } catch {
      // Ignore network failure on logout
    }
    sessionStorage.removeItem('dreamscape_admin_unlocked');
    sessionStorage.removeItem('dreamscape_admin_user');
    setAdminUser(null);
    setInquiries(null);
    setGuides(null);
    setMessage('');
  };

  const displayInquiries = useMemo(() => {
    if (inquiries?.results && inquiries.results.length > 0) {
      return inquiries.results.slice(0, 6).map(item => ({
        inquiry_number: item.inquiry_number,
        full_name: item.full_name,
        trip: item.trip || item.journey || item.inquiry_type || 'Everest Base Camp',
        dateFormatted: date(item.created_at),
        status: item.status,
      }));
    }
    return [];
  }, [inquiries]);

  if (checkingAuth) {
    return (
      <div className={styles.loginBackdrop}>
        <div style={{textAlign: 'center'}}>
          <div className={styles.loginBadge}><span className={styles.loginBadgeDot} />EXPEDITION CONTROL</div>
          <p style={{marginTop: '12px', fontSize: '13px', color: '#a3baa9'}}>Verifying administrative session…</p>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return <AdminLogin backgroundImage={backgroundImage} />;
  }

  async function openInquiry(reference: string) {
    setMessage('');
    setNotes([]);
    try {
      const [detail, noteList] = await Promise.all([
        api<Inquiry>(`/api/admin/inquiries/${reference}`),
        api<InquiryNote[] | Page<InquiryNote>>(`/api/admin/inquiries/${reference}/notes`),
      ]);
      setSelectedInquiry(detail);
      setNotes(Array.isArray(noteList) ? noteList : noteList.results);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to open this inquiry.');
    }
  }

  async function updateStatus(next: InquiryStatus, lostReason?: LostReason | '', booking?: BookingChoice, target: Inquiry | null = selectedInquiry) {
    if (!target) return;
    setSaving(true);
    setMessage('');
    try {
      const body: Record<string, unknown> = {status: next};
      if (next === 'CLOSED') body.lost_reason = lostReason || '';
      if (booking) {
        body.departure_id = booking.departureId;
        body.travelers_count = booking.travelersCount;
      }
      const saved = await api<Inquiry>(`/api/admin/inquiries/${target.inquiry_number}`, {
        method: 'PATCH',
        body: JSON.stringify(body)
      });
      if (selectedInquiry?.inquiry_number === saved.inquiry_number) setSelectedInquiry(saved);
      setInquiries(current => current && {
        ...current,
        results: current.results.map(item => item.inquiry_number === saved.inquiry_number ? {...item, status: saved.status} : item)
      });
      const {status: savedStatus, travelers_count, revenue_usd} = saved;
      setPipelineInquiries(current => current.map(item => item.inquiry_number === saved.inquiry_number ? {...item, status: savedStatus, travelers_count, revenue_usd} : item));
      if (tab === 'pipeline') {
        api<TrekPipeline>('/api/admin/crm/treks').then(setTrekPipeline).catch(() => undefined);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to update the inquiry.');
    } finally {
      setSaving(false);
    }
  }

  async function openCustomer(email: string) {
    setMessage('');
    setLoadingCustomer(true);
    try {
      setCustomerProfile(await api<CustomerProfile>(`/api/admin/crm/customers/${encodeURIComponent(email)}`));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load this customer.');
    } finally {
      setLoadingCustomer(false);
    }
  }

  async function submitNote(event: FormEvent) {
    event.preventDefault();
    if (!selectedInquiry || !noteText.trim()) return;
    setSaving(true);
    setMessage('');
    try {
      const saved = await api<InquiryNote>(`/api/admin/inquiries/${selectedInquiry.inquiry_number}/notes`, {
        method: 'POST',
        body: JSON.stringify({note_text: noteText})
      });
      setNotes(items => [...items, saved]);
      setNoteText('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to add the note.');
    } finally {
      setSaving(false);
    }
  }

  async function editGuide(item?: TravelGuideAdminItem) {
    setMessage('');
    try {
      const detail = item ? await api<TravelGuideDetail>(`/api/admin/guides/${item.slug}`) : {...emptyGuide, id: '', slug: ''};
      setEditor({...detail, sections: sectionsForEditor(detail)});
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to open the editor.');
    }
  }

  async function saveGuide(event: FormEvent) {
    event.preventDefault();
    if (!editor) return;
    setSaving(true);
    setMessage('');
    const {id, body_markdown, ...rest} = editor;
    void id; void body_markdown;
    const sections = (editor.sections || []).filter(section => section.heading.trim() || section.body.trim() || section.image_url);
    if (!sections.length) {
      setSaving(false);
      setMessage('Add at least one section with some text or a photo before saving.');
      return;
    }
    const payload = {...rest, sections};
    try {
      const saved = await api<TravelGuideDetail>(editor.id ? `/api/admin/guides/${editor.slug}` : '/api/admin/guides', {
        method: editor.id ? 'PATCH' : 'POST',
        body: JSON.stringify(payload)
      });
      const verified = await api<TravelGuideDetail>(`/api/admin/guides/${saved.slug}`);
      setGuides(current => current && {
        ...current,
        results: editor.id ? current.results.map(item => item.slug === verified.slug ? verified : item) : [verified, ...current.results],
        count: editor.id ? current.count : current.count + 1
      });
      setEditor(null);
      setMessage(verified.is_published ? `“${verified.title}” is saved and live on the blog.` : `“${verified.title}” is saved in the database as a draft.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save the guide.');
    } finally {
      setSaving(false);
    }
  }

  /** Takes a post off the public blog but keeps it as a draft. */
  async function unpublishGuide() {
    if (!editor?.id || !window.confirm(`Unpublish “${editor.title}”? It stays in the admin as a draft.`)) return;
    setSaving(true);
    setMessage('');
    try {
      await api(`/api/admin/guides/${editor.slug}`, {method: 'DELETE'});
      setGuides(current => current && {
        ...current,
        results: current.results.map(item => item.slug === editor.slug ? {...item, is_published: false} : item)
      });
      setEditor(null);
      setMessage(`“${editor.title}” is unpublished and saved as a draft.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to unpublish the post.');
    } finally {
      setSaving(false);
    }
  }

  /** Removes a post and its comments for good, from the editor or the blog list. */
  async function deleteGuidePermanently(guide: {slug: string; title: string}) {
    if (!window.confirm(`Delete “${guide.title}” permanently?\n\nThe post, its photos list and all reader comments will be removed. This cannot be undone.`)) return;
    setSaving(true);
    setMessage('');
    try {
      await api(`/api/admin/guides/${guide.slug}?permanent=true`, {method: 'DELETE'});
      setGuides(current => current && {
        ...current,
        results: current.results.filter(item => item.slug !== guide.slug),
        count: Math.max(0, current.count - 1)
      });
      if (editor?.slug === guide.slug) setEditor(null);
      setMessage(`“${guide.title}” was deleted.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to delete the post.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteGuideComment(commentId: string) {
    if (!editor?.id || !window.confirm('Remove this comment?')) return;
    setSaving(true);
    setMessage('');
    try {
      await api(`/api/admin/guides/${editor.slug}/comments/${commentId}`, {method: 'DELETE'});
      setEditor(current => current ? {...current, comments: (current.comments || []).filter(comment => comment.id !== commentId), comment_count: Math.max(0, (current.comment_count || 1) - 1)} : current);
      setGuides(current => current ? {...current, results: current.results.map(item => item.slug === editor.slug ? {...item, comment_count: Math.max(0, (item.comment_count || 1) - 1)} : item)} : current);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to remove the comment.');
    } finally {
      setSaving(false);
    }
  }

  const navItems: Array<{id: Tab; label: string; icon: React.ReactNode; badge?: number}> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
      )
    },
    {
      id: 'treks',
      label: 'Trek Management',
      badge: capacityAlerts.total > 0 ? capacityAlerts.total : undefined,
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
        </svg>
      )
    },
    {
      id: 'destinations',
      label: 'Destinations',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m3 17 5-8 4 5 3-4 6 7H3Z"/>
          <circle cx="17" cy="5" r="2"/>
        </svg>
      )
    },
    {
      id: 'revenue',
      label: 'Revenue',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      )
    },
    {
      id: 'journal',
      label: 'Blog Management',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
        </svg>
      )
    },
    {
      id: 'inquiries',
      label: 'Inquiries',
      badge: metrics.new > 0 ? metrics.new : undefined,
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      )
    },
    {
      id: 'pipeline',
      label: 'CRM',
      badge: pipelineSummary?.sla_breached_count ? pipelineSummary.sla_breached_count : undefined,
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18"/>
          <path d="M18 17V9M13 17V5M8 17v-4"/>
        </svg>
      )
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      )
    },
    {
      id: 'settings',
      label: 'Lead Routing',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6h.09A1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      )
    },
  ];

  return (
    <main className={styles.workspace}>
      {/* Left Sidebar */}
      <aside className={styles.sidebar}>
        <Link className={styles.brand} href="/">
          <h2 className={styles.brandTitle}>Dream Scape<br />Admin</h2>
          <p className={styles.brandSub}>Expedition Control</p>
        </Link>

        <nav aria-label="Admin navigation">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`${styles.navItem} ${tab === item.id ? styles.navItemActive : ''}`}
              onClick={() => setTab(item.id)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge !== undefined && <span className={styles.navBadge}>{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFoot}>
          <button
            type="button"
            className={`${styles.settingsBtn} ${tab === 'settings' ? styles.navItemActive : ''}`}
            onClick={() => setTab('settings')}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Settings
          </button>

          <button
            type="button"
            className={styles.signOutLink}
            onClick={() => void handleLockWorkspace()}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <section className={styles.content}>
        {/* Top Header */}
        <header className={styles.topBar}>
          <h1 className={styles.pageTitle}>
            {tab === 'dashboard' ? 'Dashboard Overview' : navItems.find(item => item.id === tab)?.label || 'Overview'}
          </h1>

          <div className={styles.topRight}>
            <div className={styles.profileWidget}>
              <div className={styles.profileInfo}>
                <span className={styles.profileName}>{adminUser.full_name || 'Admin User'}</span>
                <span className={styles.profileRole}>{label(adminUser.role || 'Superadmin')}</span>
              </div>
              <div className={styles.profileAvatar}>
                {(adminUser.full_name || 'A').slice(0, 1).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {message && (
          <div className={styles.notice} role="status">
            {message}
            <button aria-label="Dismiss message" onClick={() => setMessage('')}>×</button>
          </div>
        )}

        {/* Dashboard overview */}
        {tab === 'dashboard' && (
          <>
            {/* Live Synchronization Status & Refresh Button */}
            <div className={styles.liveSyncBar}>
              <div className={styles.liveSyncStatus}>
                <span className={styles.livePulseDot} />
                <span className={styles.liveSyncText}>
                  {lastSynced ? `Live synced: ${lastSynced}` : 'Live synchronization active'}
                </span>
              </div>
              <button 
                type="button"
                className={`${styles.refreshBtn} ${refreshing ? styles.refreshBtnSpinning : ''}`} 
                onClick={() => void handleManualRefresh()}
                disabled={refreshing}
                title="Refresh live analytics"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                </svg>
                {refreshing ? 'Refreshing…' : 'Refresh Analytics'}
              </button>
            </div>

            {/* Top 4 Stat Cards */}
            <div className={styles.statsRow}>
              {/* Card 1: Total Treks */}
              <div 
                className={`${styles.statCard} ${styles.statCardClickable}`}
                onClick={() => setTab('treks')}
                title="View Trek Management"
                role="button"
                tabIndex={0}
              >
                <div className={styles.statCardHead}>
                  <span className={styles.statLabel}>Total Treks</span>
                  <svg className={styles.statWatermark} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
                  </svg>
                </div>
                <div className={styles.statValue}>
                  {analytics ? analytics.metrics.total_treks : treks.length}
                </div>
                <p className={styles.statSub}>
                  {analytics
                    ? (analytics.metrics.treks_this_month > 0
                        ? `+${analytics.metrics.treks_this_month} this month`
                        : `${analytics.metrics.active_treks} active in catalog`)
                    : 'Loading catalog'}
                </p>
              </div>

              {/* Card 2: New Inquiries */}
              <div 
                className={`${styles.statCard} ${styles.statCardClickable}`}
                onClick={() => {
                  setStatus('NEW');
                  setTab('inquiries');
                }}
                title="View New Inquiries"
                role="button"
                tabIndex={0}
              >
                <div className={styles.statCardHead}>
                  <span className={styles.statLabel}>New Inquiries</span>
                  {((analytics ? analytics.metrics.new_inquiries : metrics.new) > 0) ? (
                    <span className={styles.statBadgeRed}>ACTION NEEDED</span>
                  ) : (
                    <span className={styles.statBadgeGreen}>ALL CAUGHT UP</span>
                  )}
                </div>
                <div className={styles.statValue}>
                  {analytics ? analytics.metrics.new_inquiries : metrics.new}
                </div>
                <p className={styles.statSub}>
                  {analytics && analytics.metrics.inquiries_last_48h > 0
                    ? `${analytics.metrics.inquiries_last_48h} in last 48h`
                    : 'in last 48h'}
                </p>
              </div>

              {/* Card 3: Active Expeditions */}
              <div 
                className={`${styles.statCard} ${styles.statCardClickable}`}
                onClick={() => {
                  setStatus('TRAVELING');
                  setTab('inquiries');
                }}
                title="View Active Expeditions"
                role="button"
                tabIndex={0}
              >
                <div className={styles.statCardHead}>
                  <span className={styles.statLabel}>Active Expeditions</span>
                  <svg className={styles.statWatermark} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="4" r="2"/>
                    <path d="m9 20 3-6 3 6"/>
                    <path d="m6 8 6 2 6-2"/>
                    <line x1="12" y1="10" x2="12" y2="14"/>
                  </svg>
                </div>
                <div className={styles.statValue}>
                  {analytics ? formatNumber(analytics.metrics.active_expeditions) : '—'}
                </div>
                <p className={styles.statSub}>currently en route</p>
              </div>

              {/* Card 4: Monthly Revenue (Dark Emerald Card) */}
              <div 
                className={`${styles.statCard} ${styles.statCardDark} ${styles.statCardClickable}`}
                onClick={() => setTab('revenue')}
                title="View Full Revenue Analytics"
                role="button"
                tabIndex={0}
              >
                <div className={styles.statCardHead}>
                  <span className={styles.statLabel}>Monthly Revenue</span>
                  <svg className={styles.statWatermark} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                </div>
                <div className={styles.statValue}>
                  {analytics ? formatCurrency(analytics.metrics.monthly_revenue) : '—'}
                </div>
                <p className={styles.statSub}>
                  {!analytics
                    ? 'Loading…'
                    : analytics.metrics.mom_growth_percent !== 0
                      ? `${analytics.metrics.mom_growth_percent > 0 ? '+' : ''}${analytics.metrics.mom_growth_percent}% MoM`
                      : `From completed treks · ${formatCurrency(analytics.metrics.total_revenue)} all time`}
                </p>
              </div>
            </div>

            {/* Dual Column Layout: Left Table & Right Stack */}
            <div className={styles.dashboardGrid}>
              {/* Left Column: Recent Inquiries Card */}
              <section className={styles.inquiriesCard}>
                <div className={styles.cardHeader}>
                  <h2>Recent Inquiries</h2>
                  <button className={styles.viewAllBtn} onClick={() => setTab('inquiries')}>
                    View All →
                  </button>
                </div>

                <div className={styles.tableWrap}>
                  <table className={styles.modernTable}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Trek Interest</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayInquiries.map((item) => (
                        <tr key={item.inquiry_number}>
                          <td>
                            <strong className={styles.travelerName}>{item.full_name}</strong>
                          </td>
                          <td className={styles.tripInterest}>{item.trip}</td>
                          <td className={styles.tableDate}>{item.dateFormatted}</td>
                          <td>
                            <span className={item.status === 'NEW' ? styles.statusPillNew : styles.statusPillContacted}>
                              {item.status === 'NEW' ? 'NEW' : 'CONTACTED'}
                            </span>
                          </td>
                          <td>
                            <button
                              className={styles.actionDotsBtn}
                              onClick={() => void openInquiry(item.inquiry_number)}
                              title="View inquiry details"
                              aria-label={`Open inquiry for ${item.full_name}`}
                            >
                              ⋮
                            </button>
                          </td>
                        </tr>
                      ))}
                      {displayInquiries.length === 0 && (
                        <tr><td colSpan={5}>No recent inquiries yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Right Column: Quick Actions & Recent Activity */}
              <div className={styles.rightStack}>
                {/* Quick Actions Panel */}
                <section className={styles.sectionCard}>
                  <h3 className={styles.sectionCardTitle}>Quick Actions</h3>
                  <div className={styles.quickActionsGrid}>
                    <button
                      type="button"
                      className={styles.quickActionBtn}
                      onClick={() => {
                        setTab('treks');
                        void loadTrekDetail('new');
                      }}
                    >
                      <svg className={styles.quickActionIcon} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="16"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                      </svg>
                      Add New Trek
                    </button>

                    <button
                      type="button"
                      className={styles.quickActionBtn}
                      onClick={() => {setTab('journal'); void editGuide();}}
                    >
                      <svg className={styles.quickActionIcon} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      New Blog Post
                    </button>
                  </div>
                </section>

                {/* Recent Activity Timeline */}
                <section className={styles.sectionCard}>
                  <div className={styles.sectionCardHeader}>
                    <h3 className={styles.sectionCardTitle}>Recent Activity</h3>
                    <span className={styles.activityCountBadge}>
                      {analytics?.recent_activities ? `${analytics.recent_activities.length} live events` : 'System Feed'}
                    </span>
                  </div>
                  <div className={styles.timeline}>
                    {analytics?.recent_activities && analytics.recent_activities.length > 0 ? (
                      analytics.recent_activities.map((act) => (
                        <div key={act.id} className={styles.timelineItem}>
                          <div className={`${styles.timelineDot} ${act.type === 'INQUIRY' ? styles.timelineDotActive : ''}`} />
                          <div className={styles.timelineContent}>
                            <strong>{act.title}</strong>
                            <p className={styles.timelineSub}>{act.description}</p>
                            <small>{act.relative_time}</small>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No recent activity yet.</p>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </>
        )}

        {/* Tab 2: Full Inquiries View */}
        {tab === 'inquiries' && (
          <InquiriesView
            inquiries={inquiries?.results || []}
            loading={loading}
            query={query}
            status={status}
            treks={treks}
            tripFilter={tripFilter}
            onQuery={setQuery}
            onStatus={setStatus}
            onTrip={setTripFilter}
            onSearch={() => void loadInquiries()}
            onOpen={openInquiry}
          />
        )}

        {/* Tab: CRM Pipeline (Kanban + conversion funnel) */}
        {tab === 'pipeline' && (
          crmTrek === null ? (
            <CrmTrekList
              pipeline={trekPipeline}
              summary={pipelineSummary}
              loading={loadingPipeline}
              onOpen={setCrmTrek}
            />
          ) : (
            <PipelineView
              summary={pipelineSummary}
              funnel={funnel}
              trek={trekPipeline?.results.find(row => row.slug === crmTrek) ?? null}
              inquiries={pipelineInquiries}
              loading={loadingPipeline}
              onBack={() => setCrmTrek(null)}
              onOpen={openInquiry}
              onStatusChange={(inquiry, next, lostReason, booking) => {
                void updateStatus(next, lostReason, booking, inquiry);
              }}
            />
          )
        )}

        {/* Tab 3: Full Journal CMS View */}
        {tab === 'journal' && (
          <JournalView
            guides={guides?.results || []}
            loading={loading}
            onCreate={() => void editGuide()}
            onEdit={item => void editGuide(item)}
            onDelete={item => void deleteGuidePermanently(item)}
            deleting={saving}
          />
        )}

        {/* Tab: Trek Management View / Full Detail Editor */}
        {tab === 'treks' && (
          selectedTrekSlug && selectedTrekDetail ? (
            <TrekFullDetailEditor
              trek={selectedTrekDetail}
              slug={selectedTrekSlug}
              destinations={destinations}
              categories={categories}
              formatDate={date}
              saving={trekSaving}
              loading={loadingTrekDetail}
              onMessage={setMessage}
              onChange={setSelectedTrekDetail}
              onBack={() => {
                setSelectedTrekSlug(null);
                setSelectedTrekDetail(null);
                // Seat edits in section 05 may have cleared or caused alerts.
                void loadCapacityAlerts();
              }}
              onSave={handleSaveFullTrek}
              onToggleActive={() => {
                if (!selectedTrekDetail) return;
                const nextActive = !selectedTrekDetail.is_active;
                setSelectedTrekDetail(prev => prev ? {...prev, is_active: nextActive} : null);
              }}
              onToggleFeatured={() => {
                if (!selectedTrekDetail) return;
                const nextFeatured = !selectedTrekDetail.is_featured;
                setSelectedTrekDetail(prev => prev ? {...prev, is_featured: nextFeatured} : null);
              }}
            />
          ) : (
            <TrekManagementView
              treks={treks}
              loading={loadingTreks}
              query={trekQuery}
              statusFilter={trekStatusFilter}
              oversubscribed={capacityAlerts.bySlug}
              onQueryChange={setTrekQuery}
              onStatusFilterChange={setTrekStatusFilter}
              onSelectTrek={slug => void loadTrekDetail(slug)}
              onToggleActive={handleToggleTrekActive}
              onToggleFeatured={handleToggleTrekFeatured}
              onDeleteTrek={trek => setTrekToDelete(trek)}
              onSchedule={trek => setScheduleTrek(trek)}
            />
          )
        )}

        {/* Tab: Full Revenue & Financial Analytics View */}
        {tab === 'revenue' && (
          <RevenueView api={api} isAdmin={adminUser.role === 'ADMIN'} treks={treks} />
        )}

        {/* Tab: Settings */}
        {tab === 'settings' && <SiteSettingsEditor/>}

        {tab === 'reviews' && <ReviewEditor/>}
        {tab === 'destinations' && <DestinationEditor/>}
      </section>

      {/* Inquiry Drawer */}
      {selectedInquiry && (
        <InquiryDrawer
          inquiry={selectedInquiry}
          notes={notes}
          noteText={noteText}
          saving={saving}
          onClose={() => setSelectedInquiry(null)}
          onStatus={updateStatus}
          onNoteText={setNoteText}
          onSubmit={submitNote}
          onViewCustomer={() => void openCustomer(selectedInquiry.email)}
        />
      )}

      {/* Customer 360 */}
      {(customerProfile || loadingCustomer) && (
        <CustomerProfileModal
          customer={customerProfile}
          loading={loadingCustomer}
          onClose={() => setCustomerProfile(null)}
          onOpenInquiry={reference => {
            setCustomerProfile(null);
            void openInquiry(reference);
          }}
        />
      )}

      {/* Travel Guide CMS Editor */}
      {editor && (
        <GuideEditor
          guide={editor}
          saving={saving}
          onChange={setEditor}
          onClose={() => setEditor(null)}
          onSave={saveGuide}
          onUnpublish={() => void unpublishGuide()}
          onDelete={() => editor && void deleteGuidePermanently(editor)}
          onDeleteComment={commentId => void deleteGuideComment(commentId)}
        />
      )}

      {/* Trek Schedule pop-up: departures and seat capacity for one trek */}
      {scheduleTrek && (
        <ScheduleModal
          trek={scheduleTrek}
          onClose={() => {
            setScheduleTrek(null);
            // Seat edits in the pop-up may have cleared or caused alerts.
            void loadCapacityAlerts();
          }}
        />
      )}

      {/* Trek Delete Confirmation Dialog */}
      {trekToDelete && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.confirmDialog}>
            <h3 className={styles.confirmDialogTitle}>Delete Trek</h3>
            <p className={styles.confirmDialogText}>
              Are you sure you want to permanently remove <strong>{trekToDelete.title}</strong>?
              This action cannot be undone.
            </p>
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.confirmCancelBtn}
                disabled={trekSaving}
                onClick={() => setTrekToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.confirmDeleteBtn}
                disabled={trekSaving}
                onClick={() => void handleConfirmDeleteTrek()}
              >
                {trekSaving ? 'Deleting…' : 'Delete Trek'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function InquiriesView({
  inquiries, loading, query, status, treks, tripFilter, onQuery, onStatus, onTrip, onSearch, onOpen
}: {
  inquiries: Inquiry[];
  loading: boolean;
  query: string;
  status: string;
  treks: AdminTrek[];
  tripFilter: string;
  onQuery: (value: string) => void;
  onStatus: (value: string) => void;
  onTrip: (value: string) => void;
  onSearch: () => void;
  onOpen: (reference: string) => void;
}) {
  return (
    <section className={styles.panel}>
      <div className={styles.toolbar}>
        <label>
          <span className="sr-only">Search inquiries</span>
          <input
            value={query}
            onChange={event => onQuery(event.target.value)}
            onKeyDown={event => event.key === 'Enter' && onSearch()}
            placeholder="Search traveler, email, or reference"
          />
        </label>
        <select value={status} onChange={event => onStatus(event.target.value)}>
          {['ALL', ...statuses].map(value => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <select value={tripFilter} onChange={event => onTrip(event.target.value)} aria-label="Filter by tour">
          <option value="ALL">All tours</option>
          {treks.map(trek => (
            <option key={trek.slug} value={trek.slug}>{trek.title}</option>
          ))}
        </select>
        <button className={styles.primary} onClick={onSearch}>Search</button>
      </div>
      {loading ? (
        <p className={styles.empty}>Loading inquiries…</p>
      ) : inquiries.length ? (
        <div className={styles.tableWrap}>
          <table className={styles.modernTable}>
            <thead>
              <tr>
                <th>Traveler</th>
                <th>Trip interest</th>
                <th>Status</th>
                <th>Received</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map(item => (
                <tr key={item.inquiry_number}>
                  <td>
                    <strong className={styles.travelerName}>{item.full_name}</strong>
                    <small style={{fontSize: '11px', color: '#6d8276'}}>{item.email}</small>
                  </td>
                  <td>
                    {/* trip_title is what the serializer actually sends. The old
                        item.trip / item.journey reads were stripped by the field
                        allowlist, so this column always fell through to the type. */}
                    <span>{interestLabel(item)}</span>
                    {item.departure_label && (
                      <small style={{display: 'block', fontSize: '11px', color: '#6d8276'}}>{item.departure_label}</small>
                    )}
                  </td>
                  <td>
                    <em data-status={item.status}>{label(item.status)}</em>
                  </td>
                  <td>{date(item.created_at)}</td>
                  <td>
                    <button onClick={() => onOpen(item.inquiry_number)} aria-label={`Open inquiry from ${item.full_name}`}>
                      →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className={styles.empty}>No inquiries match this view.</p>
      )}
    </section>
  );
}

function JournalView({guides, loading, deleting, onCreate, onEdit, onDelete}: {guides: TravelGuideAdminItem[]; loading: boolean; deleting: boolean; onCreate: () => void; onEdit: (guide: TravelGuideAdminItem) => void; onDelete: (guide: TravelGuideAdminItem) => void}) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div>
          <p style={{fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.4px', color: '#74897d', fontWeight: 800, margin: '0 0 4px'}}>CMS</p>
          <h2>Blog posts</h2>
        </div>
        <button className={styles.primary} onClick={onCreate}>+ New blog post</button>
      </div>
      {loading ? (
        <p className={styles.empty}>Loading guides…</p>
      ) : guides.length ? (
        <div className={styles.tableWrap}>
          <table className={styles.journalTable}>
            <thead>
              <tr>
                <th>Blog post</th>
                <th>Category</th>
                <th>State</th>
                <th>Views</th>
                <th>Comments</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {guides.map(guide => (
                <tr key={guide.id}>
                  <td data-label="Blog post">
                    <strong>{guide.title}</strong>
                    <small>/{guide.slug}</small>
                  </td>
                  <td data-label="Category">{label(guide.category)}</td>
                  <td data-label="State">
                    <em data-status={guide.is_published ? 'PUBLISHED' : 'DRAFT'}>
                      {guide.is_published ? 'Published' : 'Draft'}
                    </em>
                  </td>
                  <td data-label="Views">{(guide.view_count || 0).toLocaleString()}</td>
                  <td data-label="Comments">{guide.comment_count || 0}</td>
                  <td data-label="Updated">{date(guide.updated_at || guide.published_at)}</td>
                  <td data-label="Action">
                    <div className={styles.actionBtnGroup}>
                      <RowActionsMenu label={guide.title} actions={[
                        {label: 'Edit post', onSelect: () => onEdit(guide)},
                        {label: 'Delete post', onSelect: () => onDelete(guide), danger: true, disabled: deleting},
                      ]}/>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className={styles.empty}>No blog posts found.</p>
      )}
    </section>
  );
}

function InquiryDrawer({
  inquiry, notes, noteText, saving, onClose, onStatus, onNoteText, onSubmit, onViewCustomer,
}: {
  inquiry: Inquiry; notes: InquiryNote[]; noteText: string; saving: boolean;
  onClose: () => void; onStatus: (value: InquiryStatus, lostReason?: LostReason | '', booking?: BookingChoice) => void;
  onNoteText: (value: string) => void; onSubmit: (event: FormEvent) => void;
  onViewCustomer: () => void;
}) {
  const [pendingStatus, setPendingStatus] = useState<InquiryStatus | null>(null);
  const [lostReason, setLostReason] = useState<LostReason | ''>('');

  const needsLostReason = pendingStatus === 'CLOSED' && !inquiry.converted_booking_reference;

  function handleStatusChange(next: InquiryStatus) {
    if (next === 'CLOSED' && !inquiry.converted_booking_reference) {
      setPendingStatus(next);
      setLostReason('');
      return;
    }
    if (holdsSeats(next) && !holdsSeats(inquiry.status)) {
      setPendingStatus(next);
      return;
    }
    setPendingStatus(null);
    onStatus(next);
  }

  function confirmLostReason() {
    if (!pendingStatus || !lostReason) return;
    onStatus(pendingStatus, lostReason);
    setPendingStatus(null);
  }

  return (
    <aside className={styles.drawer} aria-label="Inquiry details">
      <button className={styles.close} onClick={onClose}>×</button>
      <p style={{fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.4px', color: '#74897d', fontWeight: 800}}>{inquiry.inquiry_number}</p>
      <h2>{inquiry.full_name}</h2>
      <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
      {inquiry.phone && <a href={`tel:${inquiry.phone}`}>{inquiry.phone}</a>}
      <button type="button" className={styles.drawerHistoryBtn} onClick={onViewCustomer}>View customer history →</button>

      <>
          <dl>
            <div>
              <dt>Status</dt>
              <dd>
                <select value={inquiry.status} disabled={saving} onChange={event => handleStatusChange(event.target.value as InquiryStatus)}>
                  {statuses.map(value => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
                {pendingStatus && holdsSeats(pendingStatus) && (
                  <BookingPrompt
                    inquiry={inquiry}
                    saving={saving}
                    onConfirm={booking => { onStatus(pendingStatus, '', booking); setPendingStatus(null); }}
                    onCancel={() => setPendingStatus(null)}
                  />
                )}
                {needsLostReason && (
                  <div className={styles.lostReasonPrompt}>
                    <small>Why is this lead closing without a booking?</small>
                    <select value={lostReason} onChange={event => setLostReason(event.target.value as LostReason)}>
                      <option value="">Select a reason…</option>
                      {lostReasonOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <button type="button" className={styles.primary} disabled={!lostReason || saving} style={{marginTop: '6px'}} onClick={confirmLostReason}>
                      Confirm close
                    </button>
                  </div>
                )}
              </dd>
            </div>
            <div>
              <dt>Trip interest</dt>
              {/* trip_title is the field the serializer actually sends; trip and
                  journey are stripped by the staff field allowlist. */}
              <dd>{interestLabel(inquiry)}</dd>
            </div>
            <div>
              <dt>Departure</dt>
              <dd>{inquiry.departure_label || 'No fixed batch'}</dd>
            </div>
            <div>
              <dt>Preferred dates</dt>
              <dd>{inquiry.preferred_dates || 'Not specified'}</dd>
            </div>
          </dl>
          {inquiry.converted_booking_reference && (
            <p style={{fontSize: '11px', color: '#24583f', fontWeight: 700}}>
              ✓ Converted to booking {inquiry.converted_booking_reference}
            </p>
          )}
          <section className={styles.message}>
            <h3>Traveler message</h3>
            <p>{inquiry.message || 'No message supplied.'}</p>
          </section>
          <section className={styles.notes}>
            <h3>Consultation notes</h3>
            {notes.map(note => (
              <article key={note.id}>
                <strong>{authorName(note.author)}</strong>
                <small>{date(note.created_at)}</small>
                <p>{note.note_text}</p>
              </article>
            ))}
            <form onSubmit={onSubmit}>
              <textarea
                value={noteText}
                onChange={event => onNoteText(event.target.value)}
                placeholder="Add an internal note"
                maxLength={5000}
              />
              <button className={styles.primary} disabled={saving || !noteText.trim()}>
                {saving ? 'Saving…' : 'Add note'}
              </button>
            </form>
          </section>
      </>
    </aside>
  );
}

/** The CRM's landing page: every active trek, with its leads by stage and what it has earned. */
function CrmTrekList({pipeline, summary, loading, onOpen}: {
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

function PipelineView({summary, funnel, trek, inquiries, loading, onBack, onOpen, onStatusChange}: {
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

/**
 * Asks which departure a lead is booked on and how many people are going.
 * Confirming adds them to that departure's booked seats, shown in the trek editor's Departures & Capacity section.
 */
function BookingPrompt({inquiry, saving = false, onConfirm, onCancel}: {
  inquiry: Inquiry;
  saving?: boolean;
  onConfirm: (booking: BookingChoice) => void;
  onCancel: () => void;
}) {
  const [departures, setDepartures] = useState<AdminDeparture[] | null>(null);
  const [error, setError] = useState('');
  const [departureId, setDepartureId] = useState(inquiry.departure || '');
  const [travelers, setTravelers] = useState(inquiry.group_size || 1);

  useEffect(() => {
    if (!inquiry.trip_slug) {
      setError('This lead is not linked to a trek, so it cannot be booked on a departure.');
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    api<Page<AdminDeparture>>(`/api/admin/treks/${inquiry.trip_slug}/departures`)
      .then(page => setDepartures(page.results.filter(item => item.status !== 'CANCELLED' && item.end_date >= today)))
      .catch(err => setError(err instanceof Error ? err.message : 'Unable to load departures.'));
  }, [inquiry.trip_slug]);

  const chosen = departures?.find(item => item.id === departureId);
  const tooMany = chosen ? travelers > chosen.available_seats && departureId !== inquiry.departure : false;

  return (
    <div className={styles.lostReasonPrompt} onClick={event => event.stopPropagation()}>
      <small>Book on which departure?</small>
      {error ? (
        <p className={styles.empty} style={{margin: '6px 0'}}>{error}</p>
      ) : !departures ? (
        <p className={styles.empty} style={{margin: '6px 0'}}>Loading departures…</p>
      ) : (
        <>
          <select value={departureId} onChange={event => setDepartureId(event.target.value)}>
            <option value="">Select a departure…</option>
            {departures.map(item => (
              <option key={item.id} value={item.id}>
                {date(item.start_date)} – {date(item.end_date)} · {item.available_seats} left
              </option>
            ))}
          </select>
          <label style={{display: 'block', marginTop: '6px', fontSize: '11px'}}>
            Travellers
            <input
              type="number"
              min={1}
              value={travelers}
              onChange={event => setTravelers(Math.max(1, Number(event.target.value) || 1))}
              style={{width: '100%', marginTop: '4px'}}
            />
          </label>
          {tooMany && <small style={{color: '#b3261e'}}>Only {chosen?.available_seats} seat(s) left on this departure.</small>}
        </>
      )}
      <div style={{display: 'flex', gap: '6px', marginTop: '6px'}}>
        <button
          type="button"
          className={styles.primary}
          disabled={!departureId || tooMany || saving}
          onClick={() => onConfirm({departureId, travelersCount: travelers})}
        >
          Confirm booking
        </button>
        <button type="button" className={styles.secondary} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function CustomerProfileModal({customer, loading, onClose, onOpenInquiry}: {
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

function GuideEditor({guide, saving, onChange, onClose, onSave, onUnpublish, onDelete, onDeleteComment}: {guide: TravelGuideDetail; saving: boolean; onChange: (guide: TravelGuideDetail) => void; onClose: () => void; onSave: (event: FormEvent) => void; onUnpublish: () => void; onDelete: () => void; onDeleteComment: (commentId: string) => void}) {
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingSection, setUploadingSection] = useState<number | null>(null);
  const [mediaError, setMediaError] = useState('');
  const sections = guide.sections?.length ? guide.sections : [emptySection()];
  const setSections = (next: GuideSection[]) => onChange({...guide, sections: next});
  const updateSection = (index: number, changes: Partial<GuideSection>) =>
    setSections(sections.map((section, i) => i === index ? {...section, ...changes} : section));
  function moveSection(index: number, step: number) {
    const target = index + step;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next);
  }
  function removeSection(index: number) {
    const section = sections[index];
    if ((section.heading || section.body || section.image_url) && !window.confirm(`Remove section ${index + 1}${section.heading ? ` “${section.heading}”` : ''}?`)) return;
    setSections(sections.length === 1 ? [emptySection()] : sections.filter((_, i) => i !== index));
  }
  const field = (key: keyof TravelGuideDetail) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    onChange({...guide, [key]: event.target.type === 'checkbox' ? (event.target as HTMLInputElement).checked : event.target.value});

  async function uploadImages(files: File[]) {
    const form = new FormData();
    files.forEach(file => form.append('files', file));
    return api<{files:Array<{id:string;url:string;name:string;size:number}>}>('/api/admin/guides/media', {method:'POST', body:form});
  }

  async function uploadHero(file?: File) {
    if (!file) return;
    setUploadingHero(true); setMediaError('');
    try {
      const result = await uploadImages([file]);
      if (result.files[0]) onChange({...guide, hero_image_url:result.files[0].url});
    } catch (error) { setMediaError(error instanceof Error ? error.message : 'The hero image could not be uploaded.'); }
    finally { setUploadingHero(false); }
  }

  async function uploadSectionImage(index: number, file?: File) {
    if (!file) return;
    setUploadingSection(index); setMediaError('');
    try {
      const result = await uploadImages([file]);
      if (result.files[0]) updateSection(index, {image_url: result.files[0].url});
    } catch (error) { setMediaError(error instanceof Error ? error.message : 'The section photo could not be uploaded.'); }
    finally { setUploadingSection(null); }
  }

  return (
    <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-label={guide.id ? 'Edit blog post' : 'Create blog post'}>
      <form className={`${styles.editor} ${styles.blogEditor}`} onSubmit={onSave}>
        <button type="button" className={styles.close} onClick={onClose}>×</button>
        <header className={styles.blogEditorHeader}>
          <div><p>Blog studio</p><h2>{guide.id ? guide.title : 'Create a new story'}</h2><span>Build a clear, visual post for the Dreamscape journal.</span></div>
          {guide.id && <div className={styles.blogStats}><span><strong>{guide.view_count || 0}</strong> Views</span><span><strong>{guide.comment_count || 0}</strong> Comments</span></div>}
        </header>

        <section className={styles.blogEditorSection}>
          <div className={styles.blogSectionHeading}><span>01</span><div><h3>Story details</h3><p>The post address is created automatically from the title.</p></div></div>
          <div className={styles.formGrid}>
            <label>Post title<input required value={guide.title} onChange={field('title')} maxLength={180} placeholder="A memorable day above the clouds" /></label>
            <label>Category
              <select value={guide.category || 'ADVENTURE'} onChange={field('category')}>
                <option value="ADVENTURE">Adventure</option>
                <option value="TRAVEL_TIPS">Travel Tips</option>
                <option value="CULTURE">Culture</option>
                <option value="NATURE">Nature</option>
                <option value="FOOD">Food</option>
                <option value="OTHER">Other</option>
              </select>
            </label>
          </div>
        </section>

        <section className={styles.blogEditorSection}>
          <div className={styles.blogSectionHeading}><span>02</span><div><h3>Cover photo</h3><p>The main photo shown on the blog card and at the top of the post.</p></div></div>
          <div className={styles.blogMediaColumns} data-single>
            <div className={styles.blogMediaPanel}>
              <div className={styles.blogMediaLabel}><strong>Hero image</strong><small>Shown on the blog card and at the top of the post</small></div>
              {guide.hero_image_url ? <div className={styles.blogHeroPreview}><img src={guide.hero_image_url} alt="Hero preview"/><button type="button" onClick={() => onChange({...guide, hero_image_url:''})}>Remove</button></div> : <div className={styles.blogImageEmpty}><span>◇</span><p>No hero image selected</p></div>}
              <label className={styles.blogUploadButton}><input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingHero} onChange={event => {void uploadHero(event.currentTarget.files?.[0]); event.currentTarget.value='';}}/>{uploadingHero ? 'Uploading…' : guide.hero_image_url ? 'Replace hero image' : 'Choose hero image'}</label>
            </div>
          </div>
          <p className={styles.blogUploadHint}>JPG, PNG or WebP · maximum 10 MB per image</p>
        </section>

        <section className={styles.blogEditorSection}>
          <div className={styles.blogSectionHeading}><span>03</span><div><h3>Article sections</h3><p>Tell the story part by part. Each section has its own heading, text and photo; readers see text and photo side by side.</p></div></div>
          {mediaError && <p className={styles.mediaError} role="alert">{mediaError}</p>}
          <ol className={styles.blogSections}>
            {sections.map((section, index) => (
              <li key={index} className={styles.blogSectionCard}>
                <div className={styles.blogSectionCardHead}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{section.heading || `Section ${index + 1}`}</strong>
                  <div>
                    <button type="button" onClick={() => moveSection(index, -1)} disabled={index === 0} aria-label={`Move section ${index + 1} up`}>↑</button>
                    <button type="button" onClick={() => moveSection(index, 1)} disabled={index === sections.length - 1} aria-label={`Move section ${index + 1} down`}>↓</button>
                    <button type="button" className={styles.danger} onClick={() => removeSection(index)} aria-label={`Remove section ${index + 1}`}>Remove</button>
                  </div>
                </div>
                <div className={styles.blogSectionCardBody}>
                  <div>
                    <label>Heading<input value={section.heading} maxLength={200} placeholder="e.g. The climb to Namche" onChange={event => updateSection(index, {heading: event.target.value})}/></label>
                    <label>Story<textarea value={section.body} maxLength={20000} rows={7} placeholder="Write this part of the story…" onChange={event => updateSection(index, {body: event.target.value})}/></label>
                    <small className={styles.blogUploadHint}>Leave a blank line between paragraphs. Start lines with “- ” for a bullet list.</small>
                  </div>
                  <div className={styles.blogSectionPhoto}>
                    {section.image_url ? (
                      <div className={styles.blogHeroPreview}><img src={section.image_url} alt={`Section ${index + 1} photo`}/><button type="button" onClick={() => updateSection(index, {image_url: '', image_caption: ''})}>Remove</button></div>
                    ) : (
                      <div className={styles.blogImageEmpty}><span>◇</span><p>No photo for this section</p></div>
                    )}
                    <label className={`${styles.blogUploadButton} ${styles.blogUploadSecondary}`}>
                      <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingSection !== null} onChange={event => {void uploadSectionImage(index, event.currentTarget.files?.[0]); event.currentTarget.value='';}}/>
                      {uploadingSection === index ? 'Uploading…' : section.image_url ? 'Replace photo' : 'Choose photo'}
                    </label>
                    {section.image_url && <label>Caption <small>(optional)</small><input value={section.image_caption} maxLength={300} placeholder="Where or when was this taken?" onChange={event => updateSection(index, {image_caption: event.target.value})}/></label>}
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <button type="button" className={styles.addDayDashedBtn} onClick={() => setSections([...sections, emptySection()])} disabled={sections.length >= 30}>
            + Add section
          </button>
        </section>

        <section className={`${styles.blogEditorSection} ${styles.blogPublishSection}`}>
          <div><h3>Ready to share?</h3><p>Drafts stay private. Published posts appear on the public blog.</p></div>
          <label className={styles.publishSwitch}>
            <input type="checkbox" checked={Boolean(guide.is_published)} onChange={field('is_published')} /><span aria-hidden="true"/><strong>{guide.is_published ? 'Published' : 'Draft'}</strong>
          </label>
        </section>

        {guide.id && <section className={`${styles.blogEditorSection} ${styles.editorComments}`}>
          <div className={styles.blogSectionHeading}><span>04</span><div><h3>Reader comments</h3><p>Review and remove comments from this post.</p></div></div>
          {(guide.comments || []).length ? guide.comments!.map(comment => <article key={comment.id}><div><strong>{comment.author_name}</strong><small>{date(comment.created_at)}</small></div><p>{comment.body}</p><button type="button" className={styles.danger} disabled={saving} onClick={() => onDeleteComment(comment.id)}>Remove</button></article>) : <p className={styles.blogGalleryEmpty}>No comments on this post yet.</p>}
        </section>}
        <footer>
          {guide.id && <button type="button" className={styles.danger} disabled={saving} onClick={onDelete}>Delete post</button>}
          {guide.id && guide.is_published && <button type="button" disabled={saving} onClick={onUnpublish}>Unpublish</button>}
          <span />
          <button type="button" onClick={onClose}>Cancel</button>
          <button className={styles.primary} disabled={saving || uploadingHero || uploadingSection !== null}>
            {saving ? 'Saving…' : guide.is_published ? 'Save & publish' : 'Save draft'}
          </button>
        </footer>
      </form>
    </div>
  );
}

const SEASONS_OPTIONS = [
  'Spring (Mar–May)',
  'Autumn (Sep–Nov)',
  'Spring & Autumn',
  'Monsoon / Summer (Jun–Aug)',
  'Winter (Dec–Feb)',
  'All Year Round',
  'Pre-Monsoon (Apr–May)',
  'Post-Monsoon (Oct–Nov)',
];

const MONTHS_OPTIONS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function BestSeasonsManager({
  items,
  onChange,
}: {
  items: string[];
  onChange: (newItems: string[]) => void;
}) {
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  const handleAddValue = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    if (!items.includes(trimmed)) {
      onChange([...items, trimmed]);
    }
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.tagGroup}>
      <div className={styles.tagGroupHeader}>
        <div className={styles.tagGroupTitle}>
          <span>⛅</span>
          <span>Best Seasons</span>
        </div>
        <span className={styles.tagGroupCount}>{items.length} selected</span>
      </div>

      {/* Selected Tags Display */}
      <div className={styles.tagContainer}>
        {items.length === 0 ? (
          <span style={{fontSize: '12px', color: '#97ab9f', fontStyle: 'italic', padding: '4px'}}>
            No seasons selected. Pick from the season or month dropdowns.
          </span>
        ) : (
          items.map((item, idx) => (
            <span key={idx} className={styles.tagItem}>
              {item}
              <button
                type="button"
                className={styles.tagRemoveBtn}
                onClick={() => handleRemove(idx)}
                title={`Remove ${item}`}
                aria-label={`Remove ${item}`}
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>

      {/* 2 Dropboxes: One for Season, One for Individual Month */}
      <div className={styles.tagAddRow} style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
        <select
          className={styles.formSelect}
          value={selectedSeason}
          onChange={e => {
            if (e.target.value) {
              handleAddValue(e.target.value);
              setSelectedSeason('');
            }
          }}
          style={{flex: 1, padding: '9px 12px', fontSize: '13px'}}
        >
          <option value="">+ Choose Season…</option>
          {SEASONS_OPTIONS.map(s => (
            <option key={s} value={s} disabled={items.includes(s)}>
              {items.includes(s) ? `✓ ${s}` : s}
            </option>
          ))}
        </select>

        <select
          className={styles.formSelect}
          value={selectedMonth}
          onChange={e => {
            if (e.target.value) {
              handleAddValue(e.target.value);
              setSelectedMonth('');
            }
          }}
          style={{flex: 1, padding: '9px 12px', fontSize: '13px'}}
        >
          <option value="">+ Choose Month…</option>
          {MONTHS_OPTIONS.map(m => (
            <option key={m} value={m} disabled={items.includes(m)}>
              {items.includes(m) ? `✓ ${m}` : m}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function TagListManager({
  label,
  icon,
  items,
  placeholder,
  onChange,
}: {
  label: string;
  icon?: string;
  items: string[];
  placeholder: string;
  onChange: (newItems: string[]) => void;
}) {
  const [inputVal, setInputVal] = useState('');

  const handleAdd = () => {
    const trimmed = inputVal.trim();
    if (!trimmed) return;
    if (!items.includes(trimmed)) {
      onChange([...items, trimmed]);
    }
    setInputVal('');
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.tagGroup}>
      <div className={styles.tagGroupHeader}>
        <div className={styles.tagGroupTitle}>
          {icon && <span>{icon}</span>}
          <span>{label}</span>
        </div>
        <span className={styles.tagGroupCount}>{items.length} items</span>
      </div>
      <div className={styles.tagContainer}>
        {items.length === 0 ? (
          <span style={{fontSize: '12px', color: '#97ab9f', fontStyle: 'italic', padding: '4px'}}>
            No items added yet. Type below to add.
          </span>
        ) : (
          items.map((item, idx) => (
            <span key={idx} className={styles.tagItem}>
              {item}
              <button
                type="button"
                className={styles.tagRemoveBtn}
                onClick={() => handleRemove(idx)}
                title="Remove item"
                aria-label={`Remove ${item}`}
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>
      <div className={styles.tagAddRow}>
        <input
          type="text"
          className={styles.tagAddInput}
          placeholder={placeholder}
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <button type="button" className={styles.tagAddBtn} onClick={handleAdd}>
          + Add
        </button>
      </div>
    </div>
  );
}

function AltitudeProfileGraph({
  days,
}: {
  days: AdminItineraryDay[];
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const pointsData = useMemo(() => {
    return days.map((d, idx) => {
      const elev = typeof d.elevation_meters === 'number'
        ? d.elevation_meters
        : (d.elevation_meters && !isNaN(Number(d.elevation_meters)) ? Number(d.elevation_meters) : null);
      return {
        idx,
        dayNumber: d.day_number || idx + 1,
        title: d.title || `Day ${d.day_number || idx + 1}`,
        stay: d.overnight_stay || '',
        elevation: elev,
        isAcclimatization: Boolean(d.is_acclimatization_day),
      };
    });
  }, [days]);

  const validElevations = useMemo(() => {
    return pointsData
      .map(p => p.elevation)
      .filter((e): e is number => typeof e === 'number' && e > 0);
  }, [pointsData]);

  const maxElev = validElevations.length > 0 ? Math.max(...validElevations) : 0;
  const minElev = validElevations.length > 0 ? Math.min(...validElevations) : 0;
  const firstElev = pointsData[0]?.elevation || minElev || 0;
  const acclimatizationCount = pointsData.filter(p => p.isAcclimatization).length;

  if (pointsData.length === 0) return null;

  // Graph canvas coordinate parameters
  const width = 800;
  const height = 210;
  const padLeft = 60;
  const padRight = 40;
  const padTop = 38;
  const padBottom = 38;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  // Y-axis scaling
  const effectiveMin = Math.max(0, Math.floor((minElev > 0 ? minElev - 400 : 0) / 500) * 500);
  const effectiveMax = Math.max(effectiveMin + 1500, Math.ceil((maxElev + 500) / 500) * 500);
  const yRange = effectiveMax - effectiveMin || 1;

  const getX = (i: number) => padLeft + (pointsData.length === 1 ? plotWidth / 2 : (i / (pointsData.length - 1)) * plotWidth);
  const getY = (elev: number | null) => {
    const val = elev ?? effectiveMin;
    return padTop + plotHeight - ((val - effectiveMin) / yRange) * plotHeight;
  };

  // Interpolate missing elevations for SVG path continuity
  const resolvedElevs = pointsData.map((p, i) => {
    if (p.elevation !== null && p.elevation > 0) return p.elevation;
    const prevValid = [...pointsData.slice(0, i)].reverse().find(x => x.elevation && x.elevation > 0)?.elevation;
    const nextValid = pointsData.slice(i + 1).find(x => x.elevation && x.elevation > 0)?.elevation;
    if (prevValid && nextValid) return (prevValid + nextValid) / 2;
    return prevValid || nextValid || effectiveMin;
  });

  const coords = resolvedElevs.map((elev, i) => ({
    x: getX(i),
    y: getY(elev),
    rawElevation: pointsData[i].elevation,
    ...pointsData[i]
  }));

  // Build smooth cubic bezier curve
  let pathD = '';
  if (coords.length > 0) {
    pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? i : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2 < coords.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
  }

  const baselineY = padTop + plotHeight;
  const areaD = pathD
    ? `${pathD} L ${coords[coords.length - 1].x} ${baselineY} L ${coords[0].x} ${baselineY} Z`
    : '';

  // Horizontal Grid Lines
  const gridSteps: number[] = [];
  const step = yRange > 4000 ? 1000 : 500;
  for (let val = effectiveMin; val <= effectiveMax; val += step) {
    gridSteps.push(val);
  }

  return (
    <div className={styles.altitudeGraphCard}>
      {/* Metric Summary Bar */}
      <div className={styles.altitudeGraphHeader}>
        <div className={styles.altitudeGraphTitle}>
          <span className={styles.altitudeGraphIcon}>🏔️</span>
          <div>
            <strong>Interactive Elevation Profile</strong>
            <p>Visual slope & daily altitude curve (updates dynamically as you edit)</p>
          </div>
        </div>

        <div className={styles.altitudePillRow}>
          <div className={styles.altitudeMetricPill}>
            <span className={styles.altitudePillLabel}>Max Peak</span>
            <span className={styles.altitudePillVal}>{maxElev > 0 ? `${maxElev.toLocaleString()} m` : '—'}</span>
          </div>
          <div className={styles.altitudeMetricPill}>
            <span className={styles.altitudePillLabel}>Start Alt</span>
            <span className={styles.altitudePillVal}>{firstElev > 0 ? `${firstElev.toLocaleString()} m` : '—'}</span>
          </div>
          <div className={styles.altitudeMetricPill}>
            <span className={styles.altitudePillLabel}>Acclimatization</span>
            <span className={styles.altitudePillVal}>{acclimatizationCount} {acclimatizationCount === 1 ? 'day' : 'days'}</span>
          </div>
        </div>
      </div>

      {validElevations.length === 0 ? (
        <div className={styles.altitudeEmptyState}>
          <span>⛰</span>
          <p><strong>No altitudes recorded yet</strong></p>
          <small>Enter elevation values (in meters) into the day fields below to render the altitude curve.</small>
        </div>
      ) : (
        <div className={styles.altitudeSvgWrap}>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className={styles.altitudeSvg}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="altitudeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2d6a4f" stopOpacity="0.45" />
                <stop offset="40%" stopColor="#52b788" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#d8f3dc" stopOpacity="0.03" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {gridSteps.map(stepVal => {
              const y = getY(stepVal);
              return (
                <g key={stepVal}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={width - padRight}
                    y2={y}
                    stroke="#e2ebe6"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={padLeft - 10}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill="#6c8c7d"
                    fontWeight="600"
                  >
                    {stepVal.toLocaleString()}m
                  </text>
                </g>
              );
            })}

            {/* Mountain Gradient Area */}
            {areaD && <path d={areaD} fill="url(#altitudeGradient)" />}

            {/* Mountain Curve Line */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#103b2c"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Baseline */}
            <line
              x1={padLeft}
              y1={baselineY}
              x2={width - padRight}
              y2={baselineY}
              stroke="#97ab9f"
              strokeWidth="1.5"
            />

            {/* Day Points */}
            {coords.map((pt, i) => {
              const isMax = pt.rawElevation === maxElev && maxElev > 0;
              const isHovered = hoveredIdx === i;
              const hasVal = pt.rawElevation !== null && pt.rawElevation > 0;

              return (
                <g
                  key={i}
                  style={{cursor: 'pointer'}}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Vertical Guide when hovered */}
                  {isHovered && (
                    <line
                      x1={pt.x}
                      y1={padTop}
                      x2={pt.x}
                      y2={baselineY}
                      stroke="#103b2c"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Day Label on X-axis */}
                  <text
                    x={pt.x}
                    y={baselineY + 18}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight={isHovered ? '800' : '650'}
                    fill={isHovered ? '#103b2c' : '#52796f'}
                  >
                    D{pt.dayNumber}
                  </text>

                  {/* Node Circle */}
                  {hasVal && (
                    <>
                      {(isMax || pt.isAcclimatization || isHovered) && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? 9 : 7}
                          fill={pt.isAcclimatization ? 'rgba(217, 119, 6, 0.2)' : isMax ? 'rgba(16, 59, 44, 0.2)' : 'rgba(45, 106, 79, 0.2)'}
                        />
                      )}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isMax ? 6 : pt.isAcclimatization ? 5.5 : isHovered ? 6 : 4.5}
                        fill={pt.isAcclimatization ? '#d97706' : isMax ? '#103b2c' : '#ffffff'}
                        stroke={pt.isAcclimatization ? '#b45309' : '#103b2c'}
                        strokeWidth="2.5"
                      />
                    </>
                  )}

                  {/* Top elevation callout label for Peak */}
                  {isMax && (
                    <g transform={`translate(${pt.x}, ${pt.y - 14})`}>
                      <rect
                        x="-38"
                        y="-16"
                        width="76"
                        height="18"
                        rx="9"
                        fill="#103b2c"
                      />
                      <text
                        x="0"
                        y="-4"
                        textAnchor="middle"
                        fontSize="9.5"
                        fontWeight="800"
                        fill="#ffffff"
                      >
                        ⛰ {maxElev}m
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Interactive Tooltip Card */}
          {hoveredIdx !== null && coords[hoveredIdx] && (
            <div
              className={styles.altitudeTooltip}
              style={{
                left: `${(coords[hoveredIdx].x / width) * 100}%`,
                top: `${(coords[hoveredIdx].y / height) * 100}%`,
              }}
            >
              <div className={styles.altitudeTooltipHead}>
                <strong>Day {coords[hoveredIdx].dayNumber}</strong>
                {coords[hoveredIdx].isAcclimatization && (
                  <span className={styles.altitudeAcclimBadge}>Acclimatization</span>
                )}
              </div>
              <div className={styles.altitudeTooltipTitle}>{coords[hoveredIdx].title}</div>
              {coords[hoveredIdx].stay && (
                <div className={styles.altitudeTooltipStay}>📍 {coords[hoveredIdx].stay}</div>
              )}
              <div className={styles.altitudeTooltipElev}>
                {coords[hoveredIdx].rawElevation
                  ? `⛰ ${Number(coords[hoveredIdx].rawElevation).toLocaleString()} m (${Math.round(Number(coords[hoveredIdx].rawElevation) * 3.28084).toLocaleString()} ft)`
                  : 'Elevation not set'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Pop-up card from the trek list's Schedule column: that trek's departures. */
function ScheduleModal({trek, onClose}: {
  trek: AdminTrek;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className={styles.modalBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label={`Schedule departures for ${trek.title}`}
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.scheduleModal}>
        <ScheduleBoard
          trek={trek}
          api={api}
          formatDate={date}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

type RowAction = {label: string; onSelect: () => void; danger?: boolean; disabled?: boolean};

/**
 * A table row's 3-dot actions menu (treks, blog posts). It is positioned
 * `fixed` from the button's rect so the table's scroll container can't clip
 * it; any scroll, resize, outside click or Escape closes it.
 */
function RowActionsMenu({label, actions}: {label: string; actions: RowAction[]}) {
  const [position, setPosition] = useState<{top: number; right: number} | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!position) return;
    const close = () => setPosition(null);
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !buttonRef.current?.contains(target)) close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [position]);

  function toggle() {
    if (position) {
      setPosition(null);
      return;
    }
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Open upward when the row sits near the bottom of the viewport.
    const menuHeight = actions.length * 38 + 14;
    const top = rect.bottom + menuHeight > window.innerHeight ? rect.top - menuHeight - 6 : rect.bottom + 6;
    setPosition({top, right: window.innerWidth - rect.right});
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={styles.kebabBtn}
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={Boolean(position)}
        aria-label={`Actions for ${label}`}
        title="More actions"
      >
        ⋮
      </button>
      {position && (
        <div ref={menuRef} className={styles.kebabMenu} role="menu" style={{top: position.top, right: position.right}}>
          {actions.map(action => (
            <button
              key={action.label}
              type="button"
              role="menuitem"
              disabled={action.disabled}
              className={action.danger ? `${styles.kebabItem} ${styles.kebabItemDanger}` : styles.kebabItem}
              onClick={() => { setPosition(null); action.onSelect(); }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

function TrekManagementView({
  treks,
  loading,
  query,
  statusFilter,
  oversubscribed,
  onQueryChange,
  onStatusFilterChange,
  onSelectTrek,
  onToggleActive,
  onToggleFeatured,
  onDeleteTrek,
  onSchedule,
}: {
  treks: AdminTrek[];
  loading: boolean;
  query: string;
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'FEATURED';
  /** Oversubscribed departure count per trek slug. */
  oversubscribed: Record<string, number>;
  onQueryChange: (val: string) => void;
  onStatusFilterChange: (val: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'FEATURED') => void;
  onSelectTrek: (slug: string) => void;
  onToggleActive: (trek: AdminTrek) => void;
  onToggleFeatured: (trek: AdminTrek) => void;
  onDeleteTrek: (trek: AdminTrek) => void;
  onSchedule: (trek: AdminTrek) => void;
}) {
  const filtered = useMemo(() => {
    return treks.filter(t => {
      if (statusFilter === 'ACTIVE' && !t.is_active) return false;
      if (statusFilter === 'INACTIVE' && t.is_active) return false;
      if (statusFilter === 'FEATURED' && !t.is_featured) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const titleMatch = t.title.toLowerCase().includes(q);
        const slugMatch = t.slug.toLowerCase().includes(q);
        const destMatch = (t.destination_name || '').toLowerCase().includes(q);
        const catMatch = (t.category_name || '').toLowerCase().includes(q);
        if (!titleMatch && !slugMatch && !destMatch && !catMatch) return false;
      }
      return true;
    });
  }, [treks, query, statusFilter]);

  return (
    <div className={styles.tablePanel}>
      <div className={styles.trekHeaderBar}>
        <div className={styles.trekFilters}>
          <input
            type="text"
            className={styles.trekSearchInput}
            placeholder="Search treks by title, destination, category..."
            value={query}
            onChange={e => onQueryChange(e.target.value)}
          />
          <select
            className={styles.trekStatusSelect}
            value={statusFilter}
            onChange={e => onStatusFilterChange(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE' | 'FEATURED')}
          >
            <option value="ALL">All Statuses ({treks.length})</option>
            <option value="FEATURED">★ Featured (Top 5) ({treks.filter(t => t.is_featured).length})</option>
            <option value="ACTIVE">Active ({treks.filter(t => t.is_active).length})</option>
            <option value="INACTIVE">Inactive ({treks.filter(t => !t.is_active).length})</option>
          </select>
        </div>

        <button type="button" className={styles.trekAddBtn} onClick={() => onSelectTrek('new')}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Trek
        </button>
      </div>

      {loading ? (
        <p className={styles.empty}>Loading treks catalog…</p>
      ) : filtered.length === 0 ? (
        <div style={{textAlign: 'center', padding: '48px 20px', color: '#6d8276'}}>
          <p style={{fontSize: '15px', fontWeight: 600, marginBottom: '12px'}}>{treks.length ? 'No treks match these filters.' : 'No treks in the CMS yet.'}</p>
          <button type="button" className={styles.primary} onClick={() => onSelectTrek('new')}>
            + Create a new trek
          </button>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.modernTable}>
            <thead>
              <tr>
                <th>Trek Details</th>
                <th>Destination & Category</th>
                <th>Duration & Altitude</th>
                <th>Starting Price</th>
                <th>Featured (Top 5)</th>
                <th>Status</th>
                <th>Schedule</th>
                <th style={{textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(trek => (
                <tr key={trek.id}>
                  <td>
                    <div className={styles.trekRowCell}>
                      <img
                        src={getTrekImage(trek.slug, trek.destination_slug, trek.hero_image_url)}
                        alt={trek.title}
                        className={styles.trekThumb}
                      />
                      <div>
                        <button
                          type="button"
                          className={styles.trekTitleLink}
                          onClick={() => onSelectTrek(trek.slug)}
                          title="Click to open editable trek details"
                        >
                          {trek.title}
                        </button>
                        <small style={{display: 'block', fontSize: '11px', color: '#6d8276'}}>/{trek.slug}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{fontWeight: 600, color: '#133e2f', display: 'block'}}>
                      {trek.destination_name || 'Nepal Himalayas'}
                    </span>
                    <small style={{fontSize: '11px', color: '#6d8276'}}>
                      {trek.category_name || 'Classic Trekking'}
                    </small>
                  </td>
                  <td>
                    <span style={{fontWeight: 600, color: '#133e2f'}}>{trek.duration_days} Days</span>
                    {trek.altitude_max_meters ? (
                      <small style={{display: 'block', fontSize: '11px', color: '#6d8276'}}>
                        {trek.altitude_max_meters.toLocaleString()} m
                      </small>
                    ) : null}
                  </td>
                  <td>
                    <strong style={{color: '#133e2f', fontSize: '13px'}}>
                      ${Number(trek.starting_price_usd).toLocaleString()}
                    </strong>
                    <small style={{display: 'block', fontSize: '10px', color: '#8aa093'}}>USD</small>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={trek.is_featured ? styles.featuredBadgeActive : styles.featuredBadgeInactive}
                      onClick={() => onToggleFeatured(trek)}
                      title={trek.is_featured ? 'Featured in Home Page Trending Top 5 (Click to unfeature)' : 'Click to feature in Home Page Trending Top 5'}
                    >
                      {trek.is_featured ? '★ FEATURED' : '☆ Standard'}
                    </button>
                  </td>
                  <td>
                    <span className={trek.is_active ? styles.statusPillActive : styles.statusPillInactive}>
                      {trek.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.scheduleBtn}
                      onClick={() => onSchedule(trek)}
                      title="Schedule departures and manage seat capacity"
                    >
                      Schedule
                    </button>
                    {oversubscribed[trek.slug] ? (
                      <button
                        type="button"
                        className={styles.statBadgeRed}
                        style={{display: 'block', marginTop: '6px', border: 0, cursor: 'pointer'}}
                        onClick={() => onSchedule(trek)}
                        title="Open this trek's departures to fix capacity"
                      >
                        {oversubscribed[trek.slug]} oversubscribed
                      </button>
                    ) : null}
                  </td>
                  <td>
                    <div className={styles.actionBtnGroup}>
                      <RowActionsMenu label={trek.title} actions={[
                        {label: 'Edit trek', onSelect: () => onSelectTrek(trek.slug)},
                        {label: trek.is_active ? 'Deactivate' : 'Activate', onSelect: () => onToggleActive(trek)},
                        {label: trek.is_featured ? 'Remove from featured' : 'Mark as featured', onSelect: () => onToggleFeatured(trek)},
                        {label: 'Delete trek', onSelect: () => onDeleteTrek(trek), danger: true},
                      ]}/>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TrekFullDetailEditor({
  trek,
  slug,
  destinations,
  categories,
  formatDate,
  saving,
  loading,
  onMessage,
  onChange,
  onBack,
  onSave,
  onToggleActive,
  onToggleFeatured,
}: {
  trek: AdminTrekDetail;
  slug: string;
  destinations: DestinationOption[];
  categories: CategoryOption[];
  formatDate: (value?: string | null) => string;
  saving: boolean;
  loading: boolean;
  onMessage: (text: string) => void;
  onChange: React.Dispatch<React.SetStateAction<AdminTrekDetail | null>>;
  onBack: () => void;
  onSave: (event: FormEvent) => void;
  onToggleActive: () => void;
  onToggleFeatured: () => void;
}) {
  const [showAltitudeGraph, setShowAltitudeGraph] = useState(() =>
    trek.itinerary_days.some(d => d.elevation_meters !== null && d.elevation_meters !== '' && Number(d.elevation_meters) > 0)
  );
  const [isGraphExpanded, setIsGraphExpanded] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [mediaError, setMediaError] = useState('');

  const uploadImages = async (files: File[]) => {
    const form = new FormData();
    files.forEach(file => form.append('files', file));
    return api<{files: Array<{id: string; url: string; name: string; size: number}>}>('/api/admin/treks/media', {
      method: 'POST',
      body: form,
    });
  };

  const handleCoverUpload = async (file?: File) => {
    if (!file) return;
    setMediaError('');
    setUploadingCover(true);
    try {
      const result = await uploadImages([file]);
      const uploaded = result.files[0];
      if (uploaded) onChange(prev => prev ? {...prev, hero_image_url: uploaded.url} : null);
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : 'The cover image could not be uploaded.');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleGalleryUpload = async (files: File[]) => {
    if (!files.length) return;
    setMediaError('');
    setUploadingGallery(true);
    try {
      const result = await uploadImages(files);
      const urls = result.files.map(file => file.url);
      onChange(prev => prev ? {...prev, gallery_images: [...(prev.gallery_images || []), ...urls]} : null);
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : 'The gallery images could not be uploaded.');
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleTitleChange = (val: string) => {
    if (!trek.id) {
      const autoSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      onChange(prev => prev ? {...prev, title: val, slug: autoSlug} : null);
    } else {
      onChange(prev => prev ? {...prev, title: val} : null);
    }
  };

  const handleAddDay = () => {
    const nextDayNumber = trek.itinerary_days.length + 1;
    const newDay: AdminItineraryDay = {
      day_number: nextDayNumber,
      title: `Day ${nextDayNumber}: Trail Segment`,
      description: '',
      overnight_stay: '',
      elevation_meters: '',
      accommodation_type: 'TEAHOUSE',
      is_acclimatization_day: false,
    };
    onChange(prev => prev ? {...prev, itinerary_days: [...prev.itinerary_days, newDay]} : null);
  };

  const handleUpdateDay = <K extends keyof AdminItineraryDay>(index: number, field: K, value: AdminItineraryDay[K]) => {
    onChange(prev => {
      if (!prev) return null;
      const updatedDays = [...prev.itinerary_days];
      updatedDays[index] = {...updatedDays[index], [field]: value};
      return {...prev, itinerary_days: updatedDays};
    });
  };

  const handleRemoveDay = (index: number) => {
    onChange(prev => {
      if (!prev) return null;
      const filtered = prev.itinerary_days.filter((_, i) => i !== index);
      // Re-number remaining days
      const renumbered = filtered.map((day, i) => ({...day, day_number: i + 1}));
      return {...prev, itinerary_days: renumbered};
    });
  };

  if (loading) {
    return (
      <div className={styles.tablePanel} style={{textAlign: 'center', padding: '60px 20px'}}>
        <p className={styles.empty}>Loading comprehensive trek details & itinerary…</p>
      </div>
    );
  }

  const currentDest = destinations.find(d => d.id === trek.destination);
  const currentCat = categories.find(c => c.id === trek.category);

  return (
    <form className={styles.detailContainer} onSubmit={onSave}>
      {/* Top Breadcrumb & Action Bar */}
      <div className={styles.detailTopNav}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          ← Back to Trek Management
        </button>

        <div className={styles.detailTopActions}>
          {trek.slug && trek.id && (
            <Link
              href={`/treks/${trek.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.previewPublicBtn}
            >
              Public View ↗
            </Link>
          )}

          <button
            type="button"
            className={trek.is_featured ? styles.featuredBadgeActive : styles.featuredBadgeInactive}
            onClick={onToggleFeatured}
            title="Toggle featured status"
          >
            {trek.is_featured ? '★ FEATURED (Top 5)' : '☆ Standard Trek'}
          </button>

          <button
            type="button"
            className={trek.is_active ? styles.statusPillActive : styles.statusPillInactive}
            onClick={onToggleActive}
            title="Toggle active status"
          >
            {trek.is_active ? 'ACTIVE' : 'INACTIVE'}
          </button>

          <button
            type="submit"
            className={styles.saveTrekBtn}
            disabled={saving || !trek.title || !trek.destination || !trek.category}
          >
            {saving ? 'Saving Details…' : trek.id ? 'Save Trek Changes' : 'Publish New Trek'}
          </button>
        </div>
      </div>

      {/* Hero Preview Banner */}
      <div className={styles.detailHeroBanner}>
        <img
          src={getTrekImage(trek.slug, currentDest?.slug || trek.destination_slug, trek.hero_image_url)}
          alt={trek.title || 'Trek preview'}
          className={styles.detailHeroImg}
        />
        <div className={styles.detailHeroInfo}>
          <div className={styles.detailHeroKicker}>
            {currentDest?.name || trek.destination_name || 'NEPAL'} · {currentCat?.name || trek.category_name || 'EXPEDITION'}
          </div>
          <h2 className={styles.detailHeroTitle}>
            {trek.title || 'Untitled Expedition Trek'}
          </h2>
          <div className={styles.detailHeroMeta}>
            <span className={styles.detailHeroMetaItem}>
              <strong>/{trek.slug || 'trek-slug'}</strong>
            </span>
            <span className={styles.detailHeroMetaItem}>
              ⏱ <strong>{trek.duration_days} Days</strong>
            </span>
            {trek.altitude_max_meters ? (
              <span className={styles.detailHeroMetaItem}>
                ⛰ <strong>{Number(trek.altitude_max_meters).toLocaleString()} m</strong> Max Elevation
              </span>
            ) : null}
            <span className={styles.detailHeroMetaItem}>
              🏷 <strong>${Number(trek.starting_price_usd || 0).toLocaleString()} USD</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Section 1: Trip Essentials & Logistics */}
      <section className={styles.detailCard}>
        <div className={styles.detailCardHead}>
          <div className={styles.detailCardTitleWrap}>
            <span className={styles.sectionBadge}>01</span>
            <div>
              <h3 className={styles.detailCardTitle}>Trip Essentials & Logistics</h3>
              <p className={styles.detailCardSub}>Core specifications, classification, altitude, and pricing</p>
            </div>
          </div>
        </div>

        <div className={styles.formGrid}>
          {/* Trek Title (Full width) */}
          <div className={styles.formFieldFull}>
            <label className={styles.formLabel}>
              <span>Trek Title</span>
              <span className={styles.formLabelHint}>Required</span>
            </label>
            <input
              required
              className={styles.formInput}
              value={trek.title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="e.g. Everest Base Camp Classic"
              maxLength={255}
            />
          </div>

          {/* Destination Region */}
          <div className={styles.formField}>
            <label className={styles.formLabel}>
              <span>Destination Region</span>
              <span className={styles.formLabelHint}>Country / Mountain Range</span>
            </label>
            <select
              className={styles.formSelect}
              value={trek.destination}
              required
              onChange={e => onChange(prev => prev ? {...prev, destination: e.target.value} : null)}
            >
              {destinations.length > 0 ? (
                destinations.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))
              ) : (
                <option value="">Nepal Himalayas</option>
              )}
            </select>
          </div>

          {/* Activity Category */}
          <div className={styles.formField}>
            <label className={styles.formLabel}>
              <span>Activity Category</span>
              <span className={styles.formLabelHint}>Trek style / Expedition type</span>
            </label>
            <select
              className={styles.formSelect}
              value={trek.category}
              required
              onChange={e => onChange(prev => prev ? {...prev, category: e.target.value} : null)}
            >
              {categories.length > 0 ? (
                categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))
              ) : (
                <option value="">Classic Trekking</option>
              )}
            </select>
          </div>

          {/* Duration */}
          <div className={styles.formField}>
            <label className={styles.formLabel}>
              <span>Duration (Days)</span>
              <span className={styles.formLabelHint}>Total expedition length</span>
            </label>
            <div className={styles.inputAffixWrapper}>
              <input
                type="number"
                min={1}
                max={120}
                required
                className={styles.formInput}
                value={trek.duration_days}
                onChange={e => onChange(prev => prev ? {...prev, duration_days: Number(e.target.value)} : null)}
              />
              <span className={styles.inputSuffix}>Days</span>
            </div>
          </div>

          {/* Max Altitude */}
          <div className={styles.formField}>
            <label className={styles.formLabel}>
              <span>Max Altitude</span>
              <span className={styles.formLabelHint}>Highest elevation point</span>
            </label>
            <div className={styles.inputAffixWrapper}>
              <input
                type="number"
                min={0}
                max={8848}
                className={styles.formInput}
                value={trek.altitude_max_meters ?? ''}
                onChange={e => onChange(prev => prev ? {...prev, altitude_max_meters: e.target.value === '' ? '' : Number(e.target.value)} : null)}
                placeholder="e.g. 5364"
              />
              <span className={styles.inputSuffix}>Meters (m)</span>
            </div>
          </div>

          {/* Starting Price */}
          <div className={styles.formField}>
            <label className={styles.formLabel}>
              <span>Starting Price (USD)</span>
              <span className={styles.formLabelHint}>Base package per person</span>
            </label>
            <div className={styles.inputAffixWrapper}>
              <span className={styles.inputPrefix}>$</span>
              <input
                type="number"
                min={0}
                step="any"
                required
                className={styles.formInput}
                value={trek.starting_price_usd}
                onChange={e => onChange(prev => prev ? {...prev, starting_price_usd: e.target.value === '' ? '' : Number(e.target.value)} : null)}
                placeholder="2500"
              />
              <span className={styles.inputSuffix}>USD</span>
            </div>
          </div>

          {/* Difficulty Grade */}
          <div className={styles.formField}>
            <label className={styles.formLabel}>
              <span>Difficulty Grade</span>
              <span className={styles.formLabelHint}>Fitness & technical rating</span>
            </label>
            <select
              className={styles.formSelect}
              value={trek.difficulty_grade}
              onChange={e => onChange(prev => prev ? {...prev, difficulty_grade: e.target.value} : null)}
            >
              {difficultyGrades.map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>

          {/* Group Size Range */}
          <div className={styles.formFieldFull}>
            <label className={styles.formLabel}>
              <span>Group Size Range</span>
              <span className={styles.formLabelHint}>Min / Max travelers</span>
            </label>
            <div className={styles.rangeGroup}>
              <div className={styles.inputAffixWrapper}>
                <input
                  type="number"
                  min={1}
                  max={50}
                  className={styles.formInput}
                  value={trek.min_group_size ?? 1}
                  onChange={e => onChange(prev => prev ? {...prev, min_group_size: Number(e.target.value)} : null)}
                  placeholder="1"
                />
                <span className={styles.inputSuffix}>Min</span>
              </div>
              <span className={styles.rangeSeparator}>to</span>
              <div className={styles.inputAffixWrapper}>
                <input
                  type="number"
                  min={1}
                  max={50}
                  className={styles.formInput}
                  value={trek.max_group_size ?? 14}
                  onChange={e => onChange(prev => prev ? {...prev, max_group_size: Number(e.target.value)} : null)}
                  placeholder="14"
                />
                <span className={styles.inputSuffix}>Max</span>
              </div>
            </div>
          </div>

          {/* Overview & Route Narrative (Full width) */}
          <div className={styles.formFieldFull}>
            <label className={styles.formLabel}>
              <span>Overview & Route Narrative</span>
              <span className={styles.formLabelHint}>Comprehensive expedition description for public catalog</span>
            </label>
            <textarea
              required
              className={styles.formTextarea}
              value={trek.overview}
              onChange={e => onChange(prev => prev ? {...prev, overview: e.target.value} : null)}
              placeholder="Comprehensive description of the route, terrain, acclimatization profile, local Sherpa culture, and panoramic views..."
              rows={5}
            />
          </div>
        </div>
      </section>

      {/* Section 2: Media & Photo Gallery */}
      <section className={styles.detailCard}>
        <div className={styles.detailCardHead}>
          <div className={styles.detailCardTitleWrap}>
            <span className={styles.sectionBadge}>02</span>
            <div>
              <h3 className={styles.detailCardTitle}>Media & Photo Gallery</h3>
              <p className={styles.detailCardSub}>Main cover hero imagery and trail photo gallery collection</p>
            </div>
          </div>
        </div>

        <div className={styles.formGrid}>
          {/* Main Hero / Cover Image */}
          <div className={styles.formFieldFull}>
            <label className={styles.formLabel}>
              <span>Main Hero / Cover Image</span>
              <span className={styles.formLabelHint}>Primary banner image for trek hero and catalog cards</span>
            </label>
            <div className={styles.uploadRow}>
              <label className={styles.uploadButton}>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className={styles.visuallyHiddenInput}
                  disabled={uploadingCover}
                  onChange={event => {
                    void handleCoverUpload(event.currentTarget.files?.[0]);
                    event.currentTarget.value = '';
                  }}
                />
                {uploadingCover ? 'Uploading cover…' : 'Upload cover image'}
              </label>
              {trek.hero_image_url && (
                <button
                  type="button"
                  className={styles.secondaryMediaButton}
                  onClick={() => onChange(prev => prev ? {...prev, hero_image_url: ''} : null)}
                >
                  Remove custom cover
                </button>
              )}
              <span className={styles.uploadHint}>JPG, PNG or WebP · maximum 10 MB</span>
            </div>
            <div className={styles.inputAffixWrapper}>
              <span className={styles.inputPrefix}>Cover URL</span>
              <input
                type="text"
                className={styles.formInput}
                value={trek.hero_image_url || ''}
                onChange={e => onChange(prev => prev ? {...prev, hero_image_url: e.target.value} : null)}
                placeholder="Upload an image above or paste an existing image URL"
              />
            </div>

            <div className={styles.coverImagePreviewWrap}>
              <img
                src={getTrekImage(trek.slug, currentDest?.slug || trek.destination_slug, trek.hero_image_url)}
                alt="Main cover preview"
                className={styles.coverImageThumb}
              />
              <div>
                <strong style={{fontSize: '13.5px', color: '#103b2c', display: 'block'}}>
                  {trek.hero_image_url ? 'Custom Cover Image Active' : 'Curated Destination Default Active'}
                </strong>
                <p style={{fontSize: '12px', color: '#688275', margin: '4px 0 0'}}>
                  {trek.hero_image_url
                    ? 'This image will be displayed across trek catalog cards, search listings, and the detail hero.'
                    : 'No custom image URL set. The system is displaying the curated destination default.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Photos Sub-section */}
        <div style={{marginTop: '28px', borderTop: '1px solid #edf3ef', paddingTop: '20px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px'}}>
            <div>
              <h4 style={{fontSize: '14.5px', fontWeight: 750, color: '#103b2c', margin: 0}}>
                Trail & Mountain Gallery Photos ({trek.gallery_images?.length || 0})
              </h4>
              <p style={{fontSize: '12px', color: '#6d8579', margin: '2px 0 0'}}>
                Interactive photo moments for prospective travelers
              </p>
            </div>
          </div>

          <div className={styles.galleryUploadBar}>
            <label className={styles.uploadButton}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className={styles.visuallyHiddenInput}
                disabled={uploadingGallery}
                onChange={event => {
                  void handleGalleryUpload(Array.from(event.currentTarget.files || []));
                  event.currentTarget.value = '';
                }}
              />
              {uploadingGallery ? 'Uploading gallery…' : 'Upload gallery images'}
            </label>
            <span className={styles.uploadHint}>Select up to 12 images per upload</span>
          </div>
          {mediaError && <p className={styles.mediaError} role="alert">{mediaError}</p>}

          <div className={styles.mediaGrid}>
            {(trek.gallery_images || []).map((imgUrl, idx) => (
              <div key={idx} className={styles.galleryCard}>
                <img
                  src={imgUrl}
                  alt={`Gallery photo ${idx + 1}`}
                  className={styles.galleryCardImg}
                  onError={e => {
                    (e.target as HTMLImageElement).src = '/images/151-31-imgNepalHimalayanRangeWithAmaDablam.png';
                  }}
                />
                <div className={styles.galleryCardBody}>
                  <input
                    type="text"
                    className={styles.galleryCardInput}
                    value={imgUrl}
                    onChange={e => {
                      const updated = [...(trek.gallery_images || [])];
                      updated[idx] = e.target.value;
                      onChange(prev => prev ? {...prev, gallery_images: updated} : null);
                    }}
                    placeholder="Image URL"
                  />
                  <div className={styles.galleryCardFoot}>
                    <span style={{fontSize: '11px', color: '#768e82', fontWeight: 600}}>
                      Photo {idx + 1}
                    </span>
                    <button
                      type="button"
                      className={styles.galleryCardDeleteBtn}
                      onClick={() => {
                        const updated = (trek.gallery_images || []).filter((_, i) => i !== idx);
                        onChange(prev => prev ? {...prev, gallery_images: updated} : null);
                      }}
                      title="Remove this photo from gallery"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Gallery Photo Card */}
            <div className={styles.addGalleryCard}>
              <strong style={{fontSize: '13px', color: '#154a36', textAlign: 'center'}}>
                + Add image by URL
              </strong>
              <input
                type="text"
                id="new-gallery-image-input"
                className={styles.galleryCardInput}
                placeholder="Paste image URL or path..."
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const target = e.currentTarget;
                    const val = target.value.trim();
                    if (val) {
                      onChange(prev => prev ? {...prev, gallery_images: [...(prev.gallery_images || []), val]} : null);
                      target.value = '';
                    }
                  }
                }}
              />
              <button
                type="button"
                className={styles.tagAddBtn}
                style={{width: '100%', padding: '8px'}}
                onClick={() => {
                  const input = document.getElementById('new-gallery-image-input') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    const val = input.value.trim();
                    onChange(prev => prev ? {...prev, gallery_images: [...(prev.gallery_images || []), val]} : null);
                    input.value = '';
                  }
                }}
              >
                + Add Photo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Seasons, Inclusions, Exclusions & Packing List */}
      <section className={styles.detailCard}>
        <div className={styles.detailCardHead}>
          <div className={styles.detailCardTitleWrap}>
            <span className={styles.sectionBadge}>03</span>
            <div>
              <h3 className={styles.detailCardTitle}>Seasons, Inclusions, Exclusions & Packing List</h3>
              <p className={styles.detailCardSub}>Comprehensive preparation lists and gear guidance for travelers</p>
            </div>
          </div>
        </div>

        <div className={styles.tagListGrid}>
          <BestSeasonsManager
            items={trek.best_seasons}
            onChange={newItems => onChange(prev => prev ? {...prev, best_seasons: newItems} : null)}
          />

          <TagListManager
            label="What's Included"
            icon="✓"
            items={trek.inclusions}
            placeholder="e.g. Airport transfers, permits & TIMS card"
            onChange={newItems => onChange(prev => prev ? {...prev, inclusions: newItems} : null)}
          />

          <TagListManager
            label="What's Not Included"
            icon="✕"
            items={trek.exclusions}
            placeholder="e.g. International flights & travel insurance"
            onChange={newItems => onChange(prev => prev ? {...prev, exclusions: newItems} : null)}
          />

          <TagListManager
            label="Gear & Packing List"
            icon="🎒"
            items={trek.packing_list}
            placeholder="e.g. 4-season sleeping bag (-15°C rated)"
            onChange={newItems => onChange(prev => prev ? {...prev, packing_list: newItems} : null)}
          />
        </div>
      </section>

      {/* Section 4: Day-by-Day Itinerary Builder */}
      <section className={styles.detailCard}>
        <div className={styles.detailCardHead}>
          <div className={styles.detailCardTitleWrap}>
            <span className={styles.sectionBadge}>04</span>
            <div>
              <h3 className={styles.detailCardTitle}>
                Day-by-Day Itinerary Builder ({trek.itinerary_days.length} Days)
              </h3>
              <p className={styles.detailCardSub}>
                Detailed trail breakdown with overnight stays, accommodations, and acclimatization markers
              </p>
            </div>
          </div>

          <div style={{display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap'}}>
            {/* Minimalist Altitude / Elevation Mode Toggle */}
            <label className={styles.miniToggleLabel} title="Toggle daily altitude editing fields">
              <input
                type="checkbox"
                checked={showAltitudeGraph}
                onChange={e => {
                  setShowAltitudeGraph(e.target.checked);
                  if (!e.target.checked) setIsGraphExpanded(false);
                }}
              />
              <span className={styles.miniToggleSlider} />
              <span className={styles.miniToggleText}>
                <span>⛰</span> Elevation Mode
              </span>
            </label>

            {/* Dropdown button to toggle Graph (Default Closed) */}
            {showAltitudeGraph && (
              <button
                type="button"
                className={isGraphExpanded ? styles.graphDropdownBtnActive : styles.graphDropdownBtn}
                onClick={() => setIsGraphExpanded(prev => !prev)}
                title="Expand / collapse live mountain elevation profile graph"
              >
                <span>📈</span>
                <span>{isGraphExpanded ? 'Hide Altitude Graph' : 'View Altitude Graph'}</span>
                <span className={styles.dropdownChevron}>{isGraphExpanded ? '▲' : '▼'}</span>
              </button>
            )}

            <button type="button" className={styles.primary} onClick={handleAddDay}>
              + Add Day
            </button>
          </div>
        </div>

        {/* Live Interactive Altitude Profile Graph Preview (shown ONLY when Elevation mode is active AND dropdown is opened) */}
        {showAltitudeGraph && isGraphExpanded && (
          <AltitudeProfileGraph
            days={trek.itinerary_days}
          />
        )}

        <div className={styles.itineraryContainer}>
          {trek.itinerary_days.map((day, idx) => (
            <div key={idx} className={styles.dayCard}>
              <div className={styles.dayCardHead}>
                <div className={styles.dayHeadLeft}>
                  <span className={styles.dayNumberBadge}>
                    DAY {String(day.day_number).padStart(2, '0')}
                  </span>
                  <strong style={{fontSize: '14.5px', color: '#103b2c', fontWeight: 750}}>
                    {day.title || `Day ${day.day_number}`}
                  </strong>
                  {showAltitudeGraph && day.elevation_meters && (
                    <span className={styles.dayAltBadge}>
                      ⛰ {Number(day.elevation_meters).toLocaleString()}m
                    </span>
                  )}
                </div>

                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <label className={styles.acclimatizationPill}>
                    <input
                      type="checkbox"
                      checked={day.is_acclimatization_day}
                      onChange={e => handleUpdateDay(idx, 'is_acclimatization_day', e.target.checked)}
                    />
                    ⛰ Acclimatization Day
                  </label>

                  {trek.itinerary_days.length > 1 && (
                    <button
                      type="button"
                      className={styles.dayDeleteBtn}
                      onClick={() => handleRemoveDay(idx)}
                      title="Remove this day from itinerary"
                    >
                      Remove Day
                    </button>
                  )}
                </div>
              </div>

              {/* Grid layout adjusts dynamically based on showAltitudeGraph */}
              <div className={showAltitudeGraph ? styles.dayFieldsGridWithElevation : styles.dayFieldsGrid}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>
                    <span>Day Title</span>
                  </label>
                  <input
                    type="text"
                    required
                    className={styles.formInput}
                    value={day.title}
                    onChange={e => handleUpdateDay(idx, 'title', e.target.value)}
                    placeholder="e.g. Trek to Namche Bazaar"
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>
                    <span>Overnight Stay</span>
                  </label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={day.overnight_stay}
                    onChange={e => handleUpdateDay(idx, 'overnight_stay', e.target.value)}
                    placeholder="e.g. Namche Bazaar"
                  />
                </div>

                {/* Altitude Editing Field (Available when Altitude Graph addon is activated) */}
                {showAltitudeGraph && (
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>
                      <span>Elevation</span>
                    </label>
                    <div className={styles.inputAffixWrapper}>
                      <input
                        type="number"
                        min={0}
                        max={8848}
                        className={styles.formInput}
                        value={day.elevation_meters ?? ''}
                        onChange={e => handleUpdateDay(idx, 'elevation_meters', e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="3440"
                      />
                      <span className={styles.inputSuffix}>m</span>
                    </div>
                  </div>
                )}

                <div className={styles.formField}>
                  <label className={styles.formLabel}>
                    <span>Accommodation</span>
                  </label>
                  <select
                    className={styles.formSelect}
                    value={day.accommodation_type}
                    onChange={e => handleUpdateDay(idx, 'accommodation_type', e.target.value)}
                  >
                    <option value="TEAHOUSE">Teahouse / Lodge</option>
                    <option value="LODGE">Luxury Lodge</option>
                    <option value="CAMPING">Tented Camp</option>
                    <option value="HOTEL">Hotel</option>
                    <option value="HOMESTAY">Homestay</option>
                  </select>
                </div>
              </div>

              <div className={styles.formField} style={{marginTop: '4px'}}>
                <label className={styles.formLabel}>
                  <span>Trail Notes & Description</span>
                </label>
                <textarea
                  className={styles.dayDescriptionInput}
                  value={day.description}
                  onChange={e => handleUpdateDay(idx, 'description', e.target.value)}
                  placeholder="Detailed trail notes, river crossings, suspension bridges, pine forest ascents, and mountain panoramas..."
                />
              </div>
            </div>
          ))}

          <button type="button" className={styles.addDayDashedBtn} onClick={handleAddDay}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            + Add Day {trek.itinerary_days.length + 1}
          </button>
        </div>
      </section>

      {/* Section 05 — Departures & Capacity */}
      <DeparturesEditor
        slug={slug}
        api={api}
        onMessage={onMessage}
        formatDate={formatDate}
        defaultSeats={trek.max_group_size ? Number(trek.max_group_size) : undefined}
      />

      {/* Footer Actions */}
      <div className={styles.detailTopNav}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          ← Back to Trek Management
        </button>

        <div className={styles.detailTopActions}>
          <button type="button" onClick={onBack} style={{background: 'none', border: 'none', color: '#5f776a', cursor: 'pointer', fontSize: '13px', fontWeight: 600, padding: '8px 16px'}}>
            Cancel
          </button>

          <button
            type="submit"
            className={styles.saveTrekBtn}
            disabled={saving || !trek.title || !trek.destination || !trek.category}
          >
            {saving ? 'Saving Details…' : trek.id ? 'Save Trek Changes' : 'Publish New Trek'}
          </button>
        </div>
      </div>
    </form>
  );
}
