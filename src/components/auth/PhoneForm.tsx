'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';

interface PhoneFormProps {
  role?: 'CUSTOMER' | 'RESTAURANT_OWNER' | 'PLATFORM_ADMIN';
  restaurantGroupId?: string;
  title?: string;
  subtitle?: string;
}

export function PhoneForm({
  role = 'CUSTOMER',
  restaurantGroupId,
  title = 'Welcome to PlayBite',
  subtitle = 'Enter your phone number to get started',
}: PhoneFormProps) {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [displayPhone, setDisplayPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format Indian phone number for display
  const formatIndianPhone = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // If it's empty, return empty
    if (!digits) return '';
    
    // Format as Indian phone number (10 digits)
    if (digits.length <= 10) {
      const match = digits.match(/^(\d{0,5})(\d{0,5})$/);
      if (match) {
        const [, first, second] = match;
        if (second) {
          return `${first} ${second}`;
        }
        return first;
      }
    }
    
    // If more than 10 digits, truncate
    return formatIndianPhone(digits.slice(0, 10));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const digits = input.replace(/\D/g, '');
    
    // Limit to 10 digits for Indian numbers
    if (digits.length <= 10) {
      setPhoneNumber(digits);
      setDisplayPhone(formatIndianPhone(input));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length !== 10) return;
    
    setIsSubmitting(true);
    
    // Simulate OTP sending (bypass API for now)
    setTimeout(() => {
      const params = new URLSearchParams({
        phone: `+91${phoneNumber}`,
        role: role,
        cooldown: '30',
      });
      if (restaurantGroupId) params.set('restaurantGroupId', restaurantGroupId);
      router.push(`${ROUTES.AUTH_OTP}?${params.toString()}`);
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <span className="text-white text-3xl font-bold">P</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {title}
          </h1>
          <p className="text-gray-600 text-lg">{subtitle}</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone input */}
            <div>
              <label htmlFor="phoneDisplay" className="block text-sm font-semibold text-gray-700 mb-3">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2 text-gray-500">
                  <span className="text-2xl">🇮🇳</span>
                  <span className="font-medium">+91</span>
                </div>
                <input
                  id="phoneDisplay"
                  name="phoneDisplay"
                  type="tel"
                  autoComplete="tel"
                  placeholder="98765 43210"
                  required
                  value={displayPhone}
                  onChange={handlePhoneChange}
                  maxLength={11} // 5 + 1 space + 5
                  className="w-full pl-20 pr-4 py-4 text-lg border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm placeholder:text-gray-400 transition-all duration-200"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Enter your 10-digit Indian mobile number
              </p>
            </div>

            <button
              type="submit" 
              disabled={phoneNumber.length !== 10 || isSubmitting}
              className={`w-full py-4 rounded-2xl font-semibold text-lg shadow-lg transition-all duration-200 ${
                phoneNumber.length === 10 && !isSubmitting
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending OTP...
                </div>
              ) : (
                'Send OTP'
              )}
            </button>
          </form>

          {/* Terms */}
          <p className="text-center text-xs text-gray-500 mt-6 leading-relaxed">
            By continuing, you agree to our{' '}
            <a href="/legal/terms" className="text-indigo-600 hover:text-indigo-700 underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/legal/privacy" className="text-indigo-600 hover:text-indigo-700 underline">
              Privacy Policy
            </a>
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="text-2xl mb-2">🔒</div>
            <p className="text-xs text-gray-600 font-medium">Secure Login</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="text-2xl mb-2">⚡</div>
            <p className="text-xs text-gray-600 font-medium">Instant OTP</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="text-2xl mb-2">🎮</div>
            <p className="text-xs text-gray-600 font-medium">Play & Earn</p>
          </div>
        </div>
      </div>
    </main>
  );
}
