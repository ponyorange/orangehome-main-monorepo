/**
 * 平台类型定义（与 core-service PlatformDto 一致）
 */
export interface Platform {
  id: string;
  platformCode: string;
  platformName: string;
  description?: string;
  iconUrl?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 创建平台参数
 */
export interface CreatePlatformParams {
  platformCode: string;
  platformName: string;
  description?: string;
  iconUrl?: string;
}

/**
 * 更新平台参数
 */
export type UpdatePlatformParams = Partial<CreatePlatformParams>;

/**
 * 平台列表查询参数
 */
export interface PlatformQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

/**
 * 平台列表响应
 */
export interface PlatformListResponse {
  items: Platform[];
  total: number;
  page: number;
  pageSize: number;
}
