'use client';

import { useActionState } from 'react';
import { logoutAction, logoutAllDevicesAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/Button';

export function LogoutButtons() {
  const [, logoutFormAction, isLoggingOut] = useActionState(logoutAction, {
    success: false as const,
    error: '',
  });
  const [, logoutAllFormAction, isLoggingOutAll] = useActionState(logoutAllDevicesAction, {
    success: false as const,
    error: '',
  });

  return (
    <div className="flex flex-col gap-3">
      <form action={logoutFormAction}>
        <Button type="submit" variant="secondary" className="w-full" isLoading={isLoggingOut}>
          Logout from this device
        </Button>
      </form>
      <form action={logoutAllFormAction}>
        <Button type="submit" variant="danger" className="w-full" isLoading={isLoggingOutAll}>
          Logout from all devices
        </Button>
      </form>
    </div>
  );
}
