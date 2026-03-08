/**
 * 用户信息（与 core-service 用户列表接口返回一致）
 */
export interface UserListItem {
  id: string;
  userId: number;
  email: string;
  nickname?: string;
  avatarUrl?: string;
  identities: string[];
  createdAt?: number | string;
}

/**
 * 用户列表查询参数
 */
export interface UserListQueryParams {
  page?: number;
  pageSize?: number;
  emailKeyword?: string;
  status?: string;
}
