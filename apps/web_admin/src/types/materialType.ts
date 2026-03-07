/**
 * 物料类别类型定义
 */
export interface MaterialType {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建物料类别参数
 */
export interface CreateMaterialTypeParams {
  name: string;
  code: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
  sortOrder?: number;
}

/**
 * 更新物料类别参数
 */
export type UpdateMaterialTypeParams = Partial<CreateMaterialTypeParams>;

/**
 * 物料类别列表响应
 */
export interface MaterialTypeListResponse {
  items: MaterialType[];
  total: number;
}
