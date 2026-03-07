import type { ApiResponse } from '@/types';
import type {
  Business,
  CreateBusinessParams,
  UpdateBusinessParams,
  BusinessListResponse,
  BusinessQueryParams,
} from '@/types/business';
import { API_ENDPOINTS } from './config';
import { request } from '@/lib/fetch';

/**
 * 业务线服务
 */
export const businessApi = {
  /**
   * 获取业务线列表
   */
  async getList(params?: BusinessQueryParams): Promise<ApiResponse<BusinessListResponse>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.pageSize) query.append('pageSize', String(params.pageSize));
    if (params?.keyword) query.append('keyword', params.keyword);
    if (params?.platformId) query.append('platformId', params.platformId);
    
    const queryString = query.toString();
    const url = `${API_ENDPOINTS.BUSINESS.LIST}${queryString ? `?${queryString}` : ''}`;
    
    return request<BusinessListResponse>(url, { method: 'GET' });
  },

  /**
   * 获取业务线详情
   */
  async getById(id: string): Promise<ApiResponse<Business>> {
    return request<Business>(API_ENDPOINTS.BUSINESS.DETAIL(id), { method: 'GET' });
  },

  /**
   * 创建业务线
   */
  async create(data: CreateBusinessParams): Promise<ApiResponse<Business>> {
    return request<Business>(API_ENDPOINTS.BUSINESS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * 更新业务线
   */
  async update(id: string, data: UpdateBusinessParams): Promise<ApiResponse<Business>> {
    return request<Business>(API_ENDPOINTS.BUSINESS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * 删除业务线
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return request<void>(API_ENDPOINTS.BUSINESS.DELETE(id), { method: 'DELETE' });
  },

  /**
   * 关联平台
   */
  async linkPlatform(id: string, platformId: string): Promise<ApiResponse<void>> {
    return request<void>(API_ENDPOINTS.BUSINESS.LINK_PLATFORM(id, platformId), {
      method: 'POST',
    });
  },

  /**
   * 移除平台关联
   */
  async unlinkPlatform(id: string, platformId: string): Promise<ApiResponse<void>> {
    return request<void>(API_ENDPOINTS.BUSINESS.UNLINK_PLATFORM(id, platformId), {
      method: 'DELETE',
    });
  },
};
