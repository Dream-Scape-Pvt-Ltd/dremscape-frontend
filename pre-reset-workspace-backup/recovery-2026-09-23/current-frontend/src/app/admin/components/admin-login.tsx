'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import styles from '../admin.module.css';

interface AdminLoginProps {
  onLoginSuccess: (user: { full_name: string; role: string; email: string }) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

      onLoginSuccess(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Administrative authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginBackdrop}>
      <div className={styles.loginCard}>
        <div className={styles.loginBadge}>
          <span className={styles.loginBadgeDot} />
          EXPEDITION CONTROL
        </div>

        <div className={styles.loginHeader}>
          <h1>Admin Access</h1>
          <p>Restricted staff workspace. Admin login is required every time this portal is opened.</p>
        </div>

        {error && (
          <div className={styles.loginAlert} role="alert">
            <span aria-hidden="true">⚠️</span>
            <div>{error}</div>
          </div>
        )}

        <form className={styles.loginForm} onSubmit={handleSubmit} autoComplete="on">
          <div className={styles.inputGroup}>
            <label htmlFor="admin-email">Staff Email Address</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon} aria-hidden="true">✉</span>
              <input
                id="admin-email"
                type="email"
                required
                autoFocus
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@dreamscapetreks.com"
                disabled={loading}
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="admin-password">Staff Password</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon} aria-hidden="true">🔒</span>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                disabled={loading}
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
              />
              <button
                type="button"
                className={styles.pwToggle}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.loginBtn}
            disabled={loading || !email.trim() || !password}
          >
            {loading ? 'Verifying Access…' : 'Enter Expedition Control ↗'}
          </button>
        </form>

        <p className={styles.loginNotice}>
          Access is monitored & audited.
          <small>Only authorized Dreamscape staff accounts are permitted.</small>
        </p>

        <div>
          <Link href="/" className={styles.backHome}>
            ← Return to public website
          </Link>
        </div>
      </div>
    </div>
  );
}
