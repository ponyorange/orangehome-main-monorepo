/**
 * 验证邮箱格式
 */
export const isValidEmail = (email: string): boolean => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
};

/**
 * 验证密码强度
 * 至少6位，包含字母和数字
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

/**
 * 验证验证码格式
 */
export const isValidCode = (code: string): boolean => {
  return /^\d{6}$/.test(code);
};
