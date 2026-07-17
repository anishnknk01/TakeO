'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';

export function OtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const phone = searchParams.get('phone') ?? '';
  const displayPhone = phone.startsWith('+91') 
    ? phone.slice(3).replace(/(\d{5})(\d{5})/, '$1 $2') 
    : phone;
  const role = (searchParams.get('role') ?? 'CUSTOMER') as
    | 'CUSTOMER'
    | 'RESTAURANT_OWNER'
    | 'PLATFORM_ADMIN';
  const restaurantGroupId = searchParams.get('restaurantGroupId') ?? undefined;
  const initialCooldown = parseInt(searchParams.get('cooldown') ?? '30', 10);

  // OTP digit inputs
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationState, setVerificationState] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Resend cooldown - initialize to 0 to prevent hydration mismatch
  const [cooldown, setCooldown] = useState(0);

  // Set initial cooldown after mount
  useEffect(() => {
    if (mounted) {
      setCooldown(initialCooldown);
    }
  }, [mounted, initialCooldown]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Handle digit input
  function handleDigitChange(idx: number, value: string) {
    const char = value.slice(-1);
    if (!/^\d$/.test(char) && char !== '') return;
    const next = [...digits];
    next[idx] = char;
    setDigits(next);
    if (char && idx < 5) inputRefs.current[idx + 1]?.focus();
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = Array(6).fill('');
    text.split('').forEach((c, i) => { next[i] = c; });
    setDigits(next);
    inputRefs.current[Math.min(text.length, 5)]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fullCode = digits.join('');
    if (fullCode.length < 6) return;
    
    setIsVerifying(true);
    setVerificationState('idle');
    setErrorMessage('');
    
    // Simulate OTP verification with validation
    setTimeout(() => {
      // Define correct OTP for demo (you can change this)
      const correctOTP = '123456';
      
      if (fullCode === correctOTP) {
        // Success case
        setVerificationState('success');
        setIsVerifying(false);
        
        // Show success message briefly, then redirect
        setTimeout(() => {
          // Use Next.js router for more reliable navigation
          router.push('/demo-dashboard');
        }, 1500); // Shorter delay for better UX
      } else {
        // Error case
        setVerificationState('error');
        setErrorMessage('Incorrect OTP. Please try again.');
        setIsVerifying(false);
        
        // Clear the OTP digits for retry
        setTimeout(() => {
          setDigits(['', '', '', '', '', '']);
          setVerificationState('idle');
          setErrorMessage('');
          inputRefs.current[0]?.focus();
        }, 3000);
      }
    }, 1000); // Reduced delay for faster verification
  }

  async function handleResend() {
    if (cooldown > 0) return;
    
    // Reset verification state and OTP
    setVerificationState('idle');
    setErrorMessage('');
    setCooldown(30);
    setDigits(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  }

  const fullCode = digits.join('');

  // Show loading state during hydration to prevent mismatch
  if (!mounted) {
    return (
      <div className="w-full space-y-8">
        <div className="text-center">
          <div className="w-48 h-8 bg-gray-200 rounded-lg mx-auto mb-4 animate-pulse"></div>
          <div className="w-32 h-6 bg-gray-200 rounded-lg mx-auto animate-pulse"></div>
        </div>
        <div className="flex justify-center gap-3">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-14 w-12 rounded-lg bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Enter Verification Code
        </h1>
        <p className="text-lg text-gray-600">
          We sent a 6-digit code to{' '}
          <span className="font-semibold text-gray-900">+91 {displayPhone}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* OTP digit grid */}
        <div className="flex justify-center gap-3" onPaste={handlePaste} role="group" aria-label="One-time password">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              aria-label={`Digit ${i + 1}`}
              className={[
                'h-14 w-12 rounded-lg border-2 text-center text-xl font-bold shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 bg-white',
                verificationState === 'error' 
                  ? 'border-red-400 focus:ring-red-200 focus:border-red-500' 
                  : verificationState === 'success'
                  ? 'border-green-400 focus:ring-green-200 focus:border-green-500'
                  : 'border-gray-300 focus:ring-green-200 focus:border-green-500 hover:border-gray-400'
              ].join(' ')}
              disabled={isVerifying || verificationState === 'success'}
            />
          ))}
        </div>

        {/* Status Messages */}
        {verificationState === 'success' && (
          <div className="rounded-xl bg-green-50 border border-green-200 p-6 text-center" role="alert">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">✓</span>
              </div>
              <div>
                <p className="text-lg font-bold text-green-800">
                  OTP Verified Successfully!
                </p>
                <p className="text-sm text-green-600">
                  Redirecting to dashboard...
                </p>
              </div>
            </div>
          </div>
        )}

        {verificationState === 'error' && errorMessage && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center" role="alert">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">✕</span>
              </div>
              <div>
                <p className="text-lg font-bold text-red-800">
                  {errorMessage}
                </p>
                <p className="text-sm text-red-600">
                  Please try again
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Demo Instructions */}
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-6 text-center">
          <p className="text-blue-800 font-medium text-lg mb-2">
            <strong>Demo Mode:</strong> Use OTP <code className="bg-blue-200 px-2 py-1 rounded font-mono">123456</code>
          </p>
          <p className="text-sm text-blue-600">
            Any other 6-digit code will show an error message
          </p>
        </div>

        <Button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          size="lg"
          isLoading={isVerifying}
          disabled={fullCode.length < 6 || verificationState === 'success'}
        >
          {isVerifying ? (
            <span className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Verifying...
            </span>
          ) : verificationState === 'success' ? (
            <span className="flex items-center gap-3">
              <span className="text-xl">✓</span>
              Verified Successfully!
            </span>
          ) : (
            <span className="text-lg font-semibold">Verify OTP Code</span>
          )}
        </Button>

        {/* Debug button for testing */}
        <Button
          type="button"
          variant="secondary"
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 shadow-sm hover:shadow-md transition-all duration-200"
          size="lg"
          onClick={() => {
            console.log('Force redirect to dashboard');
            setVerificationState('success');
            setTimeout(() => {
              router.push('/demo-dashboard');
            }, 500);
          }}
        >
          <span className="flex items-center gap-3 text-lg font-semibold">
            <span className="text-xl">🚀</span>
            Force Success (Debug)
          </span>
        </Button>
      </form>

      {/* Resend */}
      <div className="text-center">
        <p className="text-gray-600 text-lg mb-4">Didn't receive the code?</p>
        {cooldown > 0 ? (
          <div className="bg-gray-100 text-gray-500 px-6 py-3 rounded-xl font-medium">
            Resend available in {cooldown}s
          </div>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isVerifying || verificationState === 'success'}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Resend OTP Code
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center justify-center gap-2 w-full text-gray-500 hover:text-green-600 py-3 rounded-xl hover:bg-green-50 transition-all duration-200 font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to phone number
      </button>
    </div>
  );
}
