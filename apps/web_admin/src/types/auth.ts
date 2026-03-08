/**
 * 用户类型定义（与 core-service UserInfoDto 一致）
 */
export interface User {
  id: string;
  email: string;
  nickname?: string;
  avatar?: string;
  identities?: string[];
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
  confirmPassword: string;
  nickname?: string;
}

/**
 * 发送验证码参数
 */
export interface SendCodeParams {
  email: string;
  type?: 'register' | 'reset_password';
}

/**
 * 重置密码参数
 */
export interface ResetPasswordParams {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword?: string;
}

/**
 * core-service 登录响应（直接返回，无包装）
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}
