/**
 * 布局插槽类型定义
 * 定义编辑器 UI 的五个区域：header、leftPanel、center、rightPanel、float
 */

import type { ComponentType, ReactNode } from 'react';

/** 插槽类型 */
export type SlotType = 'header' | 'leftPanel' | 'center' | 'rightPanel' | 'float';

/** 布局插槽定义 */
export interface LayoutSlot {
  /** 唯一标识 */
  id: string;
  /** 插槽类型 */
  type: SlotType;
  /** 优先级（越小越靠前） */
  priority: number;
  /** 插槽标题/名称 */
  title?: string;
  /** 图标（用于 Tab 显示） */
  icon?: ReactNode;
  /** React 组件 */
  component: ComponentType<Record<string, unknown>>;
  /** 是否可见 */
  visible?: boolean;
  /** 元数据 */
  meta?: Record<string, unknown>;
}

/** 布局服务接口 */
export interface ILayoutService {
  /** 注册插槽 */
  register(slot: LayoutSlot): void;
  /** 注销插槽 */
  unregister(id: string): void;
  /** 获取指定类型的所有插槽（已按 priority 排序） */
  getSlotsByType(type: SlotType): LayoutSlot[];
  /** 获取单个插槽 */
  getSlot(id: string): LayoutSlot | undefined;
  /** 检查插槽是否存在 */
  hasSlot(id: string): boolean;
  /** 更新插槽可见性 */
  setVisible(id: string, visible: boolean): void;
  /** 订阅指定类型插槽变化 */
  subscribe(type: SlotType, callback: (slots: LayoutSlot[]) => void): () => void;
  /** 清空所有插槽 */
  clear(): void;
}

/** 布局上下文值 */
export interface LayoutContextValue {
  service: ILayoutService;
}

/** Tab 插槽专用接口（用于 leftPanelTab） */
export interface TabSlot extends LayoutSlot {
  type: 'leftPanelTab' | 'rightPanelTab';
  /** Tab 唯一标识 */
  tabId: string;
}
