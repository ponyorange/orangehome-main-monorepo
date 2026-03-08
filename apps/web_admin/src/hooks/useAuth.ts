import { useCallback } from 'react';
import useSWRMutation from 'swr/mutation';
import { Toast } from '@douyinfe/semi-ui';
import { authApi, authStorage } from '@/services/auth';
import type {
  LoginParams,
  RegisterParams,
  ResetPasswordParams,
  SendCodeParams,
} from '@/types/auth';

type FetcherArg<T> = { arg: T };

/** 登录 */
export function useLogin() {
  const { trigger, isMutating } = useSWRMutation(
    '/auth/login',
    async (_key, { arg }: FetcherArg<LoginParams>) => authApi.login(arg)
  );

  const login = useCallback(
    async (params: LoginParams): Promise<boolean> => {
      try {
        const res = await trigger(params);
        if (res?.accessToken && res?.user) {
          authStorage.setToken(res.accessToken);
          authStorage.setUser(res.user);
          Toast.success('登录成功');
          return true;
        }
        Toast.error('登录失败');
        return false;
      } catch (e) {
        Toast.error(e instanceof Error ? e.message : '登录失败，请稍后重试');
        return false;
      }
    },
    [trigger]
  );

  return { login, loading: isMutating };
}

/** 注册 */
export function useRegister() {
  const { trigger, isMutating } = useSWRMutation(
    '/auth/register',
    async (_key, { arg }: FetcherArg<RegisterParams>) => authApi.register(arg)
  );

  const register = useCallback(
    async (params: RegisterParams): Promise<boolean> => {
      try {
        const res = await trigger(params);
        if (res?.userId !== undefined) {
          Toast.success(res.message || '注册成功，请登录');
          return true;
        }
        Toast.error('注册失败');
        return false;
      } catch (e) {
        Toast.error(e instanceof Error ? e.message : '注册失败，请稍后重试');
        return false;
      }
    },
    [trigger]
  );

  return { register, loading: isMutating };
}

/** 发送验证码 */
export function useSendCode() {
  const { trigger, isMutating } = useSWRMutation(
    '/auth/send-email-code',
    async (_key, { arg }: FetcherArg<SendCodeParams>) => authApi.sendCode(arg)
  );

  const sendCode = useCallback(
    async (params: SendCodeParams): Promise<boolean> => {
      try {
        const res = await trigger(params);
        if (res?.success) {
          Toast.success(res.message || '验证码已发送');
          return true;
        }
        Toast.error('发送失败');
        return false;
      } catch (e) {
        Toast.error(e instanceof Error ? e.message : '发送验证码失败，请稍后重试');
        return false;
      }
    },
    [trigger]
  );

  return { sendCode, loading: isMutating };
}

/** 重置密码 */
export function useResetPassword() {
  const { trigger, isMutating } = useSWRMutation(
    '/auth/reset-password',
    async (_key, { arg }: FetcherArg<ResetPasswordParams>) =>
      authApi.resetPassword(arg)
  );

  const resetPassword = useCallback(
    async (params: ResetPasswordParams): Promise<boolean> => {
      try {
        const res = await trigger(params);
        if (res?.success) {
          Toast.success(res.message || '密码重置成功');
          return true;
        }
        Toast.error('重置失败');
        return false;
      } catch (e) {
        Toast.error(
          e instanceof Error ? e.message : '重置密码失败，请稍后重试'
        );
        return false;
      }
    },
    [trigger]
  );

  return { resetPassword, loading: isMutating };
}

/** 退出登录 */
export function useLogout() {
  return useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // 忽略登出接口失败，本地清理照常进行
    } finally {
      authStorage.clearToken();
      authStorage.clearUser();
      Toast.success('已退出登录');
    }
  }, []);
}
