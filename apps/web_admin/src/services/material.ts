import type { ApiResponse } from '@/types';
import type {
  Material,
  CreateMaterialParams,
  UpdateMaterialParams,
  MaterialListResponse,
  MaterialQueryParams,
  PresignedUploadBody,
  PresignedUploadResponse,
} from '@/types/material';
import type { MaterialVersionListResponse } from '@/types/materialVersion';
import { API_ENDPOINTS } from './config';
import { request } from '@/lib/fetch';

/**
 * 物料服务
 */
export const materialApi = {
  /**
   * 获取物料列表
   */
  async getList(params?: MaterialQueryParams) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.pageSize) query.append('limit', String(params.pageSize));
    if (params?.keyword) query.append('searchKeyword', params.keyword);
    if (params?.typeId) query.append('typeId', params.typeId);
    if (params?.categoryId) query.append('categoryId', params.categoryId);
    if (params?.platformId) query.append('platformId', params.platformId);
    if (params?.status) query.append('status', params.status);
    const queryString = query.toString();
    const url = `${API_ENDPOINTS.MATERIAL.LIST}${queryString ? `?${queryString}` : ''}`;
    return request<{ data: Material[]; total: number; page: number; limit: number }>(url, { method: 'GET' });
  },

  /**
   * 获取物料详情
   */
  async getById(id: string): Promise<ApiResponse<Material>> {
    return request<Material>(API_ENDPOINTS.MATERIAL.DETAIL(id), { method: 'GET' });
  },

  /**
   * 创建物料
   */
  async create(data: CreateMaterialParams): Promise<ApiResponse<Material>> {
    return request<Material>(API_ENDPOINTS.MATERIAL.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * 更新物料
   */
  async update(id: string, data: UpdateMaterialParams): Promise<ApiResponse<Material>> {
    return request<Material>(API_ENDPOINTS.MATERIAL.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * 删除物料
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return request<void>(API_ENDPOINTS.MATERIAL.DELETE(id), { method: 'DELETE' });
  },

  /**
   * 获取物料版本列表
   */
  async getVersions(materialId: string): Promise<MaterialVersionListResponse> {
    return request<MaterialVersionListResponse>(API_ENDPOINTS.MATERIAL.VERSIONS(materialId), { method: 'GET' });
  },

  /**
   * 获取预签名上传 URL（PUT 直传 MinIO，创建版本时使用返回的 objectKey）
   */
  async getPresignedUploadUrl(body: PresignedUploadBody): Promise<PresignedUploadResponse> {
    return request<PresignedUploadResponse>(API_ENDPOINTS.MATERIAL.PRESIGNED_UPLOAD, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};
