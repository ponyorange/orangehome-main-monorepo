import 'reflect-metadata';
import { Container, injectable, inject } from 'inversify';
import React from 'react';
import ReactDOM from 'react-dom';
import { loadRemoteStyle } from '../../common/components/SchemaRenderer/utils/remoteStyle';
import type { RemoteComponentDefinition } from '../../common/components/SchemaRenderer/ComponentManager';
import type { RemoteSchemaRenderer } from '../store/runtimeComponentsStore';
import { useRuntimeComponentsStore } from '../store/runtimeComponentsStore';
import { useMaterialBundleStore } from '../store/materialBundleStore';
import { AmdService, type RequireJsContext } from './AmdService';
import { remoteComponentDebug } from '../../utils/remoteComponentDebug';

type RequireInvoke = (
  deps: string[],
  onLoad: (...modules: unknown[]) => void,
  onError?: (err: Error) => void,
) => void;

type RequireJsRoot = RequireInvoke & { config: (cfg: Record<string, unknown>) => RequireInvoke };

const RUNTIME_CONTEXT = 'orange_editor_runtime';

/** RequireJS 2.x：map 可将某前缀下的模块名映射到另一模块（或配合 paths 做依赖替换） */
export interface RuntimeAmdConfig {
  baseUrl?: string;
  waitSeconds?: number;
  paths?: Record<string, string>;
  map?: Record<string, Record<string, string>>;
}

