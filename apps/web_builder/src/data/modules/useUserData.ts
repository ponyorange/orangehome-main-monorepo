import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { ApiError, clearAuthTokens, get, getAccessToken, post, storeAuthTokens } from '../api/client';

export interface UserInfo {
  id: string;
  email: string;
  nickname?: string;
  avatar?: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserInfo;
}

const CURRENT_USER_KEY = '/auth/me';

export function useUserData() {
  const [token, setToken] = useState<string | null>(() => getAccessToken());
  const { data, error, isLoading, mutate } = useSWR<UserInfo | null>(
    token ? CURRENT_USER_KEY : null,
    () => get<UserInfo>(CURRENT_USER_KEY),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const isAuthenticated = useMemo(() => Boolean(token && data), [data, token]);

  useEffect(() => {
    if (!(error instanceof ApiError) || error.status !== 401) return;
    clearAuthTokens();
    setToken(null);
    void mutate(null, false);
  }, [error, mutate]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      void mutate(null, false);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [mutate]);

  const login = async (params: LoginParams) => {
    const result = await post<LoginResult>('/auth/login', params, { skipAuth: true });
    storeAuthTokens(result.accessToken, result.refreshToken);
    setToken(result.accessToken);
    await mutate(result.user, false);
    return result;
  };

  const logout = async () => {
    try {
      if (getAccessToken()) {
        await post('/auth/logout', {});
      }
    } finally {
      clearAuthTokens();
      setToken(null);
      await mutate(null, false);
    }
  };

  return {
    user: data ?? null,
    error,
    isLoading,
    hasToken: Boolean(token),
    isAuthenticated,
    login,
    logout,
    refreshUser: mutate,
  };
}
