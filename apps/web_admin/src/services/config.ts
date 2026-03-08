/**
 * API 配置
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 15000,
};

/**
 * API 端点
 */
export const API_ENDPOINTS = {
  USER: {
    LIST: '/users',
    ADD_IDENTITY: (id: string) => `/users/${id}/identities`,
    REMOVE_IDENTITY: (id: string, identityName: string) =>
      `/users/${id}/identities/${encodeURIComponent(identityName)}`,
  },
  AUTH: {
    SEND_EMAIL_CODE: '/auth/send-email-code',
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    RESET_PASSWORD: '/auth/reset-password',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  PLATFORM: {
    LIST: '/platforms',
    CREATE: '/platforms',
    DETAIL: (id: string) => `/platforms/${id}`,
    UPDATE: (id: string) => `/platforms/${id}`,
    DELETE: (id: string) => `/platforms/${id}`,
  },
  BUSINESS: {
    LIST: '/businesses',
    CREATE: '/businesses',
    DETAIL: (id: string) => `/businesses/${id}`,
    UPDATE: (id: string) => `/businesses/${id}`,
    DELETE: (id: string) => `/businesses/${id}`,
    LINK_PLATFORM: (id: string, platformId: string) => `/businesses/${id}/platforms/${platformId}`,
    UNLINK_PLATFORM: (id: string, platformId: string) => `/businesses/${id}/platforms/${platformId}`,
  },
  MATERIAL_TYPE: {
    LIST: '/material-types',
    CREATE: '/material-types',
    DETAIL: (id: string) => `/material-types/${id}`,
    UPDATE: (id: string) => `/material-types/${id}`,
    DELETE: (id: string) => `/material-types/${id}`,
  },
  MATERIAL_CATEGORY: {
    LIST: '/material-categories',
    TREE_LIST: '/material-categories/tree/list',
    CREATE: '/material-categories',
    DETAIL: (id: string) => `/material-categories/${id}`,
    UPDATE: (id: string) => `/material-categories/${id}`,
    DELETE: (id: string) => `/material-categories/${id}`,
    MOVE: (id: string) => `/material-categories/${id}/move`,
  },
  MATERIAL: {
    LIST: '/materials',
    CREATE: '/materials',
    DETAIL: (id: string) => `/materials/${id}`,
    UPDATE: (id: string) => `/materials/${id}`,
    DELETE: (id: string) => `/materials/${id}`,
    VERSIONS: (materialId: string) => `/materials/${materialId}/versions`,
    PRESIGNED_UPLOAD: '/materials/upload/presigned',
  },
  MATERIAL_VERSION: {
    CREATE: '/versions',
    DETAIL: (versionId: string) => `/versions/${versionId}`,
    PUBLISH: (versionId: string) => `/versions/${versionId}/publish`,
    DELETE: (versionId: string) => `/versions/${versionId}`,
  },
} as const;

/**
 * 本地存储键名
 */
export const STORAGE_KEYS = {
  TOKEN: 'web_admin_token',
  USER: 'web_admin_user',
} as const;
