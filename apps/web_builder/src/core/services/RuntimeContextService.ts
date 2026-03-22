import { injectRequireJsScript } from '../../vendor/loadRequireJs';
import { loadRemoteStyle } from '../../common/components/SchemaRenderer/utils/remoteStyle';
import type { RemoteComponentDefinition } from '../../common/components/SchemaRenderer/ComponentManager';
import type { RemoteSchemaRenderer } from '../store/runtimeComponentsStore';
import { useRuntimeComponentsStore } from '../store/runtimeComponentsStore';

type RequireInvoke = (deps: string[], onLoad: (mod: unknown) => void, onError?: (err: Error) => void) => void;

type RequireRoot = RequireInvoke & {
  config: (cfg: Record<string, unknown>) => RequireInvoke;
};

/** RequireJS 2.x：map 可将某前缀下的模块名映射到另一模块（或配合 paths 做依赖替换） */
export interface RuntimeAmdConfig {
  baseUrl?: string;
  waitSeconds?: number;
  /** 模块 id → 脚本地址（可为完整 URL，便于 map 到 CDN） */
  paths?: Record<string, string>;
  /** 例如 { '*': { react: 'https://cdn/.../react' } }，供 AMD 物料依赖裸模块名时使用 */
  map?: Record<string, Record<string, string>>;
}

const RUNTIME_CONTEXT = 'orange_editor_runtime';

let scopedRequire: RequireInvoke | null = null;
let mergedConfig: RuntimeAmdConfig = {
  baseUrl: '/',
  waitSeconds: 120,
  paths: {},
  map: {},
};

const inflightLoads = new Map<string, Promise<RemoteSchemaRenderer | null>>();

function djb2Hash(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return (h >>> 0).toString(36);
}

function amdInternalPathKey(materialUid: string, amdUrl: string): string {
  return `orange_amd_${djb2Hash(`${materialUid}\0${amdUrl}`)}`;
}

function normalizeExportedComponent(
  mod: unknown,
  exportName?: string,
): RemoteSchemaRenderer | null {
  if (mod == null) return null;
  let v: unknown = mod;
  if (exportName && typeof mod === 'object' && mod !== null && exportName in mod) {
    v = (mod as Record<string, unknown>)[exportName];
  }
  if (typeof v === 'function') return v as RemoteSchemaRenderer;
  if (typeof v === 'object' && v !== null && 'default' in v) {
    const d = (v as { default: unknown }).default;
    if (typeof d === 'function') return d as RemoteSchemaRenderer;
  }
  return null;
}

/**
 * 画布运行时：独立 RequireJS context + paths/map，用 require 加载 AMD 物料。
 */
export const runtimeContextService = {
  /**
   * 合并 AMD 配置（首次 init 前生效；若已 init 则再次 config 合并进当前 context）。
   */
  configure(patch: RuntimeAmdConfig): void {
    mergedConfig = {
      ...mergedConfig,
      ...patch,
      paths: { ...mergedConfig.paths, ...patch.paths },
      map: { ...mergedConfig.map, ...patch.map },
    };
    if (scopedRequire && typeof (scopedRequire as RequireRoot).config === 'function') {
      (scopedRequire as RequireRoot).config({
        paths: patch.paths,
        map: patch.map,
        baseUrl: patch.baseUrl,
        waitSeconds: patch.waitSeconds,
      });
    }
  },

  async getScopedRequire(): Promise<RequireInvoke> {
    await injectRequireJsScript();
    if (scopedRequire) return scopedRequire;

    const root = window.requirejs ?? window.require;
    if (typeof root !== 'function' || typeof (root as RequireRoot).config !== 'function') {
      throw new Error('RequireJS 未就绪，请确认已执行 injectRequireJsScript');
    }

    scopedRequire = (root as RequireRoot).config({
      context: RUNTIME_CONTEXT,
      baseUrl: mergedConfig.baseUrl ?? '/',
      waitSeconds: mergedConfig.waitSeconds ?? 120,
      paths: { ...mergedConfig.paths },
      map: { ...mergedConfig.map },
    });

    return scopedRequire;
  },

  /**
   * 将唯一 id 映射到 AMD 脚本 URL，再通过当前 context 的 require 加载。
   * 使用 paths 注册「逻辑模块 id → URL」，避免裸 URL 在部分环境下的解析差异。
   */
  async requireModule(uniqueId: string, amdUrl: string): Promise<unknown> {
    const req = await this.getScopedRequire();
    const pathKey = amdInternalPathKey(uniqueId, amdUrl);
    (req as RequireRoot).config({
      paths: { [pathKey]: amdUrl },
    });

    return new Promise((resolve, reject) => {
      req(
        [pathKey],
        (mod) => resolve(mod),
        (err) => reject(err instanceof Error ? err : new Error(String(err))),
      );
    });
  },

  /**
   * 供画布使用：先查 componentsMap，未命中则 require 加载并写入 store。
   * @param materialUid 与 schema.type 一致，作为缓存主键
   */
  async loadRemoteMaterial(
    materialUid: string,
    definition: Pick<RemoteComponentDefinition, 'amdUrl' | 'exportName' | 'cssUrl'>,
  ): Promise<RemoteSchemaRenderer | null> {
    if (!definition.amdUrl?.trim()) return null;

    const { getRemoteRenderer, setRemoteRenderer } = useRuntimeComponentsStore.getState();
    const cached = getRemoteRenderer(materialUid);
    if (cached) return cached;

    const existing = inflightLoads.get(materialUid);
    if (existing) return existing;

    const task = (async () => {
      await loadRemoteStyle(definition.cssUrl);
      const mod = await this.requireModule(materialUid, definition.amdUrl!.trim());
      const Comp = normalizeExportedComponent(mod, definition.exportName);
      if (Comp) {
        setRemoteRenderer(materialUid, Comp);
      }
      return Comp;
    })().finally(() => {
      inflightLoads.delete(materialUid);
    });

    inflightLoads.set(materialUid, task);
    return task;
  },
};
