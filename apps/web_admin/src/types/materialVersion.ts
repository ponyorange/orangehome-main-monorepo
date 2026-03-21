/**
 * 物料版本类型定义（与 core-service material_versions 及 HTTP 响应一致）
 */
export interface MaterialVersion {
  _id?: string;
  id?: string;
  materialId: string;
  version: string;
  versionCode?: number;
  changelog?: string;
  fileObjectKey: string;
  fileUrl?: string;
  sourceObjectKey?: string;
  sourceUrl?: string;
  size?: number;
  md5?: string;
  /** 0 开发中 1 测试中 2 已发布 */
  status: number;
  isPublished?: boolean;
  releaseTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 创建物料版本参数（CreateMaterialVersionDto）
 */
export interface CreateMaterialVersionParams {
  materialId: string;
  version: string;
  changelog?: string;
  /** 上传完成后的 MinIO 对象键（非访问 URL） */
  fileObjectKey: string;
  sourceObjectKey?: string;
  editorConfig?: Record<string, unknown>;
  dependencies?: Array<Record<string, string>>;
  md5?: string;
}

/**
 * 物料版本列表响应（GET /materials/:materialId/versions）
 */
export interface MaterialVersionListResponse {
  data: MaterialVersion[];
  total: number;
  page: number;
  limit: number;
}

/**
 * 发布版本响应
 */
export interface PublishVersionResponse {
  success: boolean;
  message: string;
}
