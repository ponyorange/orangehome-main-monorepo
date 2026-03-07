/**
 * 物料分类类型定义
 */
export interface MaterialCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  parentId?: string | null;
  level: number;
  path: string;
  sortOrder: number;
  isActive: boolean;
  children?: MaterialCategory[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建物料分类参数
 */
export interface CreateMaterialCategoryParams {
  name: string;
  code: string;
  description?: string;
  parentId?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

/**
 * 更新物料分类参数
 */
export type UpdateMaterialCategoryParams = Partial<CreateMaterialCategoryParams>;

/**
 * 移动分类参数
 */
export interface MoveCategoryParams {
  parentId?: string | null;
  sortOrder?: number;
}

/**
 * 物料分类列表响应
 */
export interface MaterialCategoryListResponse {
  items: MaterialCategory[];
  total: number;
}

/**
 * 物料分类树形节点
 */
export type MaterialCategoryTree = MaterialCategory;
