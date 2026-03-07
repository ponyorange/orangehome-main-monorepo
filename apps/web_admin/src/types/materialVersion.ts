/**
 * 物料版本类型定义
 */
export interface MaterialVersion {
  id: string;
  materialId: string;
  materialName?: string;
  version: string;
  description?: string;
  fileUrl: string;
  fileSize?: number;
  fileType?: string;
  thumbnail?: string;
  status: 'draft' | 'published' | 'deprecated';
  publishedAt?: string;
  publishedBy?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建物料版本参数
 */
export interface CreateMaterialVersionParams {
  materialId: string;
  version: string;
  description?: string;
  fileUrl: string;
  fileSize?: number;
  fileType?: string;
  thumbnail?: string;
}

/**
 * 物料版本列表响应
 */
export interface MaterialVersionListResponse {
  items: MaterialVersion[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 发布版本响应
 */
export interface PublishVersionResponse {
  success: boolean;
  message: string;
}
