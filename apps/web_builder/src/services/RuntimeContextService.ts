import type {
  LoadedComponent,
  IComponentLoader,
} from '../common/components/SchemaRenderer/ComponentManager';
import type { UniqueId2Module } from '../types/store';
import type { StoreApi, UseBoundStore } from 'zustand';
import type { EditorCoreState } from '../types/store';

export const RuntimeContextService = Symbol('RuntimeContextService');

export interface IRuntimeContextService {
  loadRemoteComponent(type: string, url?: string): Promise<LoadedComponent>;
  setUniqueId2Module(map: UniqueId2Module): void;
  getUniqueId2Module(): UniqueId2Module;
}

/** 创建 RuntimeContextService，从 store.config.uniqueId2Module 获取组件 URL */
export function createRuntimeContextService(
  store: UseBoundStore<StoreApi<EditorCoreState>>
): IRuntimeContextService {

  return {
    getUniqueId2Module(): UniqueId2Module {
      return store.getState().config?.uniqueId2Module ?? {};
    },
    setUniqueId2Module(map: UniqueId2Module) {
      store.setState((s) => ({
        config: { ...s.config, uniqueId2Module: map },
      }));
    },
    async loadRemoteComponent(type: string, url?: string): Promise<LoadedComponent> {
      const loader = createConfigComponentLoader(() =>
        store.getState().config?.uniqueId2Module ?? {}
      );
      const comp = await loader.load(type, url);
      if (comp) return comp;
      throw new Error(`[RuntimeContextService] Component not found: type=${type}`);
    },
  };
}

/** 从 config.uniqueId2Module 获取 URL 的远程组件加载器 */
export function createConfigComponentLoader(
  getUniqueId2Module: () => UniqueId2Module
): IComponentLoader {
  return {
    async load(type: string, url?: string): Promise<LoadedComponent | null> {
      const resolvedUrl = url ?? getUniqueId2Module()[type];
      if (!resolvedUrl) return null;

      try {
        const module = await import(/* @vite-ignore */ resolvedUrl);
        const comp = module?.default ?? module?.Component ?? null;
        return comp;
      } catch (err) {
        console.error(`[RuntimeContextService] Failed to load remote component: type=${type}, url=${resolvedUrl}`, err);
        throw err;
      }
    },
  };
}

