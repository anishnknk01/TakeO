import type { DefaultSession } from 'next-auth';

export enum UserRole {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  RESTAURANT_OWNER = 'RESTAURANT_OWNER',
  RESTAURANT_STAFF = 'RESTAURANT_STAFF',
  CUSTOMER = 'CUSTOMER',
}

export interface SessionUser {
  id: string;
  role: UserRole;
  name?: string | null;
  email?: string | null;
  restaurantGroupId?: string | null;
}

// Extend next-auth Session type
declare module 'next-auth' {
  interface Session {
    user: SessionUser & DefaultSession['user'];
  }
  interface User {
    role?: UserRole;
    restaurantGroupId?: string | null;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    role?: UserRole;
    userId?: string;
    restaurantGroupId?: string | null;
  }
}
