import type {
  ApiResponse,
  LoginParams,
  LoginResponse,
  RegisterParams,
  SendCodeParams,
  User,
} from '@/types/auth';
import { API_ENDPOINTS, STORAGE_KEYS } from './config';
import { request } from '@/lib/fetch';

const MOCK_USERS_KEY = 'web_admin_mock_users';

function getMockUsers(): Array<{ email: string; password: string }> {
  const data = localStorage.getItem(MOCK_USERS_KEY);
  return data ? JSON.parse(data) : [];
}

/** 开发环境 Mock 实现 */
function mockAuth(
  url: string,
  method: string,
  body?: Record<string, unknown>
): ApiResponse<unknown> | null {
  if (url === API_ENDPOINTS.AUTH.SEND_CODE && method === 'POST') {
    return { success: true, code: 200, message: '验证码已发送' };
  }
  if (url === API_ENDPOINTS.AUTH.REGISTER && method === 'POST' && body) {
    const users = getMockUsers();
    if (users.some((u) => u.email === body.email)) {
      return { success: false, code: 400, message: '该邮箱已被注册' };
    }
    users.push({ email: body.email as string, password: body.password as string });
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
    return { success: true, code: 200, message: '注册成功' };
  }
  if (url === API_ENDPOINTS.AUTH.LOGIN && method === 'POST' && body) {
    const users = getMockUsers();
    const user = users.find((u) => u.email === body.email && u.password === body.password);
    if (user) {
      const token = `mock_token_${Date.now()}`;
      const userData: User = { email: user.email, id: '1' };
      return {
        success: true,
        code: 200,
        message: '登录成功',
        data: { token, user: userData },
      };
    }
    return { success: false, code: 401, message: '邮箱或密码错误' };
  }
  if (url === API_ENDPOINTS.AUTH.ME && method === 'GET') {
    const user = authStorage.getUser();
    if (user) return { success: true, code: 200, message: 'ok', data: { user } };
    return { success: false, code: 401, message: '未登录' };
  }
  return null;
}

async function requestWithMock<T>(
  url: string,
  options: RequestInit
): Promise<ApiResponse<T>> {
  try {
    return await request<T>(url, options);
  } catch {
    const mock = mockAuth(url, options.method || 'GET', options.body ? JSON.parse(options.body as string) : undefined);
    if (mock) return mock as ApiResponse<T>;
    throw new Error('请求失败');
  }
}

/**
 * 认证服务 - 使用 fetch + SWR，开发环境支持 Mock
 */
export const authApi = {
  async sendCode(params: SendCodeParams): Promise<ApiResponse> {
    return requestWithMock(API_ENDPOINTS.AUTH.SEND_CODE, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async register(params: Omit<RegisterParams, 'confirmPassword'>): Promise<ApiResponse> {
    return requestWithMock(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async login(params: LoginParams): Promise<ApiResponse<LoginResponse>> {
    return requestWithMock(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return requestWithMock(API_ENDPOINTS.AUTH.ME, { method: 'GET' });
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
