import type { UserListQueryParams, UserListItem } from '@/types/user';
import { API_ENDPOINTS } from './config';
import { request } from '@/lib/fetch';

/**
 * 用户服务
 */
export const userApi = {
  async getList(params?: UserListQueryParams) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.pageSize) query.append('pageSize', String(params.pageSize));
    if (params?.emailKeyword) query.append('emailKeyword', params.emailKeyword);
    if (params?.status) query.append('status', params.status);
    const queryString = query.toString();
    const url = `${API_ENDPOINTS.USER.LIST}${queryString ? `?${queryString}` : ''}`;
    return request<{ data: UserListItem[]; total: number; page: number; pageSize: number }>(
      url,
      { method: 'GET' }
    );
  },

  async addIdentity(userId: string, identityName: string) {
    return request<{ success: boolean }>(API_ENDPOINTS.USER.ADD_IDENTITY(userId), {
      method: 'POST',
      body: JSON.stringify({ identityName }),
    });
  },

  async removeIdentity(userId: string, identityName: string) {
    return request<{ success: boolean }>(
      API_ENDPOINTS.USER.REMOVE_IDENTITY(userId, identityName),
      { method: 'DELETE' }
    );
  },
};
