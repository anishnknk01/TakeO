import type { Metadata } from 'next';
import { PhoneForm } from '@/components/auth/PhoneForm';

export const metadata: Metadata = {
  title: 'Admin Login — PlayBite',
  description: 'Platform administrator login',
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <PhoneForm
        role="PLATFORM_ADMIN"
        title="Admin Portal"
        subtitle="Platform administrator access only"
      />
    </main>
  );
}
