/**
 * /checkin?token=<signed-jwt>
 *
 * This is the public QR scan landing page.
 * Flow:
 *   1. Parse the token from the URL
 *   2. If customer is not logged in → redirect to OTP login with restaurantGroupId from token
 *   3. If logged in → POST to /api/checkin/qr, then redirect to customer dashboard
 */
import { Suspense } from 'react';
import { CheckInLanding } from '@/components/checkin/CheckInLanding';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function CheckInPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" label="Verifying check-in…" />
      </main>
    }>
      <CheckInLanding />
    </Suspense>
  );
}
