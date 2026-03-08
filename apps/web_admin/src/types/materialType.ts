/**
 * 物料类别类型定义（与 core-service MaterialTypeDto 一致）
 */
export interface MaterialType {
  id: string;
  typeCode: string;
  typeName: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 创建物料类别参数
 */
export interface CreateMaterialTypeParams {
  typeCode: string;
  typeName: string;
  description?: string;
  icon?: string;
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
