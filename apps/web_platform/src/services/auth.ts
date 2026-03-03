import { ApiResponse, LoginResponse, LoginParams, RegisterParams, SendCodeParams, User } from '../types/auth';
import { API_CONFIG, API_ENDPOINTS, STORAGE_KEYS } from './config';

/**
 * 认证服务 - 处理登录注册相关 API
 */
class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  /**
   * 获取请求头
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * 发送 HTTP 请求
   */
  private async request<T>(url: string, options: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        ...options,
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      // 开发环境模拟数据
      return this.mockRequest<T>(url, options);
    }
  }

  /**
   * 模拟请求（开发环境）
   */
  private mockRequest<T>(url: string, options: RequestInit): ApiResponse<T> {
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body as string) : {};

    // 发送验证码
    if (url === API_ENDPOINTS.AUTH.SEND_CODE && method === 'POST') {
      return {
        success: true,
        code: 200,
        message: '验证码已发送',
      } as ApiResponse<T>;
    }

    // 注册
    if (url === API_ENDPOINTS.AUTH.REGISTER && method === 'POST') {
      const users = this.getStoredUsers();
      if (users.find(u => u.email === body.email)) {
        return {
          success: false,
          code: 400,
          message: '该邮箱已被注册',
        };
      }
      users.push({ email: body.email, password: body.password });
      localStorage.setItem('mock_users', JSON.stringify(users));
      return {
        success: true,
        code: 200,
        message: '注册成功',
      } as ApiResponse<T>;
    }

    // 登录
    if (url === API_ENDPOINTS.AUTH.LOGIN && method === 'POST') {
      const users = this.getStoredUsers();
      const user = users.find(u => u.email === body.email && u.password === body.password);
      
      if (user) {
        const token = `mock_token_${Date.now()}`;
        const userData: User = { email: body.email, id: '1' };
        
        this.setToken(token);
        this.setUser(userData);
        
        return {
          success: true,
          code: 200,
          message: '登录成功',
          data: {
            token,
            user: userData,
          } as T,
        };
      }
      
      return {
        success: false,
        code: 401,
        message: '邮箱或密码错误',
      };
    }

    // 获取当前用户
    if (url === API_ENDPOINTS.AUTH.ME && method === 'GET') {
      const user = this.getUser();
      if (user) {
        return {
          success: true,
          code: 200,
          message: '获取成功',
          data: { user } as T,
        };
      }
      return {
        success: false,
        code: 401,
        message: '未登录',
      };
    }

    return {
      success: false,
      code: 404,
      message: '接口不存在',
    };
  }

  /**
   * 获取存储的用户列表
   */
  private getStoredUsers(): Array<{ email: string; password: string }> {
    const data = localStorage.getItem('mock_users');
    return data ? JSON.parse(data) : [];
  }

  /**
   * 发送验证码
   */
  async sendCode(params: SendCodeParams): Promise<ApiResponse> {
    return this.request(API_ENDPOINTS.AUTH.SEND_CODE, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * 注册
   */
  async register(params: RegisterParams): Promise<ApiResponse> {
    const { confirmPassword, ...registerData } = params;
    return this.request(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(registerData),
    });
  }

  /**
   * 登录
   */
  async login(params: LoginParams): Promise<ApiResponse<LoginResponse>> {
    return this.request(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * 退出登录
   */
  async logout(): Promise<void> {
    this.clearToken();
    this.clearUser();
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return this.request(API_ENDPOINTS.AUTH.ME, {
      method: 'GET',
    });
  }

  /**
   * 存储 Token
   */
  setToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  }

  /**
   * 获取 Token
   */
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  /**
   * 清除 Token
   */
  clearToken(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  }

  /**
   * 存储用户信息
   */
  setUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  /**
   * 获取用户信息
   */
  getUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  }

  /**
   * 清除用户信息
   */
  clearUser(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  /**
   * 检查是否已登录
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
export default authService;
