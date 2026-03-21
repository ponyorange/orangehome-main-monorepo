/**
 * 编辑器状态
 */
export interface IEditorState {
  /** 编辑器是否就绪 */
  isReady: boolean;
  /** 是否加载中 */
  isLoading: boolean;
  /** 当前选中组件 ID */
  selectedId: string | null;
  /** 当前悬停组件 ID */
  hoveredId: string | null;
}

/**
 * 组件状态
 */
export interface IComponentState {
  id: string;
  type: string;
  name: string;
  props: Record<string, unknown>;
  isSelected: boolean;
  isHovered: boolean;
  isDragging: boolean;
  isVisible: boolean;
  isLocked: boolean;
}

/**
 * 历史记录状态
 */
export interface IHistoryState {
  /** 历史记录栈 */
  past: unknown[];
  /** 重做栈 */
  future: unknown[];
  /** 是否可以撤销 */
  canUndo: boolean;
  /** 是否可以重做 */
  canRedo: boolean;
}

/**
 * 全局状态
 */
export interface IStoreState {
  /** 编辑器状态 */
  editor: IEditorState;
  /** 组件状态映射 */
  components: Map<string, IComponentState>;
  /** 历史记录状态 */
  history: IHistoryState;
}
