'use client';

import React, {FormEvent, useEffect, useMemo, useState} from 'react';
import Link from 'next/link';
import {useAuthContext} from '@/context/AuthContext';
import type {Inquiry, InquiryNote, InquiryStatus} from '@/types/inquiry';
import type {TravelGuideAdminItem, TravelGuideDetail, GuidePayload} from '@/types/content';
import AdminLogin from './admin-login';
import styles from '@/app/admin/admin.module.css';

type Tab = 'dashboard' | 'treks' | 'revenue' | 'journal' | 'inquiries' | 'reviews' | 'media' | 'settings' | 'destinations';
type Page<T> = {count: number; next: string | null; previous: string | null; results: T[]};
interface AdminProfile {full_name: string; role: string; email?: string;}
const statuses: InquiryStatus[] = ['NEW','ASSIGNED','IN_CONTACT','TRAVELING','COMPLETED','CLOSED'];
const emptyGuide: GuidePayload = {title: '', slug: '', summary: '', body_markdown: '', category: 'CULTURE', is_published: false};

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
  const s = `${slug || ''} ${destSlug || ''}`.toLowerCase();
  if (s.includes('everest') || s.includes('khumbu') || s.includes('gokyo') || s.includes('chola') || s.includes('cho-la')) {
    return '/images/222-242-imgEverestBaseCampChoLaPassTrekkingRoute.png';
  }
  if (s.includes('annapurna') || s.includes('tilicho') || s.includes('poon')) {
    return '/images/222-242-imgAnnapurnaCircuitAndTilichoLakeHighGlacialLake.png';
  }
  if (s.includes('manaslu') || s.includes('larkya') || s.includes('tsum') || s.includes('langtang')) {
    return '/images/222-242-imgManasluCircuitLarkyaPassRemoteHimalayas.png';
  }
  if (s.includes('mustang') || s.includes('lo-manthang')) {
    return '/images/222-242-imgUpperMustangLoManthangWalledCityRedCliffs.png';
  }
  if (s.includes('dolpo') || s.includes('phoksundo')) {
    return '/images/151-31-imgDolpoAndSheyPhoksundoDeepWilderness.png';
  }
  return '/images/151-31-imgNepalHimalayanRangeWithAmaDablam.png';
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
  const response = await fetch(path, {
    headers: {'Content-Type': 'application/json', ...(options?.headers || {})},
    ...options
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || 'The request could not be completed.');
  return body?.data as T;
}

function date(value?: string | null) {
  return value ? new Intl.DateTimeFormat('en-US', {month: 'short', day: 'numeric', year: 'numeric'}).format(new Date(value)) : '—';
}

function label(value?: string | null) {
  return value?.replaceAll('_', ' ') || '—';
}

