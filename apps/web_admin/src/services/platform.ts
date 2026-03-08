import type {
  Platform,
  CreatePlatformParams,
  UpdatePlatformParams,
  PlatformQueryParams,
} from '@/types/platform';
import { API_ENDPOINTS } from './config';
import { request } from '@/lib/fetch';

/**
 * 平台服务
 */
export const platformApi = {
  /**
   * 获取平台列表
   */
  async getList(params?: PlatformQueryParams) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.pageSize) query.append('limit', String(params.pageSize));
    if (params?.keyword) query.append('search', params.keyword);
    const queryString = query.toString();
    const url = `${API_ENDPOINTS.PLATFORM.LIST}${queryString ? `?${queryString}` : ''}`;
    return request<{ data: Platform[]; total: number; page: number; limit: number }>(url, { method: 'GET' });
  },

  /**
   * 获取平台详情
   */
  async getById(id: string) {
    return request<Platform>(API_ENDPOINTS.PLATFORM.DETAIL(id), { method: 'GET' });
  },

  /**
   * 创建平台
   */
  async create(data: CreatePlatformParams) {
    return request<Platform>(API_ENDPOINTS.PLATFORM.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * 更新平台
   */
  async update(id: string, data: UpdatePlatformParams) {
    return request<Platform>(API_ENDPOINTS.PLATFORM.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * 删除平台
   */
  async delete(id: string) {
    return request<void>(API_ENDPOINTS.PLATFORM.DELETE(id), { method: 'DELETE' });
  },
};
