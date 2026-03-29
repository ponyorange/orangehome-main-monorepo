const API_BASE_URL = import.meta.env.VITE_BFF_API_URL || 'http://192.168.1.91:50054/api';

export interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem('accessToken') || localStorage.getItem('auth_token');
}

export function clearAuthTokens(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('auth_token');
}

export function storeAuthTokens(accessToken: string, refreshToken?: string): void {
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }
  return response.text() as unknown as T;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth = false, headers, ...rest } = options;
  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
      ...(!skipAuth && token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const errorPayload = await parseResponse<{ message?: string | string[] } | string>(response).catch(() => null);
    const message =
      typeof errorPayload === 'string'
        ? errorPayload
        : Array.isArray(errorPayload?.message)
          ? errorPayload.message.join(', ')
          : errorPayload?.message || `请求失败(${response.status})`;

    if (response.status === 401) {
      clearAuthTokens();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }

    throw new ApiError(message, response.status);
  }

  return parseResponse<T>(response);
}

export function get<T>(path: string, options?: RequestOptions): Promise<T> {
  return request<T>(path, {
    method: 'GET',
    ...options,
  });
}

export function post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: body === undefined ? undefined : JSON.stringify(body),
    ...options,
  });
}
