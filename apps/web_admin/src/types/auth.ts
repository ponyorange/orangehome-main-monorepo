/**
 * 用户类型定义
 */
export interface User {
  id?: string;
  email: string;
  nickname?: string;
  avatar?: string;
  createdAt?: string;
}

/**
 * 登录请求参数
 */
export interface LoginParams {
  email: string;
  password: string;
  remember?: boolean;
}

/**
 * 注册请求参数（邮箱验证码注册）
 */
export interface RegisterParams {
  email: string;
  code: string;
  password: string;
  confirmPassword?: string;
}

/**
 * 发送验证码参数
 */
export interface SendCodeParams {
  email: string;
  type?: 'register' | 'reset_password';
}

/**
 * API 响应结构
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  token: string;
  user: User;
  expiresIn?: number;
}
