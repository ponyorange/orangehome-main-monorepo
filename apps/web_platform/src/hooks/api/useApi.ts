import useSWR, { 
  SWRConfiguration, 
  SWRResponse,
  mutate as swrMutate 
} from 'swr';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { useAppStore } from '@/store/appStore';

// 创建 axios 实例
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 自动添加 token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 添加语言头
    const language = useAppStore.getState().language;
    config.headers['Accept-Language'] = language;
    
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // 未授权，清除 token 并跳转登录
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// SWR fetcher 函数
const fetcher = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return apiClient.get(url, config) as Promise<T>;
};

// 通用 useSWR hook
export function useApi<T>(
  key: string | null,
  config?: SWRConfiguration & { axiosConfig?: AxiosRequestConfig }
): SWRResponse<T, AxiosError> {
  const { axiosConfig, ...swrConfig } = config || {};
  
  return useSWR<T, AxiosError>(
    key,
    (url: string) => fetcher<T>(url, axiosConfig),
    {
      revalidateOnFocus: false,
      errorRetryCount: 3,
      ...swrConfig,
    }
  );
}

// 手动触发请求
export const mutate = swrMutate;

// POST 请求
export const post = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  apiClient.post<T>(url, data, config);

// PUT 请求
export const put = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  apiClient.put<T>(url, data, config);

// DELETE 请求
export const del = <T>(url: string, config?: AxiosRequestConfig) =>
  apiClient.delete<T>(url, config);

// PATCH 请求
export const patch = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  apiClient.patch<T>(url, data, config);
