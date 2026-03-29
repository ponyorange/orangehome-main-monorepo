import axios from 'axios';

const API_BASE = import.meta.env.VITE_BFF_API_URL || 'http://192.168.1.91:50054/api';
const PUBLIC_AUTH_PATHS = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
  '/auth/send-email-code',
]);

const clearClientAuth = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('auth-storage');
};

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 请求拦截器 - 自动添加 token
apiClient.interceptors.request.use((config) => {
  if (config.url && PUBLIC_AUTH_PATHS.has(config.url)) {
    return config;
  }

  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || '网络错误';

    if (status === 401 && !PUBLIC_AUTH_PATHS.has(error.config?.url || '')) {
      clearClientAuth();

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('authExpired', '1');
        if (window.location.pathname !== '/login') {
          window.location.replace('/login');
        }
      }
    }

    return Promise.reject(new Error(Array.isArray(message) ? message.join(', ') : message));
  }
);

// 用户类型
export interface User {
  id: string;
  email: string;
  nickname?: string;
  avatar?: string;
}

// 登录响应
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

// 注册响应
export interface RegisterResponse {
  id: string;
  email: string;
  nickname?: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// 发送邮箱验证码
export const sendEmailCode = async (email: string) => {
  return apiClient.post('/auth/send-email-code', { email });
};

// 用户注册
export const register = async (data: {
  email: string;
  password: string;
  confirmPassword: string;
  code: string;
  nickname?: string;
}): Promise<RegisterResponse> => {
  return apiClient.post('/auth/register', data);
};

// 用户登录
export const login = async (data: { email: string; password: string }): Promise<LoginResponse> => {
  const response = await apiClient.post('/auth/login', data);
  // 登录成功后保存 token
  localStorage.setItem('accessToken', response.accessToken);
  localStorage.setItem('refreshToken', response.refreshToken);
  return response;
};

// 重置密码
export const resetPassword = async (data: { email: string; code: string; newPassword: string }) => {
  return apiClient.post('/auth/reset-password', data);
};

// 获取当前用户信息
export const getCurrentUser = async (): Promise<User> => {
  return apiClient.get('/auth/me');
};

// 用户登出
export const logout = async () => {
  await apiClient.post('/auth/logout');
  clearClientAuth();
};

export default apiClient;
