import type { ISchema } from '../../../types/base';
import { generateIdWithPrefix } from '../../../utils/id';

export interface ComponentCatalogItem {
  type: string;
  name: string;
  icon: string;
  category: 'basic' | 'business';
  createSchema: () => ISchema;
}

export const basicComponents: ComponentCatalogItem[] = [
  {
    type: 'Text',
    name: '文本',
    icon: 'T',
    category: 'basic',
    createSchema: () => ({
      id: generateIdWithPrefix('text'),
      name: '文本',
      type: 'Text',
      children: [],
      props: { text: '文本内容', style: { fontSize: 14 } },
    }),
  },
  {
    type: 'Image',
    name: '图片',
    icon: '🖼',
    category: 'basic',
    createSchema: () => ({
      id: generateIdWithPrefix('img'),
      name: '图片',
      type: 'Image',
      children: [],
      props: {
        src: 'https://via.placeholder.com/100x100/eee/999?text=Image',
        alt: '图片',
        style: { width: 100, height: 100 },
      },
    }),
  },
  {
    type: 'Container',
    name: '容器',
    icon: '☐',
    category: 'basic',
    createSchema: () => ({
      id: generateIdWithPrefix('container'),
      name: '容器',
      type: 'Container',
      children: [],
      props: {
        style: {
          padding: 16,
          minHeight: 80,
          border: '1px dashed #d9d9d9',
          borderRadius: 4,
        },
      },
    }),
  },
  {
    type: 'Button',
    name: '按钮',
    icon: '▢',
    category: 'basic',
    createSchema: () => ({
      id: generateIdWithPrefix('btn'),
      name: '按钮',
      type: 'Button',
      children: [],
      props: { text: '按钮', style: {} },
    }),
  },
];

export const businessComponents: ComponentCatalogItem[] = [];
