/**
 * 编辑器核心状态接口（参考文档 3.2.3 节）
 */
import type { ISchema } from '../base';

/** 布局配置 */
export interface LayoutState {
  leftPanelWidth?: number;
  rightPanelWidth?: number;
  topPanelHeight?: number;
  bottomPanelHeight?: number;
  [key: string]: unknown;
}

/** 画布状态 */
export interface CanvasState {
  zoom?: number;
  offsetX?: number;
  offsetY?: number;
  backgroundColor?: string;
  width?: number;
  height?: number;
  [key: string]: unknown;
}

/** 远程组件 URL 映射（uniqueId/type -> 组件模块 URL） */
export type UniqueId2Module = Record<string, string>;

/** 编辑器配置 */
export interface ConfigState {
  readOnly?: boolean;
  gridSize?: number;
  showGrid?: boolean;
  /** 组件类型/唯一 ID 到远程模块 URL 的映射 */
  uniqueId2Module?: UniqueId2Module;
  [key: string]: unknown;
}

/** 编辑器 UI 状态 */
export interface EditorUIState {
  selectedNodeId?: string | null;
  hoveredNodeId?: string | null;
  [key: string]: unknown;
}

export interface EditorCoreState {
  /** 当前选中的节点 ID */
  selectedNodeId: string | null;
  /** 页面 Schema 树 */
  schema: ISchema | null;
  /** 页面名称 */
  pageName?: string;
  /** 页面 ID */
  pageId?: string;
  /** 历史记录（撤销/重做） */
  history?: unknown[];
  /** 当前历史索引 */
  historyIndex?: number;
  /** 布局状态 */
  layouts: LayoutState;
  /** 画布状态 */
  canvas: CanvasState;
  /** 配置状态 */
  config: ConfigState;
  /** 编辑器 UI 状态 */
  editor: EditorUIState;
  /** 其他扩展状态 */
  [key: string]: unknown;
}
