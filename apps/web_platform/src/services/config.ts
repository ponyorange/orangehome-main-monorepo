/**
 * API 配置
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 10000,
  VERSION: 'v1',
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
    REFRESH_TOKEN: '/auth/refresh',
    ME: '/auth/me',
  },
} as const;

/**
 * HTTP 状态码
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const;

/**
 * 本地存储键名
 */
export const STORAGE_KEYS = {
  TOKEN: 'orangehome_token',
  USER: 'orangehome_user',
  REMEMBER_ME: 'orangehome_remember',
} as const;
