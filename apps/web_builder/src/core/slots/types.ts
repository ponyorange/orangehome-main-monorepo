import { ComponentType } from 'react';

/**
 * 插槽内容配置
 */
export interface SlotContentConfig {
  [key: string]: unknown;
  flex?: number;
  order?: number;
  /**
   * 条件渲染函数
   * 返回 false 时内容不会被渲染
   */
  shouldRender?: () => boolean;
}

/**
 * 插槽内容定义
 */
export interface SlotContent {
  id: string;
  component: ComponentType<any>;
  order?: number;
  config?: SlotContentConfig;
}

/**
 * 插槽定义
 */
export interface ISlot {
  id: string;
  name: string;
  contents: SlotContent[];
  parent?: string;
}

/**
 * 插槽内容项（用于渲染）
 */
export interface ISlotContent {
  id: string;
  component: ComponentType<any>;
  order?: number;
  config?: SlotContentConfig;
}
