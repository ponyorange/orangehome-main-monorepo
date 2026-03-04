import { useApi, mutate, post, put, del } from './useApi';
import type { User, LoginParams, RegisterParams, LoginResult } from '@/types/auth';

// 用户相关的 API keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
};

// 获取当前用户信息
export function useCurrentUser() {
  return useApi<User>(userKeys.profile());
}

// 获取用户详情
export function useUser(id: string) {
  return useApi<User>(userKeys.detail(id));
}

// 获取用户列表
export function useUsers(filters: Record<string, unknown> = {}) {
  const queryString = new URLSearchParams(
    Object.entries(filters).map(([k, v]) => [k, String(v)])
  ).toString();
  const key = queryString ? `/users?${queryString}` : '/users';
  return useApi<User[]>(key);
}

// 登录 - 不使用 SWR，直接调用
export async function loginUser(params: LoginParams): Promise<LoginResult> {
  const result = await post<LoginResult>('/auth/login', params);
  if (result.token) {
    localStorage.setItem('auth_token', result.token);
    // 登录成功后刷新用户缓存
    mutate(userKeys.profile());
  }
  return result;
}

// 注册
export async function registerUser(params: RegisterParams): Promise<void> {
  await post('/auth/register', params);
}

// 退出登录
export async function logoutUser(): Promise<void> {
  await post('/auth/logout');
  localStorage.removeItem('auth_token');
  // 清除所有用户相关缓存
  mutate(userKeys.all, undefined, { revalidate: false });
}

// 更新用户信息
export async function updateUser(id: string, data: Partial<User>): Promise<User> {
  const result = await put<User>(`/users/${id}`, data);
  // 更新成功后刷新缓存
  mutate(userKeys.detail(id), result, false);
  mutate(userKeys.profile());
  return result;
}

// 删除用户
export async function deleteUser(id: string): Promise<void> {
  await del(`/users/${id}`);
  // 删除成功后刷新列表缓存
  mutate(userKeys.lists());
}
