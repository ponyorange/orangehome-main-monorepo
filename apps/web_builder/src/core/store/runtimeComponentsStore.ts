import { create } from 'zustand';
import type { ComponentType } from 'react';
import type { SchemaComponentProps } from '../../common/components/SchemaRenderer/ComponentManager';

export type RemoteSchemaRenderer = ComponentType<SchemaComponentProps>;

interface RuntimeComponentsState {
  /** 以物料唯一标识（如 materialUid / schema.type）为 key 缓存远端组件渲染函数 */
  componentsMap: Record<string, RemoteSchemaRenderer>;
  setRemoteRenderer: (id: string, renderer: RemoteSchemaRenderer) => void;
  getRemoteRenderer: (id: string) => RemoteSchemaRenderer | undefined;
  clearRemoteRenderer: (id: string) => void;
}

export const useRuntimeComponentsStore = create<RuntimeComponentsState>((set, get) => ({
  componentsMap: {},
  setRemoteRenderer: (id, renderer) =>
    set((s) => ({
      componentsMap: { ...s.componentsMap, [id]: renderer },
    })),
  getRemoteRenderer: (id) => get().componentsMap[id],
  clearRemoteRenderer: (id) =>
    set((s) => {
      const next = { ...s.componentsMap };
      delete next[id];
      return { componentsMap: next };
    }),
}));
