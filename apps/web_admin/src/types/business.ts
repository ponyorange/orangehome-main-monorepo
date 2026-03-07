/**
 * 业务线类型定义
 */
export interface Business {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  platforms?: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建业务线参数
 */
export interface CreateBusinessParams {
  name: string;
  code: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
  sortOrder?: number;
  platformIds?: string[];
}

/**
 * 更新业务线参数
 */
export type UpdateBusinessParams = Partial<CreateBusinessParams>;

/**
 * 业务线列表查询参数
 */
export interface BusinessQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  platformId?: string;
}

/**
 * 业务线列表响应
 */
export interface BusinessListResponse {
  items: Business[];
  total: number;
  page: number;
  pageSize: number;
}
