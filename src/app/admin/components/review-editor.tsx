'use client';

import {useEffect,useState} from 'react';
import styles from './cms-fields.module.css';

type Review={id:string;title:string;content:string;reviewer_name:string;rating_overall:number;is_published:boolean};

export default function ReviewEditor() {
  const [trips,setTrips]=useState<{slug:string;title:string}[]>([]);
  const [trip,setTrip]=useState('');
  const [reviews,setReviews]=useState<Review[]>([]);
  const [page,setPage]=useState(1);
  const [next,setNext]=useState(false);
  const [busy,setBusy]=useState(false);
  const [loadingTrips,setLoadingTrips]=useState(true);
  const [error,setError]=useState('');

  useEffect(()=>{
    const controller=new AbortController();
    fetch('/api/admin/treks?page_size=100',{signal:controller.signal}).then(async response=>{
      const body=await response.json();
      if(!response.ok)throw new Error(body.error||'Could not load journeys.');
      const catalog=body.data?.treks;
      setTrips(Array.isArray(catalog)?catalog:catalog?.results||[]);
    }).catch(reason=>{if(!controller.signal.aborted)setError(reason instanceof Error?reason.message:'Could not load journeys.');})
      .finally(()=>{if(!controller.signal.aborted)setLoadingTrips(false);});
    return ()=>controller.abort();
  },[]);
  useEffect(()=>{
    if(!trip)return;
    const controller=new AbortController();
    setBusy(true);setError('');
    fetch(`/api/admin/reviews?trip=${encodeURIComponent(trip)}&page=${page}`,{signal:controller.signal}).then(async response=>{
      const body=await response.json();
      if(!response.ok)throw new Error(body.error||'Could not load reviews.');
      setReviews(body.data.results);setNext(Boolean(body.data.next));
    }).catch(reason=>{if(!controller.signal.aborted)setError(reason instanceof Error?reason.message:'Could not load reviews.');})
      .finally(()=>{if(!controller.signal.aborted)setBusy(false);});
    return ()=>controller.abort();
  },[trip,page]);
  async function toggle(review:Review) {
    setBusy(true);setError('');
    try {
      const response=await fetch('/api/admin/reviews',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({trip,id:review.id,is_published:!review.is_published})});
      const body=await response.json();
      if(!response.ok)throw new Error(body.error||'Could not save review.');
      setReviews(rows=>rows.map(row=>row.id===review.id?body.data:row));
    } catch(reason){setError(reason instanceof Error?reason.message:'Could not save review.');}
    finally{setBusy(false);}
  }
  return <section className={styles.panel}>
    <p className={styles.eyebrow}>Website content</p>
    <h2>Traveller reviews</h2>
    <p className={styles.intro}>Review submissions before publishing them on the website.</p>
    <label className={styles.field}>Journey
      <select value={trip} onChange={event=>{setTrip(event.target.value);setPage(1);setReviews([]);}} disabled={loadingTrips||trips.length===0}>
        <option value="">{loadingTrips?'Loading journeys…':'Choose a journey'}</option>
        {trips.map(item=><option key={item.slug} value={item.slug}>{item.title}</option>)}
      </select>
    </label>
    {error&&<p className={styles.alert} role="alert">{error}</p>}
    {!loadingTrips&&trips.length===0&&!error&&<p className={styles.empty}>No journeys are in the CMS yet. Add a trek before moderating its reviews.</p>}
    {busy&&<p className={styles.empty} role="status">Loading reviews…</p>}
    {trip&&!busy&&!reviews.length&&!error&&<p className={styles.empty}>No reviews for this journey yet.</p>}
    {reviews.map(review=><article className={styles.review} key={review.id}>
      <p className={styles.reviewMeta}>{review.reviewer_name} · {review.rating_overall}/5 · {review.is_published?'Published':'Awaiting moderation'}</p>
      <h3>{review.title}</h3><p>{review.content}</p>
      <button className={styles.button} disabled={busy} onClick={()=>toggle(review)}>{review.is_published?'Unpublish':'Publish review'}</button>
    </article>)}
    <div className={styles.pagination}>{page>1&&<button disabled={busy} onClick={()=>setPage(page-1)}>Previous</button>}{next&&<button disabled={busy} onClick={()=>setPage(page+1)}>Next</button>}</div>
  </section>;
}
