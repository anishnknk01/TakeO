'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';

/**
 * Handles the QR scan redirect.
 *   - Reads the token from ?token= query param
 *   - Tries to POST /api/checkin/qr with the token
 *   - If 401 → not logged in → redirect to OTP login with restaurantGroupId extracted from token
 *   - If 201 → success → redirect to customer dashboard
 *   - Otherwise → show error
 */
export function CheckInLanding() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'needs_login'>('loading');
  const [message, setMessage] = useState('Verifying your check-in…');
  const [loginUrl, setLoginUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setTimeout(() => {
        setStatus('error');
        setMessage('No QR token found. Please scan the QR code again.');
      }, 0);
      return;
    }

    async function doCheckIn() {
      // Build a device fingerprint hash from browser properties
      const raw = [
        navigator.userAgent,
        screen.width + 'x' + screen.height,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        navigator.language,
      ].join('|');
      // Simple client-side hash (SHA-256 via SubtleCrypto)
      let deviceHash: string | undefined;
      try {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
        deviceHash = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
      } catch { /* ignore if unavailable */ }

      const res = await fetch('/api/checkin/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, deviceHash }),
      });

      if (res.status === 401) {
        // Not logged in — extract restaurantGroupId from token payload (the token is a JWT)
        // We decode without verifying (client can see public claims), then redirect to login
        let groupId: string | undefined;
        try {
          const parts = token.split('.');
          if (parts[1]) {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            groupId = payload.restaurantGroupId;
          }
        } catch { /* ignore */ }

        const url = new URL(ROUTES.AUTH_CUSTOMER_LOGIN, window.location.origin);
        url.searchParams.set('callbackUrl', window.location.pathname + window.location.search);
        if (groupId) url.searchParams.set('restaurantGroupId', groupId);
        setLoginUrl(url.toString());
        setStatus('needs_login');
        setMessage('You need to log in before checking in.');
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setMessage(data.message ?? 'Check-in failed. Please try again.');
        return;
      }

      setStatus('success');
      setMessage('Check-in successful! Redirecting…');
      setTimeout(() => router.replace(ROUTES.DASHBOARD_CUSTOMER), 1500);
    }

    doCheckIn();
  }, [token, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-sm space-y-6 text-center">
        {status === 'loading' && (
          <>
            <LoadingSpinner size="lg" label="Checking in…" />
            <p className="text-sm text-gray-500">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Checked in!</h1>
            <p className="text-sm text-gray-500">{message}</p>
          </>
        )}

        {status === 'needs_login' && (
          <>
            <h1 className="text-xl font-bold text-gray-900">Login required</h1>
            <p className="text-sm text-gray-500">{message}</p>
            {loginUrl && (
              <Button onClick={() => router.push(loginUrl)} className="w-full">
                Log in to check in
              </Button>
            )}
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Check-in failed</h1>
            <p className="text-sm text-gray-500">{message}</p>
            <Button variant="secondary" onClick={() => window.history.back()} className="w-full">
              Go back
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
