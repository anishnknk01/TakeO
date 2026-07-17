import type { Metadata } from 'next';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

export const metadata: Metadata = { title: 'Auth Error — PlayBite' };

export default async function AuthErrorPage(props: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await props.searchParams;

  const messages: Record<string, string> = {
    OAuthSignin: 'Could not start the sign-in flow.',
    OAuthCallback: 'Sign-in callback failed.',
    OAuthCreateAccount: 'Could not create an account.',
    EmailCreateAccount: 'Could not create an email account.',
    Callback: 'The sign-in callback encountered an error.',
    OAuthAccountNotLinked:
      'This account is linked to a different sign-in method.',
    EmailSignin: 'The sign-in email could not be sent.',
    CredentialsSignin: 'Invalid credentials. Please try again.',
    SessionRequired: 'You must be signed in to access this page.',
    default: 'An unexpected error occurred. Please try again.',
  };

  const message = messages[error ?? 'default'] ?? messages.default;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-sm space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 4a8 8 0 100 16A8 8 0 0012 4z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Authentication Error</h1>
        <p className="text-sm text-gray-500">{message}</p>
        <Link
          href={ROUTES.AUTH_CUSTOMER_LOGIN}
          className="inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          Back to Login
        </Link>
      </div>
    </main>
  );
}
