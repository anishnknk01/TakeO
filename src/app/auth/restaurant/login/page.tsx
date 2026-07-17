import type { Metadata } from 'next';
import { PhoneForm } from '@/components/auth/PhoneForm';

export const metadata: Metadata = {
  title: 'Restaurant Login — PlayBite',
  description: 'Restaurant owner and staff login',
};

export default function RestaurantLoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <PhoneForm
        role="RESTAURANT_OWNER"
        title="Restaurant Portal"
        subtitle="Sign in to manage your PlayBite experience"
      />
    </main>
  );
}
