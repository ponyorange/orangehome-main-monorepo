import useSWR from 'swr';
import { deserialize } from '../../common/base/schemaOperator';
import type { ISchema } from '../../types/base';
import { get, post } from '../api/client';

export interface BuilderProject {
  id: string;
  projectCode: string;
  projectName: string;
  businessId: string;
  businessName?: string;
  description?: string;
  config?: string;
  owner?: string;
  collaborators?: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface BuilderPage {
  id: string;
  projectId: string;
  projectName?: string;
  path: string;
  title: string;
  description?: string;
  publishedVersionId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface BuilderPageVersionRaw {
  id: string;
  pageId: string;
  versionNumber: number;
  comment?: string;
  pageSchemaJson: string;
  isLatestDraft: boolean;
  isPublished: boolean;
  publishedAt?: string | Date;
  createdBy: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface BuilderPageVersion extends BuilderPageVersionRaw {
  pageSchema: ISchema;
}

export interface SavePageVersionParams {
  pageId: string;
  pageSchema: ISchema;
  userId: string;
}

export interface BuilderInitRawResponse {
  project: BuilderProject;
  page: BuilderPage;
  pageVersion: BuilderPageVersionRaw;
}

export interface BuilderInitResponse {
  project: BuilderProject;
  page: BuilderPage;
  pageVersion: BuilderPageVersion;
}

async function fetchBuilderInit(pageId: string): Promise<BuilderInitResponse> {
  const result = await get<BuilderInitRawResponse>(`/builder/init?pageId=${encodeURIComponent(pageId)}`);
  const pageSchema = deserialize(result.pageVersion.pageSchemaJson);
  if (!pageSchema) {
    throw new Error('builder/init 返回的 pageSchemaJson 解析失败');
  }

  return {
    ...result,
    pageVersion: {
      ...result.pageVersion,
      pageSchema,
    },
  };
}

export function useBuilderData(pageId?: string | null, enabled = true) {
  return useSWR<BuilderInitResponse>(
    pageId && enabled ? ['/builder/init', pageId] : null,
    () => fetchBuilderInit(pageId!),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );
}

export async function saveBuilderPageVersion(params: SavePageVersionParams): Promise<BuilderPageVersion> {
  const pageSchemaJson = JSON.stringify(params.pageSchema, null, 2);
  const result = await post<BuilderPageVersionRaw>('/page-versions/save', {
    pageId: params.pageId,
    pageSchemaJson,
    userId: params.userId,
  });

  return {
    ...result,
    pageSchemaJson,
    pageSchema: params.pageSchema,
  };
}

export const userBuilderData = useBuilderData;
