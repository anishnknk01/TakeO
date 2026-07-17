import type { Metadata } from 'next';
import { CustomerRegisterForm } from '@/components/auth/CustomerRegisterForm';

export const metadata: Metadata = {
  title: 'Sign Up — PlayBite',
  description: 'Create your PlayBite account to start playing games and earning rewards',
};

/**
 * Customer registration page with full form.
 */
export default function CustomerRegisterPage() {
  return <CustomerRegisterForm />;
}