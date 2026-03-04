import { useApi, mutate, post, put, del } from './useApi';

// 项目/房源相关的 API keys
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

export interface Project {
  id: string;
  name: string;
  address: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectParams {
  name: string;
  address: string;
  description?: string;
}

// 获取项目列表
export function useProjects(filters: Record<string, unknown> = {}) {
  const queryString = new URLSearchParams(
    Object.entries(filters).map(([k, v]) => [k, String(v)])
  ).toString();
  const key = queryString ? `/projects?${queryString}` : '/projects';
  return useApi<Project[]>(key);
}

// 获取项目详情
export function useProject(id: string) {
  return useApi<Project>(projectKeys.detail(id));
}

// 创建项目
export async function createProject(data: CreateProjectParams): Promise<Project> {
  const result = await post<Project>('/projects', data);
  mutate(projectKeys.lists());
  return result;
}

// 更新项目
export async function updateProject(id: string, data: Partial<CreateProjectParams>): Promise<Project> {
  const result = await put<Project>(`/projects/${id}`, data);
  mutate(projectKeys.detail(id), result, false);
  mutate(projectKeys.lists());
  return result;
}

// 删除项目
export async function deleteProject(id: string): Promise<void> {
  await del(`/projects/${id}`);
  mutate(projectKeys.lists());
}
