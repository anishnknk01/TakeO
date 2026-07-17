import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getSessionPayload } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { CompleteProfileForm } from '@/components/auth/CompleteProfileForm';
import { UserRole } from '@/types/auth';

export const metadata: Metadata = {
  title: 'Complete Profile — PlayBite',
  description: 'Set up your PlayBite profile',
};

export default async function CompleteProfilePage(props: {
  searchParams: Promise<{ restaurantGroupId?: string }>;
}) {
  const session = await getSessionPayload();

  // Only authenticated customers who haven't set a display handle yet reach this page
  if (!session || session.role !== UserRole.CUSTOMER) {
    redirect(ROUTES.AUTH_CUSTOMER_LOGIN);
  }

  const customer = await prisma.customer.findUnique({
    where: { id: session.userId },
    select: { displayHandle: true },
  });

  // Already has a display handle — skip to dashboard
  if (customer?.displayHandle) {
    redirect(ROUTES.DASHBOARD_CUSTOMER);
  }

  const { restaurantGroupId } = await props.searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <CompleteProfileForm restaurantGroupId={restaurantGroupId} />
    </main>
  );
}
