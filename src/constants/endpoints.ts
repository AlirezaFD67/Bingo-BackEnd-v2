export const ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    BASE: '/auth',
    REQUEST_OTP: '/auth/request-otp',
    VERIFY_OTP: '/auth/verify-otp',
  },

  // Admin endpoints
  ADMIN: {
    BASE: '/admin',
    USERS: '/admin/users',
    WALLET: {
      BASE: '/admin/wallet',
      TRANSACTIONS: '/admin/wallet/transactions',
    },
  },

  // API Documentation
  DOCS: {
    SWAGGER: '/api/docs',
  },
};
