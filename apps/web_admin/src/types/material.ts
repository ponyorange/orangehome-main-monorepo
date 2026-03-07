/**
 * 物料类型定义
 */
export interface Material {
  id: string;
  name: string;
  code: string;
  description?: string;
  typeId: string;
  typeName?: string;
  categoryId: string;
  categoryName?: string;
  platformIds?: string[];
  businessIds?: string[];
  thumbnail?: string;
  fileUrl?: string;
  fileSize?: number;
  fileType?: string;
  status: 'draft' | 'published' | 'archived';
  versionCount?: number;
  latestVersion?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建物料参数
 */
export interface CreateMaterialParams {
  name: string;
  code: string;
  description?: string;
  typeId: string;
  categoryId: string;
  platformIds?: string[];
  businessIds?: string[];
  thumbnail?: string;
  fileUrl?: string;
  fileSize?: number;
  fileType?: string;
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
