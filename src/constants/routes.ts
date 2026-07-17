export const ROUTES = {
  // Public
  HOME: '/',
  PRICING: '/pricing',
  FEATURES: '/features',
  CONTACT: '/contact',

  // Auth — entry points
  AUTH_CUSTOMER_LOGIN: '/auth/customer/login',
  AUTH_RESTAURANT_LOGIN: '/auth/restaurant/login',
  AUTH_ADMIN_LOGIN: '/auth/admin/login',

  // Auth — flow steps
  AUTH_OTP: '/auth/otp',
  AUTH_COMPLETE_PROFILE: '/auth/complete-profile',
  AUTH_SESSION_MANAGER: '/auth/sessions',
  AUTH_ERROR: '/auth/error',

  // API — auth
  API_SEND_OTP: '/api/auth/send-otp',
  API_VERIFY_OTP: '/api/auth/verify-otp',
  API_REFRESH: '/api/auth/refresh',
  API_LOGOUT: '/api/auth/logout',
  API_ME: '/api/auth/me',

  // API — restaurants
  API_RESTAURANTS: '/api/restaurants',
  API_RESTAURANT_GROUPS: '/api/restaurant-groups',
  API_BRANCHES: '/api/branches',
  API_STAFF: '/api/staff',

  // API — check-in
  API_CHECKIN_QR: '/api/checkin/qr',
  API_CHECKIN_NFC: '/api/checkin/nfc',
  API_CHECKIN_MANUAL: '/api/checkin/manual',
  API_CHECKOUT: '/api/checkin/checkout',
  API_CHECKIN_SESSION: '/api/checkin/session',
  API_VISIT_HISTORY: '/api/checkin/visit-history',
  API_QR_GENERATE: '/api/checkin/qr-generate',
  API_NFC_REGISTER: '/api/checkin/nfc-register',
  API_NFC_TAGS: '/api/checkin/nfc-tags',

  // API — games
  API_GAMES: '/api/games',
  API_GAME_START: '/api/games/start',
  API_GAME_SCORE: '/api/games/score',
  API_GAME_ABANDON: '/api/games/abandon',
  API_GAME_HISTORY: '/api/games/history',
  API_GAME_PERSONAL_BESTS: '/api/games/personal-bests',

  // Customer Dashboard
  DASHBOARD_CUSTOMER: '/dashboard/customer',
  DASHBOARD_CUSTOMER_GAMES: '/dashboard/customer/games',
  DASHBOARD_CUSTOMER_HISTORY: '/dashboard/customer/history',

  // Customer Portal (New Mobile-First Section)
  CUSTOMER_PORTAL: '/customer',
  CUSTOMER_GAMES: '/customer/games',
  CUSTOMER_REWARDS: '/customer/rewards',
  CUSTOMER_LEADERBOARD: '/customer/leaderboard',
  CUSTOMER_PROFILE: '/customer/profile',

  // Restaurant Owner Dashboard
  DASHBOARD_RESTAURANT: '/dashboard/restaurant',
  DASHBOARD_RESTAURANT_OVERVIEW: '/dashboard/restaurant',
  DASHBOARD_RESTAURANT_RESTAURANTS: '/dashboard/restaurant/restaurants',
  DASHBOARD_RESTAURANT_RESTAURANTS_NEW: '/dashboard/restaurant/restaurants/new',
  DASHBOARD_RESTAURANT_BRANCHES: '/dashboard/restaurant/branches',
  DASHBOARD_RESTAURANT_BRANCHES_NEW: '/dashboard/restaurant/branches/new',
  DASHBOARD_RESTAURANT_STAFF: '/dashboard/restaurant/staff',
  DASHBOARD_RESTAURANT_CUSTOMERS: '/dashboard/restaurant/customers',
  DASHBOARD_RESTAURANT_SETTINGS: '/dashboard/restaurant/settings',

  // Restaurant Admin Portal (Enhanced Management)
  RESTAURANT_ADMIN: '/restaurant-admin',
  RESTAURANT_ADMIN_GAMES: '/restaurant-admin/games',
  RESTAURANT_ADMIN_REWARDS: '/restaurant-admin/rewards',
  RESTAURANT_ADMIN_CUSTOMERS: '/restaurant-admin/customers',
  RESTAURANT_ADMIN_ANALYTICS: '/restaurant-admin/analytics',
  RESTAURANT_ADMIN_SETTINGS: '/restaurant-admin/settings',

  // Restaurant Check-in management
  DASHBOARD_RESTAURANT_CHECKIN: '/dashboard/restaurant/checkin',
  DASHBOARD_RESTAURANT_QR: '/dashboard/restaurant/checkin/qr',
  DASHBOARD_RESTAURANT_NFC: '/dashboard/restaurant/checkin/nfc',
  DASHBOARD_RESTAURANT_VISITORS: '/dashboard/restaurant/checkin/visitors',
  DASHBOARD_RESTAURANT_VISIT_HISTORY: '/dashboard/restaurant/checkin/history',
  DASHBOARD_RESTAURANT_CHECKIN_SETTINGS: '/dashboard/restaurant/checkin/settings',

  // Admin Dashboard
  DASHBOARD_ADMIN: '/dashboard/admin',
  DASHBOARD_ADMIN_RESTAURANTS: '/dashboard/admin/restaurants',
  DASHBOARD_ADMIN_GROUPS: '/dashboard/admin/groups',
  DASHBOARD_ADMIN_USERS: '/dashboard/admin/users',
  DASHBOARD_ADMIN_GAMES: '/dashboard/admin/games',
  DASHBOARD_ADMIN_GAMES_NEW: '/dashboard/admin/games/new',
  DASHBOARD_RESTAURANT_GAMES: '/dashboard/restaurant/games',

  // Leaderboard
  DASHBOARD_CUSTOMER_LEADERBOARD: '/dashboard/customer/leaderboard',
  DASHBOARD_CUSTOMER_REWARDS: '/dashboard/customer/rewards',
  DASHBOARD_CUSTOMER_SPIN: '/dashboard/customer/spin',
  DASHBOARD_RESTAURANT_LEADERBOARD: '/dashboard/restaurant/leaderboard',
  DASHBOARD_RESTAURANT_REWARDS: '/dashboard/restaurant/rewards',
  DASHBOARD_RESTAURANT_REDEEM: '/dashboard/restaurant/redeem',
  DASHBOARD_ADMIN_LEADERBOARD: '/dashboard/admin/leaderboard',
  API_LEADERBOARD_DAILY: '/api/leaderboard/daily',
  API_LEADERBOARD_WEEKLY: '/api/leaderboard/weekly',
  API_LEADERBOARD_MONTHLY: '/api/leaderboard/monthly',
  API_LEADERBOARD_LIFETIME: '/api/leaderboard/lifetime',
  API_LEADERBOARD_ME: '/api/leaderboard/me',
  API_LEADERBOARD_RECALCULATE: '/api/leaderboard/recalculate',

  // Rewards
  API_REWARDS: '/api/rewards',
  API_REWARD_WALLET: '/api/rewards/wallet',
  API_SPIN: '/api/rewards/spin',
  API_SPIN_HISTORY: '/api/rewards/spin-history',
  API_REDEEM: '/api/rewards/redeem',

  // Analytics
  DASHBOARD_RESTAURANT_ANALYTICS: '/dashboard/restaurant/analytics',
  DASHBOARD_ADMIN_ANALYTICS: '/dashboard/admin/analytics',
  API_ANALYTICS_DASHBOARD: '/api/analytics/dashboard',
  API_ANALYTICS_EXPORT: '/api/analytics/export',
  API_ANALYTICS_COMPUTE: '/api/analytics/compute',

  // Billing
  DASHBOARD_RESTAURANT_BILLING: '/dashboard/restaurant/billing',
  API_BILLING_PLANS: '/api/billing/plans',
  API_BILLING_SUBSCRIBE: '/api/billing/subscribe',
  API_BILLING_INVOICES: '/api/billing/invoices',
  API_BILLING_WEBHOOK: '/api/billing/webhook',
  API_HEALTH: '/api/health',

  // Onboarding
  ONBOARDING: '/onboarding',
} as const;

export type RouteValue = (typeof ROUTES)[keyof typeof ROUTES];
