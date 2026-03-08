/**
 * 物料类型定义（与 core-service MaterialDto 一致）
 */
export interface Material {
  id: string;
  materialUid: string;
  materialName: string;
  description?: string;
  typeId: string;
  typeName?: string;
  categoryId: string;
  categoryName?: string;
  platformId?: string;
  platformName?: string;
  businessId?: string;
  businessName?: string;
  icon?: string;
  status: string;
  visibility?: string;
  latestVersionId?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  /** 兼容 */
  name?: string;
  code?: string;
  platformIds?: string[];
  businessIds?: string[];
  thumbnail?: string;
  fileUrl?: string;
}

/**
 * 创建物料参数（与 core-service CreateMaterialDto 一致）
 */
export interface CreateMaterialParams {
  materialName: string;
  materialUid?: string;
  description?: string;
  typeId: string;
  categoryId: string;
  platformId: string;
  businessId?: string;
  icon?: string;
  status?: string;
  visibility?: string;
}

/**
 * 更新物料参数
 */
export type UpdateMaterialParams = Partial<CreateMaterialParams>;

/**
 * 物料列表查询参数
 */
export interface MaterialQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  typeId?: string;
  categoryId?: string;
  platformId?: string;
  businessId?: string;
  status?: string;
}

/**
 * 物料列表响应
 */
export interface MaterialListResponse {
  items: Material[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 获取预签名上传URL响应
 */
export interface PresignedUploadResponse {
  uploadUrl: string;
  fileUrl: string;
  expiresIn: number;
}
