import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OtpForm } from '@/components/auth/OtpForm';

export const metadata: Metadata = {
  title: 'Verify Code — PlayBite',
  description: 'Enter the verification code sent to your phone',
};

export default function OtpPage() {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-green-500 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-8">
            <span className="text-4xl">🔐</span>
          </div>
          <h1 className="text-4xl font-bold mb-6 text-center">
            Secure Verification
          </h1>
          <p className="text-xl text-center text-green-100 leading-relaxed max-w-md">
            We've sent a verification code to your phone number to ensure your account security.
          </p>
          
          <div className="mt-12 space-y-4 text-center">
            <div className="flex items-center gap-3 text-green-100">
              <span className="text-2xl">🇮🇳</span>
              <span>Indian Phone Number Support</span>
            </div>
            <div className="flex items-center gap-3 text-green-100">
              <span className="text-2xl">⚡</span>
              <span>Instant OTP Delivery</span>
            </div>
            <div className="flex items-center gap-3 text-green-100">
              <span className="text-2xl">🔒</span>
              <span>Secure & Private</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-3xl font-bold text-gray-900">PlayBite</span>
            </div>
            <p className="text-gray-600">Verify your phone number</p>
          </div>

          <Suspense
            fallback={
              <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
                <p className="text-lg text-gray-600 font-medium">Loading verification...</p>
              </div>
            }
          >
            <OtpForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
