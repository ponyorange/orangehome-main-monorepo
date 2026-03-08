/**
 * 业务线类型定义（与 core-service BusinessDto 一致）
 */
export interface Business {
  id: string;
  businessCode: string;
  businessName: string;
  description?: string;
  platforms?: Array<{
    platformId: string;
    platformCode: string;
    platformName: string;
  }>;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 创建业务线参数
 */
export interface CreateBusinessParams {
  businessCode: string;
  businessName: string;
  description?: string;
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
