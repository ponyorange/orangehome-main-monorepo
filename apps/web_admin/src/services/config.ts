/**
 * API 配置
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || '/api',
  TIMEOUT: 10000,
};

/**
 * API 端点
 */
export const API_ENDPOINTS = {
  AUTH: {
    SEND_CODE: '/auth/send-code',
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
} as const;

/**
 * 本地存储键名
 */
export const STORAGE_KEYS = {
  TOKEN: 'web_admin_token',
  USER: 'web_admin_user',
} as const;
