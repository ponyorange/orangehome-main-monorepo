/**
 * HoverSelectService：选中与悬停（参考文档 4.2 节）
 * 更新 store 的 selectedNodeId / hoveredNodeId，并负责选中框、悬停框的渲染数据
 */
import type { EditorCoreState } from '../../../types/store';
import type { StoreApi, UseBoundStore } from 'zustand';

export const HoverSelectService = Symbol('HoverSelectService');

export interface IHoverSelectService {
  select(nodeId: string | null): void;
  hover(nodeId: string | null): void;
  getSelectedId(): string | null;
  getHoveredId(): string | null;
}

export type EditorStore = UseBoundStore<StoreApi<EditorCoreState>>;

export class HoverSelectServiceImpl implements IHoverSelectService {
  constructor(private _store: EditorStore) {}

  select(nodeId: string | null): void {
    this._store.setState({
      selectedNodeId: nodeId ?? null,
      editor: {
        ...this._store.getState().editor,
        selectedNodeId: nodeId ?? null,
      },
    });
  }

  hover(nodeId: string | null): void {
    this._store.setState({
      editor: {
        ...this._store.getState().editor,
        hoveredNodeId: nodeId ?? null,
      },
    });
  }

  getSelectedId(): string | null {
    return this._store.getState().selectedNodeId ?? this._store.getState().editor?.selectedNodeId ?? null;
  }

  getHoveredId(): string | null {
    return this._store.getState().editor?.hoveredNodeId ?? null;
  }
}