function describeModuleExport(mod: unknown): Record<string, unknown> {
  if (mod == null) return { shape: 'nullish' };
  const t = typeof mod;
  if (t === 'function') return { shape: 'function', name: (mod as { name?: string }).name };
  if (t !== 'object') return { shape: t };
  const keys = Object.keys(mod as object).slice(0, 12);
  const hasDefault = 'default' in (mod as object);
  const def = hasDefault ? (mod as { default: unknown }).default : undefined;
  return {
    shape: 'object',
    keys,
    hasDefault,
    defaultType: def === undefined ? 'none' : typeof def,
  };
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

@injectable()
export class RuntimeContextService {
  private mergedConfig: RuntimeAmdConfig = {
    baseUrl: '/',
    waitSeconds: 120,
    paths: {},
    map: {},
  };

  private scopedRequire: RequireInvoke | null = null;
  private context: RequireJsContext | null = null;
  private nameToUrlOriginal: RequireJsContext['nameToUrl'] | null = null;

  /** requireModule 单次加载时：moduleId → 显式 AMD URL（列表未 hydrate 时的回退） */
  private urlOverrideByModuleId: Record<string, string> = {};

  private initPromise: Promise<void> | null = null;

  private readonly inflightLoads = new Map<string, Promise<RemoteSchemaRenderer | null>>();

  constructor(@inject(AmdService) private readonly amdService: AmdService) {}

  /**
   * 合并 AMD 配置（首次 init 前写入 mergedConfig；已 init 则对当前 context 再 config）。
   */
  configure(patch: RuntimeAmdConfig): void {
    this.mergedConfig = {
      ...this.mergedConfig,
      ...patch,
      paths: { ...this.mergedConfig.paths, ...patch.paths },
      map: { ...this.mergedConfig.map, ...patch.map },
    };
    const root = (typeof window !== 'undefined' ? (window.requirejs ?? window.require) : undefined) as
      | RequireJsRoot
      | undefined;
    if (root?.config) {
      root.config({
        context: RUNTIME_CONTEXT,
        paths: patch.paths,
        map: patch.map,
        baseUrl: patch.baseUrl,
        waitSeconds: patch.waitSeconds,
      });
    }
  }

  private patchNameToUrl(ctx: RequireJsContext): void {
    if (this.nameToUrlOriginal) return;
    this.nameToUrlOriginal = ctx.nameToUrl.bind(ctx);
    const self = this;
    ctx.nameToUrl = function patchedNameToUrl(
      moduleName: string,
      ext?: string,
      skipExt?: boolean,
    ): string {
      const override = self.urlOverrideByModuleId[moduleName];
      const fromStore = useMaterialBundleStore.getState().bundles[moduleName];
      const url = (override ?? fromStore)?.trim();
      if (url) {
        if (self.context?.config?.urlArgs && !/^blob\:/i.test(url)) {
          const ua = self.context.config.urlArgs;
          const suffix = typeof ua === 'function' ? ua(moduleName, url) : `?${ua}`;
          return url + (url.includes('?') ? '&' : '') + suffix.replace(/^\?/, '');
        }
        return url;
      }
      return self.nameToUrlOriginal!(moduleName, ext, skipExt);
    };
  }

  private async doInit(): Promise<void> {
    const created = await this.amdService.createRequire(RUNTIME_CONTEXT, {
      waitSeconds: this.mergedConfig.waitSeconds,
      baseUrl: this.mergedConfig.baseUrl,
      paths: { ...this.mergedConfig.paths },
      map: this.mergedConfig.map,
    });

    /** 与伪代码一致：synthetic define，由宿主 bundle 提供 React / ReactDOM */
    created.define('react', () => React);
    created.define('react-dom', () => ReactDOM);
    await created.flushDefines();

    const { require: r, context: ctx } = created;
    this.scopedRequire = r;
    this.context = ctx;
    this.patchNameToUrl(ctx);
    remoteComponentDebug('RuntimeContextService.doInit: RequireJS context 就绪', {
      context: RUNTIME_CONTEXT,
    });
  }

  async ensureInitialized(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.doInit();
    }
    await this.initPromise;
  }

  /** 与历史 API 一致：返回绑定 runtime context 的 require */
  async getScopedRequire(): Promise<RequireInvoke> {
    await this.ensureInitialized();
    return this.scopedRequire!;
  }

  /**
   * 使用物料 uid 作为模块 id 加载；若传入 amdUrl 则本次优先使用该 URL（不写 schema）。
   */
  async requireModule(uniqueId: string, amdUrl: string): Promise<unknown> {
    await this.ensureInitialized();
    const req = this.scopedRequire!;
    const url = amdUrl.trim();
    remoteComponentDebug('RuntimeContextService.requireModule: 开始', { uniqueId, amdUrl: url });
    this.urlOverrideByModuleId[uniqueId] = url;
    try {
      const mod = await new Promise<unknown>((resolve, reject) => {
        req(
          [uniqueId],
          (m) => resolve(m),
          (err) => reject(err instanceof Error ? err : new Error(String(err))),
        );
      });
      remoteComponentDebug('RuntimeContextService.requireModule: require 回调成功', {
        uniqueId,
        module: describeModuleExport(mod),
      });
      return mod;
    } catch (e) {
      remoteComponentDebug('RuntimeContextService.requireModule: require 失败', {
        uniqueId,
        amdUrl: url,
        message: e instanceof Error ? e.message : String(e),
      });
      throw e;
    } finally {
      delete this.urlOverrideByModuleId[uniqueId];
    }
  }

  /**
   * 批量 require 物料 uid，将默认导出（或具名导出）写入 runtimeComponentsStore。
   */
  async requireModules(
    materialUids: string[],
    exportNameByUid?: Record<string, string | undefined>,
  ): Promise<void> {
    if (materialUids.length === 0) return;
    await this.ensureInitialized();
    const req = this.scopedRequire!;
    const { setRemoteRenderer } = useRuntimeComponentsStore.getState();

    await new Promise<void>((resolve, reject) => {
      req(
        materialUids,
        (...modules: unknown[]) => {
          try {
            materialUids.forEach((uid, index) => {
              const exportName = exportNameByUid?.[uid];
              const Comp = normalizeExportedComponent(modules[index], exportName);
              if (Comp) setRemoteRenderer(uid, Comp);
            });
            resolve();
          } catch (e) {
            reject(e instanceof Error ? e : new Error(String(e)));
          }
        },
        (err) => reject(err instanceof Error ? err : new Error(String(err))),
      );
    });
  }

  /**
   * 供画布使用：先查 componentsMap，未命中则 require 加载并写入 store。
   * @param materialUid 与 schema.type 一致
   */
  async loadRemoteMaterial(
    materialUid: string,
    definition: Pick<RemoteComponentDefinition, 'amdUrl' | 'exportName' | 'cssUrl'>,
  ): Promise<RemoteSchemaRenderer | null> {
    const { getRemoteRenderer, setRemoteRenderer } = useRuntimeComponentsStore.getState();
    const bundleFromStore = useMaterialBundleStore.getState().bundles[materialUid]?.trim();
    const cached = getRemoteRenderer(materialUid);
    if (cached) {
      remoteComponentDebug('RuntimeContextService.loadRemoteMaterial: 命中内存缓存', { materialUid });
      return cached;
    }

    const existing = this.inflightLoads.get(materialUid);
    if (existing) {
      remoteComponentDebug('RuntimeContextService.loadRemoteMaterial: 复用进行中的加载', { materialUid });
      return existing;
    }

    const hasUrl =
      Boolean(definition.amdUrl?.trim()) ||
      Boolean(bundleFromStore);
    if (!hasUrl) {
      const bundleKeys = Object.keys(useMaterialBundleStore.getState().bundles).length;
      remoteComponentDebug('RuntimeContextService.loadRemoteMaterial: 无 URL，直接放弃', {
        materialUid,
        definitionAmdUrl: definition.amdUrl ?? '(无)',
        bundleFromStore: bundleFromStore ?? '(无)',
        bundleEntriesCount: bundleKeys,
        hint: '确认组件列表已请求且 hydrate 了 materialBundleStore',
      });
      return null;
    }

    remoteComponentDebug('RuntimeContextService.loadRemoteMaterial: 开始加载', {
      materialUid,
      amdUrl: definition.amdUrl?.trim() || '(用 store bundle + nameToUrl)',
      bundleFromStore: bundleFromStore ?? '(无)',
      exportName: definition.exportName ?? '(默认/default)',
    });

    const task = (async () => {
      await loadRemoteStyle(definition.cssUrl);
      let mod: unknown;
      if (definition.amdUrl?.trim()) {
        mod = await this.requireModule(materialUid, definition.amdUrl!.trim());
      } else {
        remoteComponentDebug('RuntimeContextService.loadRemoteMaterial: require([materialUid]) 仅用 store URL', {
          materialUid,
        });
        await this.ensureInitialized();
        const req = this.scopedRequire!;
        try {
          mod = await new Promise<unknown>((resolve, reject) => {
            req(
              [materialUid],
              (m) => resolve(m),
              (err) => reject(err instanceof Error ? err : new Error(String(err))),
            );
          });
        } catch (e) {
          remoteComponentDebug('RuntimeContextService.loadRemoteMaterial: require([uid]) 失败', {
            materialUid,
            message: e instanceof Error ? e.message : String(e),
          });
          throw e;
        }
        remoteComponentDebug('RuntimeContextService.loadRemoteMaterial: require([uid]) 成功', {
          materialUid,
          module: describeModuleExport(mod),
        });
      }
      const Comp = normalizeExportedComponent(mod, definition.exportName);
      if (!Comp) {
        remoteComponentDebug('RuntimeContextService.loadRemoteMaterial: 无法解析为 React 组件', {
          materialUid,
          exportName: definition.exportName,
          module: describeModuleExport(mod),
          hint: 'AMD 应导出 default 函数组件，或配置 exportName',
        });
      } else {
        remoteComponentDebug('RuntimeContextService.loadRemoteMaterial: 已写入 runtimeComponentsStore', {
          materialUid,
          displayName: Comp.displayName ?? Comp.name,
        });
      }
      if (Comp) setRemoteRenderer(materialUid, Comp);
      return Comp;
    })().finally(() => {
      this.inflightLoads.delete(materialUid);
    });

    this.inflightLoads.set(materialUid, task);
    return task;
  }
}

const runtimeContainer = new Container({ defaultScope: 'Singleton' });
runtimeContainer.bind(AmdService).toSelf();
runtimeContainer.bind(RuntimeContextService).toSelf();

/** 画布 AMD / 远程组件统一入口（与历史平面对象 API 对齐） */
export const runtimeContextService = runtimeContainer.get(RuntimeContextService);
