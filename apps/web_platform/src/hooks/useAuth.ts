import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth';
import { User, LoginParams, RegisterParams, SendCodeParams, ApiResponse, LoginResponse } from '../types/auth';
import { Toast } from '@douyinfe/semi-ui';

/**
 * 认证状态 Hook
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // 初始化时检查登录状态
  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        const storedUser = authService.getUser();
        if (storedUser) {
          setUser(storedUser);
          setIsAuthenticated(true);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  /**
   * 登录
   */
  const login = useCallback(async (params: LoginParams): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await authService.login(params);
      if (response.success && response.data) {
        const { user: userData } = response.data as LoginResponse;
        setUser(userData);
        setIsAuthenticated(true);
        Toast.success('登录成功');
        return true;
      } else {
        Toast.error(response.message || '登录失败');
        return false;
      }
    } catch (error) {
      Toast.error('登录失败，请稍后重试');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 注册
   */
  const register = useCallback(async (params: RegisterParams): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await authService.register(params);
      if (response.success) {
        Toast.success('注册成功，请登录');
        return true;
      } else {
        Toast.error(response.message || '注册失败');
        return false;
      }
    } catch (error) {
      Toast.error('注册失败，请稍后重试');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 发送验证码
   */
  const sendCode = useCallback(async (params: SendCodeParams): Promise<boolean> => {
    try {
      const response = await authService.sendCode(params);
      if (response.success) {
        Toast.success(response.message || '验证码已发送');
        return true;
      } else {
        Toast.error(response.message || '发送失败');
        return false;
      }
    } catch (error) {
      Toast.error('发送验证码失败，请稍后重试');
      return false;
    }
  }, []);

  /**
   * 退出登录
   */
  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    Toast.success('已退出登录');
  }, []);

  return {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    sendCode,
    logout,
  };
}
