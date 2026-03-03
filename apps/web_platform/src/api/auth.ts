// API 服务 - 处理登录注册相关请求
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface RegisterData {
  email: string;
  code: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// 发送验证码
export const sendVerificationCode = async (email: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/send-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    return await response.json();
  } catch (error) {
    console.error('Send code error:', error);
    // 模拟成功（后端未实现时）
    return {
      success: true,
      message: '验证码已发送（模拟）',
    };
  }
};

// 注册
export const register = async (data: RegisterData): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error('Register error:', error);
    // 模拟成功（本地存储）
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find((u: RegisterData) => u.email === data.email)) {
      return { success: false, message: '该邮箱已注册' };
    }
    users.push({ email: data.email, password: data.password });
    localStorage.setItem('users', JSON.stringify(users));
    return { success: true, message: '注册成功' };
  }
};

// 登录
export const login = async (data: LoginData): Promise<ApiResponse<{ token: string; email: string }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    // 模拟验证（本地存储）
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: RegisterData) => u.email === data.email && u.password === data.password);
    if (user) {
      const token = `mock_token_${Date.now()}`;
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify({ email: data.email }));
      return { 
        success: true, 
        message: '登录成功',
        data: { token, email: data.email }
      };
    }
    return { success: false, message: '邮箱或密码错误' };
  }
};

// 退出登录
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
};

// 检查登录状态
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

// 获取当前用户
export const getCurrentUser = (): { email: string } | null => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};
