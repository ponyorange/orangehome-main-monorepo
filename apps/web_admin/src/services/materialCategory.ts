import type { ApiResponse } from '@/types';
import type {
  MaterialCategory,
  CreateMaterialCategoryParams,
  UpdateMaterialCategoryParams,
  MaterialCategoryTree,
  MoveCategoryParams,
} from '@/types/materialCategory';
import { API_ENDPOINTS } from './config';
import { request } from '@/lib/fetch';

/**
 * 物料分类服务
 */
export const materialCategoryApi = {
  /**
   * 获取物料分类列表
   */
  async getList() {
    return request<{ data: MaterialCategory[]; total: number }>(API_ENDPOINTS.MATERIAL_CATEGORY.LIST, { method: 'GET' });
  },

  /**
   * 获取物料分类树（与 api-docs 一致，可按 platformId、typeId 筛选）
   */
  async getTreeList(params?: { platformId?: string; typeId?: string }) {
    const q = new URLSearchParams();
    if (params?.platformId) q.append('platformId', params.platformId);
    if (params?.typeId) q.append('typeId', params.typeId);
    const qs = q.toString();
    const url = `${API_ENDPOINTS.MATERIAL_CATEGORY.TREE_LIST}${qs ? `?${qs}` : ''}`;
    return request<{ data: MaterialCategoryTree[] }>(url, { method: 'GET' });
  },

  /**
   * 获取物料分类详情
   */
  async getById(id: string): Promise<ApiResponse<MaterialCategory>> {
    return request<MaterialCategory>(API_ENDPOINTS.MATERIAL_CATEGORY.DETAIL(id), { method: 'GET' });
  },

  /**
   * 创建物料分类
   */
  async create(data: CreateMaterialCategoryParams): Promise<ApiResponse<MaterialCategory>> {
    return request<MaterialCategory>(API_ENDPOINTS.MATERIAL_CATEGORY.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * 更新物料分类
   */
  async update(id: string, data: UpdateMaterialCategoryParams): Promise<ApiResponse<MaterialCategory>> {
    return request<MaterialCategory>(API_ENDPOINTS.MATERIAL_CATEGORY.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * 删除物料分类
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return request<void>(API_ENDPOINTS.MATERIAL_CATEGORY.DELETE(id), { method: 'DELETE' });
  },

  /**
   * 移动分类
   */
  async move(id: string, data: MoveCategoryParams): Promise<ApiResponse<MaterialCategory>> {
    return request<MaterialCategory>(API_ENDPOINTS.MATERIAL_CATEGORY.MOVE(id), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
