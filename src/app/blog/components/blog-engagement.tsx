'use client';

import {FormEvent, useEffect, useState} from 'react';
import Link from 'next/link';
import type {BlogComment} from '@/lib/guides';
import styles from './blog-engagement.module.css';

export default function BlogEngagement({slug, initialViewCount, initialComments}: {slug:string; initialViewCount:number; initialComments:BlogComment[]}) {
  const [viewCount, setViewCount] = useState(initialViewCount);
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const key = `dreamscape_blog_view_${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    fetch(`/api/blog/${slug}/view`, {method:'POST'})
      .then(async response => {if (!response.ok) throw new Error(); return response.json() as Promise<{view_count:number}>;})
      .then(data => setViewCount(data.view_count))
      .catch(() => sessionStorage.removeItem(key));
  }, [slug]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    setMessage('');
    try {
      const response = await fetch(`/api/blog/${slug}/comments`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({body:body.trim()})});
      const data = await response.json();
      if (!response.ok) throw new Error(response.status === 401 ? 'Please sign in before posting a comment.' : data.error || 'We could not add your comment. Please try again.');
      const saved = data.comment as BlogComment;
      setComments(items => [...items, saved]);
      setBody('');
      setMessage('Your comment is now live.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'We could not add your comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return <section className={styles.engagement} aria-labelledby="blog-comments-heading">
    <div className={styles.stats}><span>{viewCount.toLocaleString()} {viewCount === 1 ? 'view' : 'views'}</span><span>{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span></div>
    <h2 id="blog-comments-heading">Join the conversation</h2>
    {comments.length ? <div className={styles.comments}>{comments.map(comment => <article key={comment.id}><header><strong>{comment.author_name}</strong><time dateTime={comment.created_at}>{new Date(comment.created_at).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'})}</time></header><p>{comment.body}</p></article>)}</div> : <p className={styles.empty}>No comments yet. Share the first thought.</p>}
    <form onSubmit={submit}><label htmlFor="blog-comment">Add a comment</label><textarea id="blog-comment" value={body} onChange={event=>setBody(event.target.value)} maxLength={2000} required placeholder="What did this story bring to mind?"/><p className={styles.signin}>Comments are available to signed-in readers. <Link href="/login">Sign in</Link></p><div><small>{body.length}/2000</small><button className="button green" disabled={submitting||!body.trim()}>{submitting?'Posting…':'Post comment'}</button></div></form>
    {message && <p className={styles.message} role="status">{message}</p>}
  </section>;
}
