import { API_CONFIG, STORAGE_KEYS } from '@/services/config';

const baseUrl = API_CONFIG.BASE_URL;

/** 公开接口（401 时不跳转登录页，如登录、注册等） */
function isPublicPath(url: string): boolean {
  return url.includes('/auth/');
}

/**
 * 登录过期处理：清除本地凭证并跳转登录页
 */
function handleUnauthorized(url: string): void {
  if (isPublicPath(url)) return;
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  window.location.href = '/login?expired=1';
}

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

/** core-service 错误响应格式 */
interface ErrorBody {
  statusCode?: number;
  message?: string | string[];
}

/**
 * 基础 fetch 封装
 * core-service 成功时直接返回 JSON，错误时返回 { statusCode, message }
 * 401 时清除登录态并跳转登录页
 */
export async function request<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${baseUrl}${url}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers as Record<string, string> || {}),
    } as HeadersInit,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) {
      if (!isPublicPath(url)) {
        handleUnauthorized(url);
      }
      throw new Error(isPublicPath(url) ? '邮箱或密码错误' : '登录已过期，请重新登录');
    }
    const errBody = data as ErrorBody;
    const msg =
      typeof errBody.message === 'string'
        ? errBody.message
        : Array.isArray(errBody.message)
          ? errBody.message[0]
          : `请求失败 (${res.status})`;
    throw new Error(msg);
  }

  return data as T;
}
