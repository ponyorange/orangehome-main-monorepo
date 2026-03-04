import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError 
} from 'axios';
import { useAppStore } from '../store';

// API 响应数据格式
export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
  success: boolean;
}

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 从 store 或 localStorage 获取 token
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 设置全局加载状态
    useAppStore.getState().setGlobalLoading(true);
    
    return config;
  },
  (error) => {
    useAppStore.getState().setGlobalLoading(false);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    useAppStore.getState().setGlobalLoading(false);
    
    const { data } = response;
    
    // 业务逻辑错误处理
    if (!data.success) {
      return Promise.reject(new Error(data.message || '请求失败'));
    }
    
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    useAppStore.getState().setGlobalLoading(false);
    
    if (error.response) {
      const { status, data } = error.response;
      
      // 根据状态码处理错误
      switch (status) {
        case 401:
          // 未授权，清除登录状态并跳转
          localStorage.removeItem('auth_token');
          useAppStore.getState().setIsAuthenticated(false);
          useAppStore.getState().setUser(null);
          window.location.href = '/login';
          break;
          
        case 403:
          console.error('无权访问');
          break;
          
        case 404:
          console.error('资源不存在');
          break;
          
        case 500:
          console.error('服务器错误');
          break;
          
        default:
          console.error('请求错误:', data?.message || error.message);
      }
    } else if (error.request) {
      console.error('网络错误，请检查网络连接');
    } else {
      console.error('请求配置错误:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// 封装 HTTP 方法
export const http = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<ApiResponse<T>>(url, config).then((res) => res.data.data),
    
  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<ApiResponse<T>>(url, data, config).then((res) => res.data.data),
    
  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.put<ApiResponse<T>>(url, data, config).then((res) => res.data.data),
    
  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch<ApiResponse<T>>(url, data, config).then((res) => res.data.data),
    
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<ApiResponse<T>>(url, config).then((res) => res.data.data),
};

export default apiClient;
