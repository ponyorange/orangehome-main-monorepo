import useSWR from 'swr';
import type { ISchema } from '../../types/base';
import type { ComponentCatalogItem } from '../../extensions/features/component-tab/catalog';
import { generateIdWithPrefix } from '../../utils/id';
import { get } from '../api/client';

export type BuilderComponentListType = 'online' | 'dev';

export interface ComponentMaterialDto {
  id: string;
  materialUid: string;
  materialName: string;
  description?: string;
  icon?: string;
  platformId: string;
  platformName: string;
  typeId: string;
  typeName: string;
  categoryId: string;
  categoryName: string;
  status: string;
  visibility: string;
  businessId?: string;
  businessName?: string;
}

export interface ComponentVersionDto {
  id: string;
  materialId: string;
  version: string;
  versionCode: number;
  changelog?: string;
  fileObjectKey: string;
  fileUrl?: string;
  sourceObjectKey?: string;
  sourceUrl?: string;
  status: number;
  isPublished: boolean;
  editorConfigJson?: string;
  releaseTime?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ComponentListItemDto {
  material: ComponentMaterialDto;
  latestVersion: ComponentVersionDto | null;
}

export interface GetComponentListResponseDto {
  businessId: string;
  items: ComponentListItemDto[];
}

function schemaHasRemoteLoadTarget(schema: ISchema): boolean {
  const props = schema.props;
  const remote = props.remote as Record<string, unknown> | undefined;
  if (remote && (typeof remote.moduleUrl === 'string' || typeof remote.scriptUrl === 'string')) {
    return true;
  }
  return typeof props.remoteUrl === 'string';
}

function parseEditorConfigPartial(json: string | undefined): Partial<ISchema> {
  if (!json?.trim()) return {};
  try {
    const o = JSON.parse(json) as unknown;
    if (!o || typeof o !== 'object' || Array.isArray(o)) return {};
    return o as Partial<ISchema>;
  } catch {
    return {};
  }
}

export function buildSchemaFromComponentListItem(item: ComponentListItemDto): ISchema | null {
  const { material, latestVersion } = item;
  if (!latestVersion) return null;

  const fromConfig = parseEditorConfigPartial(latestVersion.editorConfigJson);
  const type = fromConfig.type ?? material.materialUid;
  const name = fromConfig.name ?? material.materialName;
  const children = Array.isArray(fromConfig.children) ? fromConfig.children : [];
  const props = {
    ...(typeof fromConfig.props === 'object' && fromConfig.props ? fromConfig.props : {}),
  } as Record<string, unknown>;

  if (!props.remote && typeof props.remoteUrl !== 'string' && latestVersion.fileUrl) {
    props.remote = { moduleUrl: latestVersion.fileUrl };
  }

  const schema: ISchema = {
    id: '',
    name,
    type,
    children,
    props,
    ...(fromConfig.propStyle ? { propStyle: fromConfig.propStyle } : {}),
    ...(fromConfig.event2action ? { event2action: fromConfig.event2action } : {}),
    ...(fromConfig.api ? { api: fromConfig.api } : {}),
  };

  if (!schemaHasRemoteLoadTarget(schema)) {
    return null;
  }

  return schema;
}

function catalogIcon(material: ComponentMaterialDto): string {
  const { icon, materialName } = material;
  if (icon?.trim()) {
    if (/^https?:\/\//i.test(icon)) {
      return '🧩';
    }
    return icon.length <= 4 ? icon : icon.slice(0, 2);
  }
  return materialName.trim().slice(0, 1) || '📦';
}

function schemaWithNewIds(node: ISchema): ISchema {
  const slug = node.type.toLowerCase().replace(/\W/g, '') || 'n';
  return {
    ...node,
    id: generateIdWithPrefix(slug),
    children: node.children.map(schemaWithNewIds),
  };
}

export function componentListItemToCatalogItem(item: ComponentListItemDto): ComponentCatalogItem | null {
  const template = buildSchemaFromComponentListItem(item);
  if (!template) return null;

  return {
    type: template.type,
    name: item.material.materialName,
    icon: catalogIcon(item.material),
    category: 'business',
    createSchema: () => schemaWithNewIds(template),
  };
}

async function fetchComponentList(
  pageId: string,
  type: BuilderComponentListType,
): Promise<GetComponentListResponseDto> {
  const q = new URLSearchParams({ pageId, type });
  return get<GetComponentListResponseDto>(`/builder/component-list?${q.toString()}`);
}

export function useComponentList(
  pageId: string | null | undefined,
  type: BuilderComponentListType,
  enabled = true,
) {
  return useSWR<GetComponentListResponseDto>(
    pageId && enabled ? ['/builder/component-list', pageId, type] : null,
    () => fetchComponentList(pageId!, type),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  );
}
