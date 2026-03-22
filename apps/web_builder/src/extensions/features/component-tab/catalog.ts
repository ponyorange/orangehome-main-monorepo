import type { ISchema } from '../../../types/base';

export interface ComponentCatalogItem {
  type: string;
  name: string;
  icon: string;
  /** 物料管理平台上传的图标 URL（与 icon 二选一展示） */
  iconUrl?: string;
  category: 'basic' | 'business';
  createSchema: () => ISchema;
}
