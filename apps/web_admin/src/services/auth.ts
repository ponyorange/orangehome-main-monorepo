import type {
  LoginParams,
  LoginResponse,
  RegisterParams,
  ResetPasswordParams,
  SendCodeParams,
  User,
} from '@/types/auth';
import { API_ENDPOINTS, STORAGE_KEYS } from './config';
import { request } from '@/lib/fetch';

/**
 * 认证服务 - 对接 core-service 用户认证接口
 */
export const authApi = {
  async sendCode(params: SendCodeParams) {
    return request<{ success: boolean; message: string }>(
      API_ENDPOINTS.AUTH.SEND_EMAIL_CODE,
      {
        method: 'POST',
        body: JSON.stringify({ email: params.email }),
      }
    );
  },

  async register(params: RegisterParams) {
    return request<{ userId: string; message: string }>(
      API_ENDPOINTS.AUTH.REGISTER,
      {
        method: 'POST',
        body: JSON.stringify({
          email: params.email,
          password: params.password,
          confirmPassword: params.confirmPassword,
          code: params.code,
          nickname: params.nickname,
        }),
      }
    );
  },

  async login(params: LoginParams) {
    return request<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({
        email: params.email,
        password: params.password,
      }),
    });
  },

  async resetPassword(params: ResetPasswordParams) {
    return request<{ success: boolean; message: string }>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      {
        method: 'POST',
        body: JSON.stringify({
          email: params.email,
          code: params.code,
          newPassword: params.newPassword,
        }),
      }
    );
  },

  async getCurrentUser() {
    return request<User | null>(API_ENDPOINTS.AUTH.ME, { method: 'GET' });
  },

  async logout() {
    return request<{ success: boolean }>(API_ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
    });
  },
};

/**
 * Token/User 存储工具
 */
export const authStorage = {
  setToken(token: string) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },
  clearToken() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },
  setUser(user: User) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  getUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },
  clearUser() {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
  isAuthenticated() {
    return !!this.getToken();
  },
};
