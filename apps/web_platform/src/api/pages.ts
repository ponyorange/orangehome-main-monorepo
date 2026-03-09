import apiClient from './auth';

// 页面类型
export interface Page {
  id: string;
  projectId: string;
  projectName: string;
  path: string;
  title: string;
  description?: string;
  publishedVersionId?: string;
  createdAt: string;
  updatedAt: string;
}

// 页面列表响应
export interface PageListResponse {
  data: Page[];
  total: number;
  page: number;
  limit: number;
}

// 新建页面
export const createPage = async (data: {
  projectId: string;
  path: string;
  title: string;
  description?: string;
}): Promise<Page> => {
  return apiClient.post('/pages', data);
};

// 页面列表
export const getPages = async (params: {
  projectId: string;
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PageListResponse> => {
  return apiClient.get('/pages', { params });
};

// 页面详情
export const getPage = async (id: string): Promise<Page> => {
  return apiClient.get(`/pages/${id}`);
};

// 修改页面
export const updatePage = async (
  id: string,
  data: {
    path?: string;
    title?: string;
    description?: string;
  }
): Promise<Page> => {
  return apiClient.put(`/pages/${id}`, data);
};

// 删除页面
export const deletePage = async (id: string, permanent = false) => {
  return apiClient.delete(`/pages/${id}`, { params: { permanent } });
};
