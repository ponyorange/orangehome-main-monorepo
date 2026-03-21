import { injectable } from 'inversify';
import type { IStoreState, IEditorState, IComponentState } from '../../types/store';

/**
 * 状态管理服务
 * 管理编辑器全局状态
 */
@injectable()
export class StoreService {
  private state: IStoreState;

  constructor() {
    this.state = this.getInitialState();
    console.log('StoreService initialized');
  }

  /**
   * 获取初始状态
   */
  private getInitialState(): IStoreState {
    return {
      editor: {
        isReady: false,
        isLoading: false,
        selectedId: null,
        hoveredId: null,
      },
      components: new Map(),
      history: {
        past: [],
        future: [],
        canUndo: false,
        canRedo: false,
      },
    };
  }

  /**
   * 获取完整状态
   */
  getState(): IStoreState {
    return this.state;
  }

  /**
   * 获取编辑器状态
   */
  getEditorState(): IEditorState {
    return this.state.editor;
  }

  /**
   * 设置编辑器就绪状态
   */
  setEditorReady(ready: boolean): void {
    this.state.editor.isReady = ready;
  }

  /**
   * 设置选中组件
   */
  setSelectedId(id: string | null): void {
    this.state.editor.selectedId = id;
  }

  /**
   * 设置悬停组件
   */
  setHoveredId(id: string | null): void {
    this.state.editor.hoveredId = id;
  }

  /**
   * 注册组件状态
   */
  registerComponent(id: string, state: IComponentState): void {
    this.state.components.set(id, state);
  }

  /**
   * 获取组件状态
   */
  getComponentState(id: string): IComponentState | undefined {
    return this.state.components.get(id);
  }

  /**
   * 更新组件状态
   */
  updateComponentState(id: string, updates: Partial<IComponentState>): void {
    const state = this.state.components.get(id);
    if (state) {
      this.state.components.set(id, { ...state, ...updates });
    }
  }

  /**
   * 重置状态
   */
  reset(): void {
    this.state = this.getInitialState();
  }
}
