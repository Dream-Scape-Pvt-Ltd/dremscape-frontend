'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console
    console.error('Global error boundary caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: '32rem',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <div style={{ marginBottom: '2rem' }}>
              <svg
                style={{
                  margin: '0 auto',
                  height: '4rem',
                  width: '4rem',
                  color: '#94a3b8',
                }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1
              style={{
                fontSize: '1.875rem',
                fontWeight: 'bold',
                color: '#0f172a',
                marginBottom: '1rem',
              }}
            >
              Application Error
            </h1>

            <p
              style={{
                color: '#475569',
                marginBottom: '2rem',
                lineHeight: '1.5',
              }}
            >
              A critical error occurred. Please refresh the page or contact
              support if the issue continues.
            </p>

            {process.env.NODE_ENV === 'development' && error.message && (
              <div
                style={{
                  marginBottom: '2rem',
                  padding: '1rem',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '0.5rem',
                  textAlign: 'left',
                }}
              >
                <p
                  style={{
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                    color: '#991b1b',
                    wordBreak: 'break-word',
                  }}
                >
                  {error.message}
                </p>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                alignItems: 'center',
              }}
            >
              <button
                onClick={reset}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#0f172a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '1rem',
                }}
              >
                Try again
              </button>

              <a
                href="/"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'white',
                  color: '#0f172a',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontWeight: '500',
                  fontSize: '1rem',
                }}
              >
                Return home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
