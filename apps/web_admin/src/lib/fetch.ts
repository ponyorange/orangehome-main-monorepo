import { API_CONFIG, STORAGE_KEYS } from '@/services/config';
import type { ApiResponse } from '@/types/auth';

const baseUrl = API_CONFIG.BASE_URL;

/**
 * 获取请求头
 */
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * 基础 fetch 封装
 */
export async function request<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const res = await fetch(`${baseUrl}${url}`, {
    ...options,
    headers: getHeaders(),
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const data = await res.json().catch(() => ({}));
  return data as ApiResponse<T>;
}
