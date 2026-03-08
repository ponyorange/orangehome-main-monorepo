export * from './auth';
export * from './user';
export * from './platform';
export * from './business';
export * from './materialType';
export * from './materialCategory';
export * from './material';
export * from './materialVersion';

// 通用类型
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
}
