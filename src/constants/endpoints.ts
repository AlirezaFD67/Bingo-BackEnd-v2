export const ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    BASE: '/api/auth',
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    REQUEST_OTP: '/api/auth/request-otp',
    VERIFY_OTP: '/api/auth/verify-otp',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
  },

  // Admin endpoints
  ADMIN: {
    BASE: '/api/admin',
    USERS: {
      BASE: '/api/admin/users',
      LIST: '/api/admin/users',
      DETAIL: '/api/admin/users/:id',
      CREATE: '/api/admin/users',
      UPDATE: '/api/admin/users/:id',
      DELETE: '/api/admin/users/:id',
    },
    DASHBOARD: '/api/admin/dashboard',
    SETTINGS: '/api/admin/settings',
  },

  // User endpoints
  USER: {
    BASE: '/api/user',
    PROFILE: {
      BASE: '/api/user/profile',
      DETAIL: '/api/user/profile',
      UPDATE: '/api/user/profile',
    },
    PREFERENCES: '/api/user/preferences',
  },

  // General endpoints
  GENERAL: {
    BASE: '/api/general',
    HEALTH: '/api/general/health',
    VERSION: '/api/general/version',
    STATUS: '/api/general/status',
  },

  // API Documentation
  DOCS: {
    SWAGGER: '/api/docs',
    REDOC: '/api/redoc',
  },
};
