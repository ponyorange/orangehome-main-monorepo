import { injectable } from 'inversify';
import { injectRequireJsScript, getRequireJsRoot } from '../../vendor/loadRequireJs';

/** RequireJS 根 API：config 返回绑定到某 context 的 require */
type RequireJsInvoke = (
  deps: string[],
  onLoad: (...args: unknown[]) => void,
  onError?: (err: Error) => void,
) => void;

/** newContext 内部 context：defQueue 每项为 [moduleName, deps, factory] */
export interface RequireJsContext {
  contextName: string;
  nameToUrl: (moduleName: string, ext?: string, skipExt?: boolean) => string;
  config: { baseUrl?: string; urlArgs?: string | ((id: string, url: string) => string) };
  require: RequireJsInvoke;
  load: (moduleId: string, url: string) => void;
  completeLoad: (name: string) => void;
  defQueue: Array<[string | null, string[] | null, ((...args: unknown[]) => unknown) | undefined]>;
  defQueueMap: Record<string, boolean>;
}

export interface CreateRequireOptions {
  waitSeconds?: number;
  baseUrl?: string;
  paths?: Record<string, string>;
  map?: Record<string, Record<string, string>>;
}

export interface CreatedRequire {
  /** 当前 context 下的 require(deps, onLoad, onError) */
  require: RequireJsInvoke;
  /**
   * 向当前 context 注册具名模块（写入 defQueue，与全局 define 在 context 下的行为一致）。
   * 注意：须调用 flushDefines() 后再 require 这些 id。
   */
  define: (name: string, factory: () => unknown) => void;
  context: RequireJsContext;
  /** 执行一轮队列处理，使 define 注册的模块可被 require */
  flushDefines: () => Promise<void>;
}

/**
 * AMD / RequireJS：创建独立命名 context，支持 synthetic define + 可选修补 load / completeLoad。
 */
@injectable()
export class AmdService {
  /**
   * 对应伪代码里的 createRequire(context)：`R.config({ context, waitSeconds })` 后取 `R.s.contexts[context]`。
   */
  async createRequire(contextName: string, options: CreateRequireOptions = {}): Promise<CreatedRequire> {
    await injectRequireJsScript();
    const R = getRequireJsRoot();

    const r = R.config({
      context: contextName,
      waitSeconds: options.waitSeconds ?? 30,
      baseUrl: options.baseUrl ?? '/',
      paths: { ...(options.paths ?? {}) },
      map: { ...(options.map ?? {}) },
    }) as RequireJsInvoke;

    const s = (R as unknown as { s?: { contexts?: Record<string, RequireJsContext> } }).s;
    const c = s?.contexts?.[contextName];
    if (!c) {
      throw new Error(`RequireJS 未创建 context: ${contextName}`);
    }

    const { load, completeLoad } = c;
    c.load = function loadWrapped(moduleId: string, url: string) {
      return load.call(c, moduleId, url);
    };
    c.completeLoad = function completeLoadWrapped(name: string) {
      return completeLoad.call(c, name);
    };

    const defineSynthetic = (name: string, factory: () => unknown) => {
      c.defQueue.push([name, [], factory]);
      c.defQueueMap[name] = true;
    };

    const flushDefines = () =>
      new Promise<void>((resolve, reject) => {
        r(
          [],
          () => resolve(),
          (err) => reject(err instanceof Error ? err : new Error(String(err))),
        );
      });

    return { require: r, define: defineSynthetic, context: c, flushDefines };
  }
}

/** 再导出，便于与「import R from './require.min.js'」的命名习惯对齐 */
export { requirejs } from '../../vendor/loadRequireJs';
