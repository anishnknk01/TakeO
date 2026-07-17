import type { Metadata } from 'next';
import { PhoneForm } from '@/components/auth/PhoneForm';

export const metadata: Metadata = {
  title: 'Customer Login — PlayBite',
  description: 'Log in to PlayBite with your phone number',
};

/**
 * Customer phone-number login entry point.
 * In production, restaurantGroupId is injected via the QR/NFC check-in URL.
 * For direct visits (e.g. /auth/customer/login), it is omitted and the OTP
 * verify step will request it.
 */
export default async function CustomerLoginPage(props: {
  searchParams: Promise<{ restaurantGroupId?: string }>;
}) {
  const { restaurantGroupId } = await props.searchParams;

  return (
    <PhoneForm
      role="CUSTOMER"
      restaurantGroupId={restaurantGroupId}
      title="Welcome to PlayBite"
      subtitle="Enter your phone number to earn points and rewards"
    />
  );
}
