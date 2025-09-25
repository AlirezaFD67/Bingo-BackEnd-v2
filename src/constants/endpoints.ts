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

  // Reservation endpoints
  RESERVATION: {
    BASE: '/reservation',
    RESERVE: '/reservation/reserve',
    ROOM_CARDS: '/reservation/room-cards',
  },

  // API Documentation
  DOCS: {
    SWAGGER: '/api/docs',
  },
};
