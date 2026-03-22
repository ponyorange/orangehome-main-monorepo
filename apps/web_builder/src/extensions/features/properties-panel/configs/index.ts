import type { ComponentConfig } from './types';
import { ROOT_CONTAINER_MATERIAL_UID } from '../../../../common/base/schemaLayout';

const textConfig: ComponentConfig = {
  type: 'Text',
  name: '文本',
  groups: [
    {
      title: '内容',
      fields: [
        { key: 'text', label: '文本内容', type: 'text', placeholder: '请输入文本' },
      ],
    },
    {
      title: '文字样式',
      fields: [
        { key: 'style.fontSize', label: '字号', type: 'number', defaultValue: 14, min: 10, max: 100 },
        { key: 'style.fontWeight', label: '粗体', type: 'select', defaultValue: 'normal', options: [
          { label: '正常', value: 'normal' },
          { label: '粗体', value: 'bold' },
          { label: '更粗', value: '900' },
        ]},
        { key: 'style.color', label: '文字颜色', type: 'color', defaultValue: '#333333' },
        { key: 'style.textAlign', label: '对齐', type: 'select', defaultValue: 'left', options: [
          { label: '左对齐', value: 'left' },
          { label: '居中', value: 'center' },
          { label: '右对齐', value: 'right' },
        ]},
        { key: 'style.lineHeight', label: '行高', type: 'number', defaultValue: 1.5, min: 1, max: 3, step: 0.1 },
      ],
    },
  ],
};

const imageConfig: ComponentConfig = {
  type: 'Image',
  name: '图片',
  groups: [
    {
      title: '内容',
      fields: [
        { key: 'src', label: '图片地址', type: 'image', placeholder: '请输入图片 URL' },
        { key: 'alt', label: '替代文本', type: 'text', placeholder: '图片描述' },
      ],
    },
    {
      title: '图片样式',
      fields: [
        { key: 'style.objectFit', label: '填充方式', type: 'select', defaultValue: 'cover', options: [
          { label: '覆盖', value: 'cover' },
          { label: '包含', value: 'contain' },
          { label: '拉伸', value: 'fill' },
          { label: '不缩放', value: 'none' },
        ]},
        { key: 'style.borderRadius', label: '圆角', type: 'number', defaultValue: 0, min: 0, max: 200 },
      ],
    },
  ],
};

const buttonConfig: ComponentConfig = {
  type: 'Button',
  name: '按钮',
  groups: [
    {
      title: '内容',
      fields: [
        { key: 'text', label: '按钮文字', type: 'text', placeholder: '按钮' },
      ],
    },
    {
      title: '按钮样式',
      fields: [
        { key: 'style.fontSize', label: '字号', type: 'number', defaultValue: 14, min: 10, max: 40 },
        { key: 'style.color', label: '文字颜色', type: 'color', defaultValue: '#ffffff' },
        { key: 'style.background', label: '背景色', type: 'color', defaultValue: '#e07a3f' },
        { key: 'style.borderRadius', label: '圆角', type: 'number', defaultValue: 4, min: 0, max: 100 },
        { key: 'style.borderColor', label: '边框颜色', type: 'color', defaultValue: '#e07a3f' },
      ],
    },
  ],
};

const containerConfig: ComponentConfig = {
  type: 'Container',
  name: '容器',
  groups: [
    {
      title: '容器样式',
      fields: [
        { key: 'style.padding', label: '内边距', type: 'number', defaultValue: 16, min: 0, max: 100 },
        { key: 'style.background', label: '背景色', type: 'color', defaultValue: 'transparent' },
        { key: 'style.borderRadius', label: '圆角', type: 'number', defaultValue: 0, min: 0, max: 100 },
        { key: 'style.borderColor', label: '边框颜色', type: 'color', defaultValue: '#d9d9d9' },
        { key: 'style.borderStyle', label: '边框样式', type: 'select', defaultValue: 'dashed', options: [
          { label: '虚线', value: 'dashed' },
          { label: '实线', value: 'solid' },
          { label: '无', value: 'none' },
        ]},
        { key: 'style.borderWidth', label: '边框宽度', type: 'number', defaultValue: 1, min: 0, max: 10 },
        { key: 'style.minHeight', label: '最小高度', type: 'number', defaultValue: 80, min: 0, max: 1000 },
      ],
    },
  ],
};

const rootContainerConfig: ComponentConfig = {
  ...containerConfig,
  type: ROOT_CONTAINER_MATERIAL_UID,
  name: '根容器',
};

const componentConfigMap: Record<string, ComponentConfig> = {
  Text: textConfig,
  Image: imageConfig,
  Button: buttonConfig,
  Container: containerConfig,
  [ROOT_CONTAINER_MATERIAL_UID]: rootContainerConfig,
};

export function getComponentConfig(type: string): ComponentConfig | undefined {
  return componentConfigMap[type];
}

export type { ComponentConfig, FieldConfig } from './types';
