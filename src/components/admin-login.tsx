'use client';

import Link from 'next/link';
import {useEffect, useState, type FormEvent} from 'react';
import {asset} from '@/lib/assets';
import {errorText} from '@/lib/format';
import './admin-login.css';

export default function AdminLogin({backgroundImage='/images/admin-login-background.png'}:{backgroundImage?:string}) {
  const [email,setEmail]=useState('');
  const [remember,setRemember]=useState(false);
  const [visible,setVisible]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>{try{const saved=localStorage.getItem('dreamscape-admin-email');if(saved){setEmail(saved);setRemember(true);}}catch{}},[]);
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();setBusy(true);setError('');
    const form=new FormData(event.currentTarget);
    try {
      const response=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:form.get('password')})});
      const result=await response.json();
      if(!response.ok||result.success!==true)throw new Error(errorText(result));
      const access=await fetch('/api/admin?resource=inquiries&page=1');
      if(!access.ok){const detail=await access.json();throw new Error(errorText(detail));}
      try{if(remember)localStorage.setItem('dreamscape-admin-email',email);else localStorage.removeItem('dreamscape-admin-email');}catch{}
      window.location.assign('/admin');
    }catch(reason){setError(reason instanceof Error?reason.message:'Unable to sign in. Please try again.');setBusy(false);}
  }
  return <main className="admin-login-screen">
    <div className="admin-login-landscape" aria-hidden="true"><img src={backgroundImage} alt="" /></div>
    <header className="admin-login-header">
      <Link href="/" aria-label="Dreamscape home"><img src={asset('222-694-imgLinkBrandLogoDreamscapeTreks')} alt="Dreamscape Treks" width="208" height="72"/></Link>
      <Link href="/" className="admin-login-back"><span aria-hidden="true">←</span> Back to website</Link>
    </header>
    <div className="admin-login-center"><section className="admin-login-card" aria-labelledby="admin-login-title">
      <h1 id="admin-login-title">Login to continue</h1>
      <p className="admin-login-caption">Base Command &amp; Sirdar Portal</p>
      <form onSubmit={submit}>
        <fieldset disabled={busy}>
          <label className="admin-login-field"><span className="sr-only">Email address</span><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M5 21v-3a7 7 0 0 1 14 0v3"/></svg><input type="email" name="email" placeholder="Email address" value={email} onChange={event=>setEmail(event.target.value)} autoComplete="username" required maxLength={254}/></label>
          <label className="admin-login-field"><span className="sr-only">Password</span><svg aria-hidden="true" viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg><input type={visible?'text':'password'} name="password" placeholder="Password" autoComplete="current-password" required maxLength={1024}/><button type="button" className="admin-login-reveal" aria-label={visible?'Hide password':'Show password'} aria-pressed={visible} onClick={()=>setVisible(!visible)}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>{visible&&<path d="m3 3 18 18"/>}</svg></button></label>
          <div className="admin-login-options"><label><input type="checkbox" checked={remember} onChange={event=>setRemember(event.target.checked)}/> Remember email</label><Link href="/forgot-password">Forgot password?</Link></div>
          {error&&<p className="admin-login-error" role="alert">{error}</p>}
          <button className="admin-login-submit" type="submit" disabled={busy}>{busy?'Signing in…':'Login'}</button>
        </fieldset>
      </form>
    </section></div>
    <footer className="admin-login-footer"><span>© {new Date().getFullYear()} Dreamscape Treks Pvt. Ltd.</span><span>Himalaya &amp; Beyond</span></footer>
  </main>;
}
