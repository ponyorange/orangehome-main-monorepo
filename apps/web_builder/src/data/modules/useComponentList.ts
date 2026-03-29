import useSWR from 'swr';
import type { ISchema } from '../../types/base';
import type { ComponentCatalogItem } from '../../extensions/features/component-tab/catalog';
import { generateIdWithPrefix } from '../../utils/id';
import { get } from '../api/client';
import { useMaterialBundleStore } from '../../core/store/materialBundleStore';
import {
  buildEditorConfigFromMaterial,
  parseMaterialEditorConfig,
} from './componentMaterialMeta';
import type { ISchemaEditorConfig } from '../../types/base';

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
  /** 部分网关/序列化可能仍为 snake_case */
  file_url?: string;
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
  /** 官方物料库业务线 ID（与 businessId 物料合并返回） */
  officialBusinessId: string;
  items: ComponentListItemDto[];
}

function propsFromEditorInitValues(ec: ISchemaEditorConfig | undefined): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const p of ec?.props ?? []) {
    if (p.initValue !== undefined) {
      out[p.key] = p.initValue;
    }
  }
  return out;
}

/** editorConfig.styleConfig.initValue → schema.style（浅拷贝） */
function styleFromEditorStyleConfig(ec: ISchemaEditorConfig | undefined): Record<string, unknown> | undefined {
  const iv = ec?.styleConfig?.initValue;
  if (!iv || typeof iv !== 'object' || Array.isArray(iv)) return undefined;
  return { ...iv };
}

/**
 * 由接口行生成画布节点：type 为 materialUid；bundle / editorConfig 不写入 schema，由组件列表 hydrate 到 store。
 * editorConfig 中的 props[].initValue 会写入节点 props；styleConfig.initValue 会写入节点 style。
 */
export function buildSchemaFromComponentListItem(item: ComponentListItemDto): ISchema | null {
  const { material, latestVersion } = item;
  if (!latestVersion) return null;

  const editorCfg = buildEditorConfigFromMaterial(parseMaterialEditorConfig(latestVersion.editorConfigJson));

  const styleInit = styleFromEditorStyleConfig(editorCfg);

  return {
    id: '',
    name: material.materialName,
    type: material.materialUid,
    children: [],
    props: propsFromEditorInitValues(editorCfg),
    ...(styleInit && Object.keys(styleInit).length > 0 ? { style: styleInit } : {}),
  };
}

function catalogIcon(material: ComponentMaterialDto): { icon: string; iconUrl?: string } {
  const { icon, materialName } = material;
  if (icon?.trim() && /^https?:\/\//i.test(icon)) {
    return { icon: '', iconUrl: icon };
  }
  if (icon?.trim()) {
    return { icon: icon.length <= 4 ? icon : icon.slice(0, 2) };
  }
  return { icon: materialName.trim().slice(0, 1) || '📦' };
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
  if (!item.latestVersion) return null;
  const template = buildSchemaFromComponentListItem(item);
  if (!template) return null;

  const { icon, iconUrl } = catalogIcon(item.material);

  return {
    type: template.type,
    name: item.material.materialName,
    icon,
    ...(iconUrl ? { iconUrl } : {}),
    category: 'business',
    createSchema: () => schemaWithNewIds(template),
  };
}

async function fetchComponentList(
  pageId: string,
  type: BuilderComponentListType,
): Promise<GetComponentListResponseDto> {
  const q = new URLSearchParams({ pageId, type });
  const res = await get<GetComponentListResponseDto>(`/builder/component-list?${q.toString()}`);
  useMaterialBundleStore.getState().hydrateFromComponentList(res.items ?? []);
  return res;
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
