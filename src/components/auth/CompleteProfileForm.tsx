'use client';

import { useActionState } from 'react';
import { completeProfileAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/Button';

export function CompleteProfileForm({ restaurantGroupId }: { restaurantGroupId?: string }) {
  const [state, formAction, isPending] = useActionState(completeProfileAction, {
    success: false as const,
    error: '',
  });

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Complete your profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Just a few more details before you start playing.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {restaurantGroupId && (
          <input type="hidden" name="restaurantGroupId" value={restaurantGroupId} />
        )}

        {/* Display handle */}
        <div>
          <label htmlFor="displayHandle" className="block text-sm font-medium text-gray-700">
            Display name <span aria-hidden="true">*</span>
          </label>
          <input
            id="displayHandle"
            name="displayHandle"
            type="text"
            required
            minLength={2}
            maxLength={30}
            placeholder="CoolGamer42"
            aria-describedby={
                'fieldErrors' in state && state.fieldErrors?.displayHandle ? 'handle-error' : undefined
              }
            className={[
              'mt-1 block w-full rounded-lg border px-4 py-3 text-base shadow-sm',
              'placeholder:text-gray-400 focus:outline-none focus:ring-2',
              'fieldErrors' in state && state.fieldErrors?.displayHandle
                ? 'border-red-300 focus:ring-red-400'
                : 'border-gray-300 focus:ring-brand-500',
            ].join(' ')}
          />
          {'fieldErrors' in state && state.fieldErrors?.displayHandle && (
            <p id="handle-error" className="mt-1 text-sm text-red-600" role="alert">
              {state.fieldErrors.displayHandle[0]}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-400">
            This is how you appear on leaderboards.
          </p>
        </div>

        {/* First name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First name <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            maxLength={50}
            placeholder="Alex"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-base shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Marketing consent */}
        <div className="flex items-start gap-3">
          <input
            id="marketingConsent"
            name="marketingConsent"
            type="checkbox"
            value="true"
            className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          <label htmlFor="marketingConsent" className="text-sm text-gray-600">
            I&#39;d like to receive offers and updates from participating restaurants.
          </label>
        </div>

        {/* Terms acceptance note */}
        <p className="text-xs text-gray-400">
          By continuing you confirm you have read and accept our{' '}
          <a href="/legal/terms" className="underline hover:text-gray-600">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/legal/privacy" className="underline hover:text-gray-600">
            Privacy Policy
          </a>
          .
        </p>

        {'error' in state && state.error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {state.error}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" isLoading={isPending}>
          {isPending ? 'Saving…' : "Let's play!"}
        </Button>
      </form>
    </div>
  );
}
