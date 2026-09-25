'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { asset } from '@/lib/assets';
import '@/components/admin-login.css';

interface AdminLoginProps {
  onLoginSuccess: (user: { full_name: string; role: string; email: string }) => void;
  backgroundImage?: string;
}

export default function AdminLogin({ onLoginSuccess, backgroundImage = '/images/admin-login-background.png' }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dreamscape-admin-email');
      if (saved) { setEmail(saved); setRemember(true); }
    } catch {}
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || data?.message || 'Invalid administrative credentials.');
      }

      // Record session unlock timestamp in sessionStorage so this specific tab/session is authenticated
      sessionStorage.setItem('dreamscape_admin_unlocked', 'true');
      sessionStorage.setItem('dreamscape_admin_user', JSON.stringify(data.user));
      try {
        if (remember) localStorage.setItem('dreamscape-admin-email', email.trim());
        else localStorage.removeItem('dreamscape-admin-email');
      } catch {}

      onLoginSuccess(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Administrative authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-screen">
      <div className="admin-login-landscape" aria-hidden="true"><img src={backgroundImage} alt="" /></div>
      <header className="admin-login-header">
        <Link href="/" aria-label="Dreamscape home"><img src={asset('222-694-imgLinkBrandLogoDreamscapeTreks')} alt="Dreamscape Treks" width="208" height="72" /></Link>
        <Link href="/" className="admin-login-back"><span aria-hidden="true">←</span> Back to website</Link>
      </header>
      <div className="admin-login-center">
        <section className="admin-login-card" aria-labelledby="admin-login-title">
          <h1 id="admin-login-title">Login to continue</h1>
          <p className="admin-login-caption">Base Command &amp; Sirdar Portal</p>
          <form onSubmit={handleSubmit}>
            <fieldset disabled={loading}>
              <label className="admin-login-field">
                <span className="sr-only">Email address</span>
                <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5" /><path d="M5 21v-3a7 7 0 0 1 14 0v3" /></svg>
                <input type="email" name="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required maxLength={254} />
              </label>
              <label className="admin-login-field">
                <span className="sr-only">Password</span>
                <svg aria-hidden="true" viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
                <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required maxLength={1024} />
                <button type="button" className="admin-login-reveal" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>
                  <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />{showPassword && <path d="m3 3 18 18" />}</svg>
                </button>
              </label>
              <div className="admin-login-options">
                <label><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember email</label>
                <Link href="/forgot-password">Forgot password?</Link>
              </div>
              {error && <p className="admin-login-error" role="alert">{error}</p>}
              <button className="admin-login-submit" type="submit" disabled={loading || !email.trim() || !password}>{loading ? 'Signing in…' : 'Login'}</button>
            </fieldset>
          </form>
        </section>
      </div>
      <footer className="admin-login-footer"><span>© {new Date().getFullYear()} Dreamscape Treks Pvt. Ltd.</span><span>Himalaya &amp; Beyond</span></footer>
    </main>
  );
}
