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
  sortOrder?: number;
  config?: string;
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
 * 创建物料参数（CreateMaterialDto）
 */
export interface CreateMaterialParams {
  materialName: string;
  materialUid?: string;
  description?: string;
  icon?: string;
  platformId: string;
  typeId: string;
  categoryId: string;
  businessId?: string;
  status?: string;
  visibility?: string;
  /** @IsInt 整数 */
  sortOrder?: number;
  /** JSON 字符串，服务端 JSON.parse */
  config?: string;
}

/**
 * 更新物料参数（UpdateMaterialDto）
 */
export interface UpdateMaterialParams {
  materialName?: string;
  materialUid?: string;
  platformId?: string;
  typeId?: string;
  categoryId?: string;
  /** 传空字符串表示清空业务线 */
  businessId?: string;
  description?: string;
  icon?: string;
  status?: string;
  visibility?: string;
  sortOrder?: number;
  config?: string;
}

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
  visibility?: string;
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
 * 获取预签名上传 URL 响应（与 core-service 一致：客户端 PUT 到 url，创建版本时传 objectKey）
 */
export interface PresignedUploadResponse {
  url: string;
  objectKey: string;
  expiresIn: number;
}

export interface PresignedUploadBody {
  materialId: string;
  version: string;
  filename?: string;
  /** 产物类型：browser=运行时包；ssr=Node CJS SSR 包（与 core PresignedUploadBodyDto 一致） */
  bundle?: 'browser' | 'ssr';
}
