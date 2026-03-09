import type { ComponentType } from 'react';

export type LoadedComponent = ComponentType<Record<string, unknown>>;

/** 组件加载器：根据 type 和 url 加载组件 */
export interface IComponentLoader {
  load(type: string, url?: string): Promise<LoadedComponent | null>;
}

/** 静态组件加载器：从本地映射获取 */
export function createStaticLoader(
  map: Map<string, LoadedComponent>
): IComponentLoader {
  return {
    async load(type: string): Promise<LoadedComponent | null> {
      return map.get(type) ?? null;
    },
  };
}

/** 组件管理器：动态加载并缓存远程/本地组件 */
export class ComponentManager {
  private _cache = new Map<string, LoadedComponent>();
  private _staticMap = new Map<string, LoadedComponent>();
  private _loading = new Map<string, Promise<LoadedComponent>>();
  private _loaders: IComponentLoader[] = [];

  constructor(loaders?: IComponentLoader[]) {
    this._loaders = loaders ?? [];
    this._loaders.unshift(createStaticLoader(this._staticMap));
  }

  /** 注册组件加载器 */
  registerLoader(loader: IComponentLoader): void {
    this._loaders.push(loader);
  }

  /** 注册静态组件（用于 div、button 等内置组件） */
  registerStatic(type: string, component: LoadedComponent): void {
    this._staticMap.set(type, component);
    this._cache.set(type, component);
  }

  /** 根据组件类型和可选 URL 加载远程组件，带缓存 */
  async loadRemoteComponent(type: string, url?: string): Promise<LoadedComponent> {
    const cacheKey = url ? `${type}@${url}` : type;

    const cached = this._cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const loading = this._loading.get(cacheKey);
    if (loading) {
      return loading;
    }

    const loadPromise = this._doLoad(type, url).then((component) => {
      this._cache.set(cacheKey, component);
      this._loading.delete(cacheKey);
      return component;
    });

    this._loading.set(cacheKey, loadPromise);

    try {
      return await loadPromise;
    } catch (err) {
      this._loading.delete(cacheKey);
      console.error(`[ComponentManager] Failed to load component: type=${type}, url=${url}`, err);
      throw err;
    }
  }

  private async _doLoad(type: string, url?: string): Promise<LoadedComponent> {
    for (const loader of this._loaders) {
      try {
        const component = await loader.load(type, url);
        if (component) {
          return component;
        }
      } catch (err) {
        console.error(`[ComponentManager] Loader failed for type=${type}`, err);
        continue;
      }
    }
    throw new Error(`[ComponentManager] No loader could resolve component: type=${type}`);
  }

  /** 同步获取已缓存的组件 */
  getCached(type: string, url?: string): LoadedComponent | undefined {
    const cacheKey = url ? `${type}@${url}` : type;
    return this._cache.get(cacheKey);
  }

  /** 清除缓存 */
  clearCache(): void {
    this._cache.clear();
    this._loading.clear();
  }
}
