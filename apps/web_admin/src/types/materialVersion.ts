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
  ssrFileObjectKey?: string;
  ssrFileUrl?: string;
  sourceObjectKey?: string;
  sourceUrl?: string;
  size?: number;
  md5?: string;
  /** 0 开发中 1 测试中 2 已发布 3 已下线 */
  status: number;
  isPublished?: boolean;
  releaseTime?: string;
  createdAt?: string;
  updatedAt?: string;
  /** 低代码/编辑器配置（与后端 editorConfig 一致） */
  editorConfig?: Record<string, unknown>;
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
  /** SSR（CJS）产物对象键，创建时必填（与 CreateMaterialVersionDto 一致） */
  ssrFileObjectKey: string;
  ssrMd5?: string;
  sourceObjectKey?: string;
  editorConfig?: Record<string, unknown>;
  dependencies?: Array<Record<string, string>>;
  md5?: string;
}

/**
 * 更新物料版本（UpdateMaterialVersionDto，仅开发中；字段均可选）
 */
export interface UpdateMaterialVersionParams {
  changelog?: string;
  fileObjectKey?: string;
  ssrFileObjectKey?: string;
  sourceObjectKey?: string;
  editorConfig?: Record<string, unknown>;
  dependencies?: Array<Record<string, string>>;
  md5?: string;
  ssrMd5?: string;
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
