import apiClient from './auth';

// 项目类型
export interface Project {
  id: string;
  projectCode: string;
  projectName: string;
  businessId: string;
  businessName: string;
  description?: string;
  config?: string;
  createdAt: string;
  updatedAt: string;
}

// 项目列表响应
export interface ProjectListResponse {
  data: Project[];
  total: number;
  page: number;
  limit: number;
}

// 新建项目
export const createProject = async (data: {
  projectCode: string;
  projectName: string;
  businessId: string;
  description?: string;
  config?: string;
}): Promise<Project> => {
  return apiClient.post('/projects', data);
};

// 项目列表
export const getProjects = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  businessId?: string;
}): Promise<ProjectListResponse> => {
  return apiClient.get('/projects', { params });
};

// 项目详情
export const getProject = async (id: string): Promise<Project> => {
  return apiClient.get(`/projects/${id}`);
};

// 修改项目
export const updateProject = async (
  id: string,
  data: {
    projectName?: string;
    description?: string;
    config?: string;
  }
): Promise<Project> => {
  return apiClient.put(`/projects/${id}`, data);
};

// 删除项目
export const deleteProject = async (id: string, permanent = false) => {
  return apiClient.delete(`/projects/${id}`, { params: { permanent } });
};
