import type { ApiResponse } from '@/types';
import type {
  MaterialVersion,
  CreateMaterialVersionParams,
} from '@/types/materialVersion';
import { API_ENDPOINTS } from './config';
import { request } from '@/lib/fetch';

/**
 * 物料版本服务
 */
export const materialVersionApi = {
  /**
   * 创建版本
   */
  async create(data: CreateMaterialVersionParams): Promise<ApiResponse<MaterialVersion>> {
    return request<MaterialVersion>(API_ENDPOINTS.MATERIAL_VERSION.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * 获取版本详情
   */
  async getById(versionId: string): Promise<ApiResponse<MaterialVersion>> {
    return request<MaterialVersion>(API_ENDPOINTS.MATERIAL_VERSION.DETAIL(versionId), { method: 'GET' });
  },

  /**
   * 发布版本
   */
  async publish(versionId: string): Promise<ApiResponse<void>> {
    return request<void>(API_ENDPOINTS.MATERIAL_VERSION.PUBLISH(versionId), { method: 'POST' });
  },

  /**
   * 删除版本
   */
  async delete(versionId: string): Promise<ApiResponse<void>> {
    return request<void>(API_ENDPOINTS.MATERIAL_VERSION.DELETE(versionId), { method: 'DELETE' });
  },
};
