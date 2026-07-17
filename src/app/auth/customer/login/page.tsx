import type { Metadata } from 'next';
import { CustomerLoginForm } from '@/components/auth/CustomerLoginForm';

export const metadata: Metadata = {
  title: 'Customer Login — PlayBite',
  description: 'Sign in to PlayBite with your phone number and password',
};

/**
 * Customer login page with phone number and password form.
 */
export default function CustomerLoginPage() {
  return <CustomerLoginForm />;
}
