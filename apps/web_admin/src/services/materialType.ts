import type {
  MaterialType,
  CreateMaterialTypeParams,
  UpdateMaterialTypeParams,
} from '@/types/materialType';
import { API_ENDPOINTS } from './config';
import { request } from '@/lib/fetch';

/**
 * 物料类别服务
 */
export const materialTypeApi = {
  /**
   * 获取物料类别列表
   */
  async getList() {
    return request<{ data: MaterialType[]; total: number }>(API_ENDPOINTS.MATERIAL_TYPE.LIST, { method: 'GET' });
  },

  /**
   * 获取物料类别详情
   */
  async getById(id: string): Promise<ApiResponse<MaterialType>> {
    return request<MaterialType>(API_ENDPOINTS.MATERIAL_TYPE.DETAIL(id), { method: 'GET' });
  },

  /**
   * 创建物料类别
   */
  async create(data: CreateMaterialTypeParams): Promise<ApiResponse<MaterialType>> {
    return request<MaterialType>(API_ENDPOINTS.MATERIAL_TYPE.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * 更新物料类别
   */
  async update(id: string, data: UpdateMaterialTypeParams): Promise<ApiResponse<MaterialType>> {
    return request<MaterialType>(API_ENDPOINTS.MATERIAL_TYPE.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * 删除物料类别
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return request<void>(API_ENDPOINTS.MATERIAL_TYPE.DELETE(id), { method: 'DELETE' });
  },
};