export default function AdminDashboard() {
  const {userName, user} = useAuthContext();
  const [adminUser, setAdminUser] = useState<AdminProfile | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [tab, setTab] = useState<Tab>('dashboard');
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

  // Check if this tab/browser session has unlocked the admin panel
  useEffect(() => {
    async function verifySession() {
      const isUnlocked = typeof window !== 'undefined' && sessionStorage.getItem('dreamscape_admin_unlocked') === 'true';
      if (!isUnlocked) {
        setAdminUser(null);
        setCheckingAuth(false);
        return;
      }

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
      setInquiries(await api<Page<Inquiry>>(`/api/admin/inquiries?status=${encodeURIComponent(status)}&search=${encodeURIComponent(query)}`));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load inquiries.');
    } finally {
      setLoading(false);
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

  useEffect(() => {
    if (adminUser) {
      void loadInquiries();
      void loadGuides();
      void loadTreks();
    }
  }, [adminUser]);

  useEffect(() => {
    if (!adminUser) return;
    if (tab === 'inquiries') void loadInquiries();
    if (tab === 'journal') void loadGuides();
    if (tab === 'treks') void loadTreks();
    if (tab !== 'treks') {
      setSelectedTrekSlug(null);
      setSelectedTrekDetail(null);
    }
  }, [tab, status, adminUser]);

  const metrics = useMemo(() => ({
    total: inquiries?.count || 0,
    new: inquiries?.results.filter(item => item.status === 'NEW').length || 0,
    active: inquiries?.results.filter(item => ['ASSIGNED', 'IN_CONTACT', 'TRAVELING'].includes(item.status)).length || 0,
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
          best_seasons: ['Spring (Mar-May)', 'Autumn (Sep-Nov)'],
          inclusions: [
            'All airport transfers in private vehicle',
            'Kathmandu to Lukla / Pokhara round-trip scenic flights',
            'Full board meals (Breakfast, Lunch, Dinner) on the trail',
            'Licensed UIAGM/NNMGA Certified Lead Trekking Guide',
            'Experienced mountain porters (1 porter for 2 trekkers)',
            'All required National Park and Conservation permits',
            'Handcrafted comfortable mountain teahouse & luxury lodge accommodations',
            'Comprehensive first aid medical kit with portable pulse oximeter'
          ],
          exclusions: [
            'International flights to/from Kathmandu',
            'Nepal entry visa fees',
            'Travel & high-altitude medical evacuation insurance (mandatory)',
            'Personal trekking gear and apparel',
            'Tips for mountain guides and porters'
          ],
          packing_list: [
            '4-season sleeping bag (-15°C rated)',
            'Down jacket (800+ fill power)',
            'Waterproof hard shell jacket and pants',
            'Broken-in waterproof trekking boots with ankle support',
            'Thermal base layers (merino wool recommended)',
            'UV400 Category 4 polarized glacier sunglasses'
          ],
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
          best_seasons: Array.isArray(raw.best_seasons) && raw.best_seasons.length > 0 ? raw.best_seasons : ['Spring (Mar-May)', 'Autumn (Sep-Nov)'],
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

      if (selectedTrekDetail.id && selectedTrekSlug !== 'new') {
        const updated = await api<{slug?: string}>(`/api/admin/treks/${selectedTrekSlug}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
        setMessage(`Trek "${selectedTrekDetail.title}" updated successfully with ${payload.itinerary_days.length} itinerary days.`);
        if (updated?.slug) {
          setSelectedTrekSlug(updated.slug);
        }
      } else {
        const created = await api<{slug?: string}>('/api/admin/treks', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setMessage(`Trek "${selectedTrekDetail.title}" created successfully.`);
        if (created?.slug) {
          setSelectedTrekSlug(created.slug);
        }
      }
      void loadTreks();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save trek details.');
    } finally {
      setTrekSaving(false);
    }
  };

  const handleLoginSuccess = (profile: AdminProfile) => {
    setAdminUser(profile);
    setMessage('');
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
    return [
      { inquiry_number: 'INQ-101', full_name: 'Eleanor Vance', trip: 'Everest Base Camp', dateFormatted: 'Oct 24, 2024', status: 'NEW' },
      { inquiry_number: 'INQ-102', full_name: 'Marcus Reid', trip: 'Annapurna Circuit', dateFormatted: 'Oct 23, 2024', status: 'CONTACTED' },
      { inquiry_number: 'INQ-103', full_name: 'Sarah Jenkins', trip: 'Manaslu Circuit', dateFormatted: 'Oct 22, 2024', status: 'NEW' },
      { inquiry_number: 'INQ-104', full_name: 'David Chen', trip: 'Langtang Valley', dateFormatted: 'Oct 21, 2024', status: 'CONTACTED' },
    ];
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
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  async function openInquiry(reference: string) {
    setMessage('');
    setNotes([]);
    try {
      const [detail, noteList] = await Promise.all([
        api<Inquiry>(`/api/admin/inquiries/${reference}`),
        api<InquiryNote[] | Page<InquiryNote>>(`/api/admin/inquiries/${reference}/notes`)
      ]);
      setSelectedInquiry(detail);
      setNotes(Array.isArray(noteList) ? noteList : noteList.results);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to open this inquiry.');
    }
  }

  async function updateStatus(next: InquiryStatus) {
    if (!selectedInquiry) return;
    setSaving(true);
    setMessage('');
    try {
      const saved = await api<Inquiry>(`/api/admin/inquiries/${selectedInquiry.inquiry_number}`, {
        method: 'PATCH',
        body: JSON.stringify({status: next})
      });
      setSelectedInquiry(saved);
      setInquiries(current => current && {
        ...current,
        results: current.results.map(item => item.inquiry_number === saved.inquiry_number ? {...item, status: saved.status} : item)
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to update the inquiry.');
    } finally {
      setSaving(false);
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
      setEditor(item ? await api<TravelGuideDetail>(`/api/admin/guides/${item.slug}`) : {...emptyGuide, id: '', slug: ''});
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to open the editor.');
    }
  }

  async function saveGuide(event: FormEvent) {
    event.preventDefault();
    if (!editor) return;
    setSaving(true);
    setMessage('');
    const {id, ...payload} = editor;
    try {
      const saved = await api<TravelGuideDetail>(editor.id ? `/api/admin/guides/${editor.slug}` : '/api/admin/guides', {
        method: editor.id ? 'PATCH' : 'POST',
        body: JSON.stringify(payload)
      });
      setGuides(current => current && {
        ...current,
        results: editor.id ? current.results.map(item => item.slug === saved.slug ? saved : item) : [saved, ...current.results],
        count: editor.id ? current.count : current.count + 1
      });
      setEditor(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save the guide.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteGuide() {
    if (!editor?.id || !window.confirm(`Archive “${editor.title}”?`)) return;
    setSaving(true);
    try {
      await api(`/api/admin/guides/${editor.slug}`, {method: 'DELETE'});
      setGuides(current => current && {
        ...current,
        results: current.results.filter(item => item.slug !== editor.slug),
        count: current.count - 1
      });
      setEditor(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to archive the guide.');
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
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
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
      label: 'Journal Posts',
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
      badge: metrics.new > 0 ? metrics.new : 12,
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
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
      id: 'media',
      label: 'Media Library',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="9" cy="9" r="2"/>
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
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
                <span className={styles.profileName}>{adminUser.full_name || userName || 'Admin User'}</span>
                <span className={styles.profileRole}>{label(adminUser.role || 'Superadmin')}</span>
              </div>
              <div className={styles.profileAvatar}>
                {(adminUser.full_name || userName || 'A').slice(0, 1).toUpperCase()}
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

        {/* Tab 1: Mockup Redesigned Dashboard Overview */}
        {tab === 'dashboard' && (
          <>
            {/* Top 4 Stat Cards */}
            <div className={styles.statsRow}>
              {/* Card 1: Total Treks */}
              <div className={styles.statCard}>
                <div className={styles.statCardHead}>
                  <span className={styles.statLabel}>Total Treks</span>
                  <svg className={styles.statWatermark} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
                  </svg>
                </div>
                <div className={styles.statValue}>24</div>
                <p className={styles.statSub}>+2 this month</p>
              </div>

              {/* Card 2: New Inquiries */}
              <div className={styles.statCard}>
                <div className={styles.statCardHead}>
                  <span className={styles.statLabel}>New Inquiries</span>
                  <span className={styles.statBadgeRed}>ACTION NEEDED</span>
                </div>
                <div className={styles.statValue}>{metrics.new > 0 ? metrics.new : 12}</div>
                <p className={styles.statSub}>in last 48h</p>
              </div>

              {/* Card 3: Active Expeditions */}
              <div className={styles.statCard}>
                <div className={styles.statCardHead}>
                  <span className={styles.statLabel}>Active Expeditions</span>
                  <svg className={styles.statWatermark} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="4" r="2"/>
                    <path d="m9 20 3-6 3 6"/>
                    <path d="m6 8 6 2 6-2"/>
                    <line x1="12" y1="10" x2="12" y2="14"/>
                  </svg>
                </div>
                <div className={styles.statValue}>08</div>
                <p className={styles.statSub}>currently en route</p>
              </div>

              {/* Card 4: Monthly Revenue (Dark Emerald Card) */}
              <div className={`${styles.statCard} ${styles.statCardDark}`}>
                <div className={styles.statCardHead}>
                  <span className={styles.statLabel}>Monthly Revenue</span>
                  <svg className={styles.statWatermark} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                </div>
                <div className={styles.statValue}>$124k</div>
                <p className={styles.statSub}>+15% MoM</p>
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
                      onClick={() => setMessage('Media staging workspace active. Drag and drop assets to catalog.')}
                    >
                      <svg className={styles.quickActionIcon} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      Upload Media
                    </button>
                  </div>
                </section>

                {/* Recent Activity Timeline */}
                <section className={styles.sectionCard}>
                  <h3 className={styles.sectionCardTitle}>Recent Activity</h3>
                  <div className={styles.timeline}>
                    <div className={styles.timelineItem}>
                      <div className={`${styles.timelineDot} ${styles.timelineDotActive}`} />
                      <div className={styles.timelineContent}>
                        <strong>System updated itinerary for Everest Base Camp.</strong>
                        <small>2 hours ago</small>
                      </div>
                    </div>

                    <div className={styles.timelineItem}>
                      <div className={styles.timelineDot} />
                      <div className={styles.timelineContent}>
                        <strong>Admin User published new journal post: &quot;Preparing for the Cold&quot;.</strong>
                        <small>5 hours ago</small>
                      </div>
                    </div>

                    <div className={styles.timelineItem}>
                      <div className={styles.timelineDot} />
                      <div className={styles.timelineContent}>
                        <strong>New high-res map uploaded to Media Library.</strong>
                        <small>Yesterday at 14:30</small>
                      </div>
                    </div>

                    <div className={styles.timelineItem}>
                      <div className={styles.timelineDot} />
                      <div className={styles.timelineContent}>
                        <strong>Payment received for Annapurna Circuit Booking #442.</strong>
                        <small>Yesterday at 09:15</small>
                      </div>
                    </div>
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
            onQuery={setQuery}
            onStatus={setStatus}
            onSearch={() => void loadInquiries()}
            onOpen={openInquiry}
          />
        )}

        {/* Tab 3: Full Journal CMS View */}
        {tab === 'journal' && (
          <JournalView
            guides={guides?.results || []}
            loading={loading}
            onCreate={() => void editGuide()}
            onEdit={item => void editGuide(item)}
          />
        )}

        {/* Tab: Trek Management View / Full Detail Editor */}
        {tab === 'treks' && (
          selectedTrekSlug && selectedTrekDetail ? (
            <TrekFullDetailEditor
              trek={selectedTrekDetail}
              destinations={destinations}
              categories={categories}
              saving={trekSaving}
              loading={loadingTrekDetail}
              onChange={setSelectedTrekDetail}
              onBack={() => {
                setSelectedTrekSlug(null);
                setSelectedTrekDetail(null);
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
              onQueryChange={setTrekQuery}
              onStatusFilterChange={setTrekStatusFilter}
              onSelectTrek={slug => void loadTrekDetail(slug)}
              onToggleActive={handleToggleTrekActive}
              onToggleFeatured={handleToggleTrekFeatured}
              onDeleteTrek={trek => setTrekToDelete(trek)}
            />
          )
        )}

        {/* Placeholders for other tabs with clean mockups & catalog links */}
        {(tab === 'revenue' || tab === 'reviews' || tab === 'media' || tab === 'settings' || tab === 'destinations') && (
          <section className={styles.placeholder}>
            <span>⌁</span>
            <h2>{navItems.find(item => item.id === tab)?.label || 'Module Management'}</h2>
            <p>
              Administrative control for this section is connected to the master expedition engine.
              The customer catalog and booking pipelines are actively synchronized.
            </p>
            <div style={{display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px'}}>
              <button className={styles.primary} onClick={() => void editGuide()}>
                + Create record
              </button>
              <Link href="/treks" style={{padding: '10px 16px', borderRadius: '8px', border: '1px solid #cddcd2', textDecoration: 'none', color: '#133e2f', fontWeight: 600, fontSize: '13px'}}>
                View public catalog →
              </Link>
            </div>
          </section>
        )}
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
          onDelete={() => void deleteGuide()}
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

function InquiriesView({inquiries, loading, query, status, onQuery, onStatus, onSearch, onOpen}: {inquiries: Inquiry[]; loading: boolean; query: string; status: string; onQuery: (value: string) => void; onStatus: (value: string) => void; onSearch: () => void; onOpen: (reference: string) => void}) {
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
                  <td>{item.trip || item.journey || item.inquiry_type || 'General inquiry'}</td>
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

function JournalView({guides, loading, onCreate, onEdit}: {guides: TravelGuideAdminItem[]; loading: boolean; onCreate: () => void; onEdit: (guide: TravelGuideAdminItem) => void}) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div>
          <p style={{fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.4px', color: '#74897d', fontWeight: 800, margin: '0 0 4px'}}>CMS</p>
          <h2>Travel guides</h2>
        </div>
        <button className={styles.primary} onClick={onCreate}>+ New guide</button>
      </div>
      {loading ? (
        <p className={styles.empty}>Loading guides…</p>
      ) : guides.length ? (
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Guide</th>
                <th>Category</th>
                <th>State</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {guides.map(guide => (
                <tr key={guide.id}>
                  <td>
                    <strong>{guide.title}</strong>
                    <small>/{guide.slug}</small>
                  </td>
                  <td>{label(guide.category)}</td>
                  <td>
                    <em data-status={guide.is_published ? 'PUBLISHED' : 'DRAFT'}>
                      {guide.is_published ? 'Published' : 'Draft'}
                    </em>
                  </td>
                  <td>{date(guide.updated_at || guide.published_at)}</td>
                  <td>
                    <button onClick={() => onEdit(guide)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className={styles.empty}>No guides found.</p>
      )}
    </section>
  );
}

function InquiryDrawer({inquiry, notes, noteText, saving, onClose, onStatus, onNoteText, onSubmit}: {inquiry: Inquiry; notes: InquiryNote[]; noteText: string; saving: boolean; onClose: () => void; onStatus: (value: InquiryStatus) => void; onNoteText: (value: string) => void; onSubmit: (event: FormEvent) => void}) {
  return (
    <aside className={styles.drawer} aria-label="Inquiry details">
      <button className={styles.close} onClick={onClose}>×</button>
      <p style={{fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.4px', color: '#74897d', fontWeight: 800}}>{inquiry.inquiry_number}</p>
      <h2>{inquiry.full_name}</h2>
      <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
      {inquiry.phone && <a href={`tel:${inquiry.phone}`}>{inquiry.phone}</a>}
      <dl>
        <div>
          <dt>Status</dt>
          <dd>
            <select value={inquiry.status} disabled={saving} onChange={event => onStatus(event.target.value as InquiryStatus)}>
              {statuses.map(value => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </dd>
        </div>
        <div>
          <dt>Trip interest</dt>
          <dd>{inquiry.trip || inquiry.journey || inquiry.inquiry_type || 'General inquiry'}</dd>
        </div>
        <div>
          <dt>Preferred dates</dt>
          <dd>{inquiry.preferred_dates || 'Not specified'}</dd>
        </div>
      </dl>
      <section className={styles.message}>
        <h3>Traveler message</h3>
        <p>{inquiry.message || 'No message supplied.'}</p>
      </section>
      <section className={styles.notes}>
        <h3>Consultation notes</h3>
        {notes.map(note => (
          <article key={note.id}>
            <strong>{note.author || 'Staff'}</strong>
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
    </aside>
  );
}

function GuideEditor({guide, saving, onChange, onClose, onSave, onDelete}: {guide: TravelGuideDetail; saving: boolean; onChange: (guide: TravelGuideDetail) => void; onClose: () => void; onSave: (event: FormEvent) => void; onDelete: () => void}) {
  const field = (key: keyof TravelGuideDetail) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    onChange({...guide, [key]: event.target.type === 'checkbox' ? (event.target as HTMLInputElement).checked : event.target.value});

  return (
    <div className={styles.modalBackdrop} role="presentation">
      <form className={styles.editor} onSubmit={onSave}>
        <button type="button" className={styles.close} onClick={onClose}>×</button>
        <p style={{fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.4px', color: '#74897d', fontWeight: 800}}>CMS / {guide.id ? 'Edit guide' : 'New guide'}</p>
        <h2>{guide.id ? guide.title : 'Create a guide'}</h2>
        <label>Title<input required value={guide.title} onChange={field('title')} maxLength={180} /></label>
        <label>Slug<input required value={guide.slug} onChange={field('slug')} pattern="[a-z0-9]+(-[a-z0-9]+)*" /></label>
        <div className={styles.formGrid}>
          <label>Category
            <select value={guide.category || 'CULTURE'} onChange={field('category')}>
              {['VISAS','PERMITS','ALTITUDE','CULTURE','BEST_TIME'].map(value => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>Hero image URL<input value={guide.hero_image_url || ''} onChange={field('hero_image_url')} type="url" /></label>
        </div>
        <label>Summary<textarea value={guide.summary || ''} onChange={field('summary')} maxLength={500} /></label>
        <label>Markdown content<textarea className={styles.markdown} value={guide.body_markdown || ''} onChange={field('body_markdown')} /></label>
        <div className={styles.formGrid}>
          <label>SEO title<input value={guide.meta_title || ''} onChange={field('meta_title')} maxLength={180} /></label>
          <label>SEO description<input value={guide.meta_description || ''} onChange={field('meta_description')} maxLength={300} /></label>
        </div>
        <label className={styles.checkbox}>
          <input type="checkbox" checked={Boolean(guide.is_published)} onChange={field('is_published')} /> Publish this guide
        </label>
        <footer>
          {guide.id && <button type="button" className={styles.danger} disabled={saving} onClick={onDelete}>Archive</button>}
          <span />
          <button type="button" onClick={onClose}>Cancel</button>
          <button className={styles.primary} disabled={saving}>
            {saving ? 'Saving…' : guide.is_published ? 'Save & publish' : 'Save draft'}
          </button>
        </footer>
      </form>
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

function TrekManagementView({
  treks,
  loading,
  query,
  statusFilter,
  onQueryChange,
  onStatusFilterChange,
  onSelectTrek,
  onToggleActive,
  onToggleFeatured,
  onDeleteTrek,
}: {
  treks: AdminTrek[];
  loading: boolean;
  query: string;
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'FEATURED';
  onQueryChange: (val: string) => void;
  onStatusFilterChange: (val: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'FEATURED') => void;
  onSelectTrek: (slug: string) => void;
  onToggleActive: (trek: AdminTrek) => void;
  onToggleFeatured: (trek: AdminTrek) => void;
  onDeleteTrek: (trek: AdminTrek) => void;
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
          <p style={{fontSize: '15px', fontWeight: 600, marginBottom: '12px'}}>No treks found matching your filter.</p>
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
                    <div className={styles.actionBtnGroup}>
                      <button
                        type="button"
                        className={styles.actionBtnToggle}
                        onClick={() => onToggleActive(trek)}
                        title={trek.is_active ? 'Deactivate this trek' : 'Activate this trek'}
                      >
                        {trek.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        className={styles.actionBtnEdit}
                        onClick={() => onSelectTrek(trek.slug)}
                        title="Open full editable trek detail page"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className={styles.actionBtnDelete}
                        onClick={() => onDeleteTrek(trek)}
                        title="Delete this trek"
                      >
                        Delete
                      </button>
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
  destinations,
  categories,
  saving,
  loading,
  onChange,
  onBack,
  onSave,
  onToggleActive,
  onToggleFeatured,
}: {
  trek: AdminTrekDetail;
  destinations: DestinationOption[];
  categories: CategoryOption[];
  saving: boolean;
  loading: boolean;
  onChange: React.Dispatch<React.SetStateAction<AdminTrekDetail | null>>;
  onBack: () => void;
  onSave: (event: FormEvent) => void;
  onToggleActive: () => void;
  onToggleFeatured: () => void;
}) {
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

  const handleUpdateDay = (index: number, field: keyof AdminItineraryDay, value: any) => {
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
          {/* Trek Title */}
          <div className={styles.formField}>
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

          {/* URL Slug */}
          <div className={styles.formField}>
            <label className={styles.formLabel}>
              <span>URL Slug</span>
              <span className={styles.formLabelHint}>{trek.id ? 'Locked after creation' : 'Auto-generated from title'}</span>
            </label>
            <div className={styles.inputAffixWrapper}>
              <span className={styles.inputPrefix}>/treks/</span>
              <input
                required
                className={styles.formInput}
                value={trek.slug}
                disabled={Boolean(trek.id)}
                onChange={e => onChange(prev => prev ? {...prev, slug: e.target.value} : null)}
                placeholder="everest-base-camp-classic"
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
              />
            </div>
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

          {/* Single Supplement */}
          <div className={styles.formField}>
            <label className={styles.formLabel}>
              <span>Single Supplement (USD)</span>
              <span className={styles.formLabelHint}>Solo traveler room add-on</span>
            </label>
            <div className={styles.inputAffixWrapper}>
              <span className={styles.inputPrefix}>$</span>
              <input
                type="number"
                min={0}
                step="any"
                className={styles.formInput}
                value={trek.single_supplement_usd ?? ''}
                onChange={e => onChange(prev => prev ? {...prev, single_supplement_usd: e.target.value === '' ? '' : Number(e.target.value)} : null)}
                placeholder="0"
              />
              <span className={styles.inputSuffix}>USD</span>
            </div>
          </div>

          {/* Group Size Range */}
          <div className={styles.formField}>
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
              <span>Main Hero / Cover Image URL</span>
              <span className={styles.formLabelHint}>Primary banner image for trek hero and catalog cards</span>
            </label>
            <div className={styles.inputAffixWrapper}>
              <span className={styles.inputPrefix}>Cover URL</span>
              <input
                type="text"
                className={styles.formInput}
                value={trek.hero_image_url || ''}
                onChange={e => onChange(prev => prev ? {...prev, hero_image_url: e.target.value} : null)}
                placeholder="e.g. /images/222-242-imgEverestBaseCampChoLaPassTrekkingRoute.png or https://..."
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
                + Add Photo to Gallery
              </strong>
              <input
                type="text"
                id="new-gallery-image-input"
                className={styles.galleryCardInput}
                placeholder="Paste Image URL / Path..."
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
          <TagListManager
            label="Best Seasons"
            icon="⛅"
            items={trek.best_seasons}
            placeholder="e.g. Spring (Mar–May) or Autumn (Sep–Nov)"
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
                Detailed trail breakdown with daily elevations, overnight stays, and acclimatization markers
              </p>
            </div>
          </div>
          <button type="button" className={styles.primary} onClick={handleAddDay}>
            + Add Day
          </button>
        </div>

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

              <div className={styles.dayFieldsGrid}>
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

