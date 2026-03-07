/**
 * 平台类型定义
 */
export interface Platform {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建平台参数
 */
export interface CreatePlatformParams {
  name: string;
  code: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
  sortOrder?: number;
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
