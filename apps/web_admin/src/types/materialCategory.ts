/**
 * 物料分类类型定义（与 core-service MaterialCategoryDto 一致）
 */
export interface MaterialCategory {
  id: string;
  categoryCode: string;
  categoryName: string;
  typeId: string;
  typeName?: string;
  platformId: string;
  platformName?: string;
  parentId?: string | null;
  level: number;
  sortOrder: number;
  children?: MaterialCategory[];
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  /** 兼容旧字段 */
  name?: string;
  code?: string;
}

/**
 * 创建物料分类参数
 */
export interface CreateMaterialCategoryParams {
  categoryCode: string;
  categoryName: string;
  typeId: string;
  platformId: string;
  description?: string;
  parentId?: string | null;
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
