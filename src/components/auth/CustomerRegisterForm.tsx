'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function CustomerRegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [displayPhone, setDisplayPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Format Indian phone number for display
  const formatIndianPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    
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
    
    return formatIndianPhone(digits.slice(0, 10));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    
    if (rawValue.length <= 10) {
      setFormData(prev => ({ ...prev, phoneNumber: rawValue }));
      setDisplayPhone(formatIndianPhone(rawValue));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('Please enter your first name');
      return false;
    }

    if (!formData.lastName.trim()) {
      setError('Please enter your last name');
      return false;
    }
    
    if (!formData.phoneNumber || formData.phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    
    if (!/^[6-9]/.test(formData.phoneNumber)) {
      setError('Phone number must start with 6, 7, 8, or 9');
      return false;
    }

    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Demo registration - in production, this would call your API
      console.log('Registering new customer:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: `+91${formData.phoneNumber}`,
        password: formData.password
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Demo: Auto-register and redirect
      router.push('/customer/');
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">PlayBite</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Join PlayBite!</h1>
          <p className="text-gray-600">Create your account to start playing games and earning rewards</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-1">
                First Name
              </label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="John"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-1">
                Last Name
              </label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          {/* Phone Number Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 font-medium">+91</span>
              </div>
              <Input
                id="phone"
                type="tel"
                value={displayPhone}
                onChange={handlePhoneChange}
                placeholder="98765 43210"
                className="pl-12 font-mono"
                maxLength={11}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Create a password (min. 6 characters)"
                className="pr-12"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="text-xl">
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Create Account Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 text-lg font-semibold mt-6"
            size="lg"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Account...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <span className="text-xl">🎮</span>
                Create My Account
              </span>
            )}
          </Button>

          {/* Divider */}
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">Already have an account?</span>
            </div>
          </div>

          {/* Sign In Link */}
          <Link href="/auth/customer/login">
            <Button
              type="button"
              variant="secondary"
              className="w-full border-2 border-green-500 text-green-600 hover:bg-green-50 py-3 text-lg font-semibold"
              size="lg"
            >
              <span className="flex items-center gap-3">
                <span className="text-xl">🔑</span>
                Sign In Instead
              </span>
            </Button>
          </Link>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-green-600 hover:text-green-700">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-green-600 hover:text-green-700">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}