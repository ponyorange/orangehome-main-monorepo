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
  icon?: string;
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
 * 创建物料分类参数（CreateMaterialCategoryDto）
 */
export interface CreateMaterialCategoryParams {
  categoryCode: string;
  categoryName: string;
  typeId: string;
  platformId: string;
  icon?: string;
  parentId?: string | null;
  sortOrder?: number;
}

/**
 * 更新物料分类参数（UpdateMaterialCategoryDto，与创建字段不同）
 */
export interface UpdateMaterialCategoryParams {
  categoryName?: string;
  icon?: string;
  sortOrder?: number;
}

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
