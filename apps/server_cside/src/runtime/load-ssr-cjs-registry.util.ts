import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import type { ComponentType } from 'react';
import { buildSsrRegistryFromModules } from './schema-ssr-render.util';

const nodeRequire = createRequire(__filename);

const diskCacheRoot = join(tmpdir(), 'orangehome-ssr-cjs-cache');

const moduleByUrl = new Map<string, unknown>();
const inflightByUrl = new Map<string, Promise<unknown>>();

function cacheFilePathForUrl(url: string): string {
  const h = createHash('sha256').update(url).digest('hex').slice(0, 48);
  return join(diskCacheRoot, h, 'index.cjs');
}

/**
 * 从 CDN 拉取 SSR CJS，落盘到临时缓存目录后 `require`（与 Node 解析的 `react` 一致）。
 * 按 URL 内存缓存模块导出，避免重复 require。
 */
export async function requireCjsModuleFromUrl(url: string): Promise<unknown> {
  const memo = moduleByUrl.get(url);
  if (memo !== undefined) return memo;

  let loading = inflightByUrl.get(url);
  if (!loading) {
    loading = (async () => {
      const filePath = cacheFilePathForUrl(url);
      if (!existsSync(filePath)) {
        mkdirSync(dirname(filePath), { recursive: true });
        const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
        if (!res.ok) {
          throw new Error(`SSR bundle HTTP ${res.status} for ${url}`);
        }
        writeFileSync(filePath, await res.text(), 'utf8');
      }
      return nodeRequire(filePath) as unknown;
    })();
    inflightByUrl.set(url, loading);
  }

  try {
    const mod = await loading;
    moduleByUrl.set(url, mod);
    return mod;
  } finally {
    inflightByUrl.delete(url);
  }
}

/**
 * 按 schema 中出现的物料 type 列表，并行加载对应 CJS，得到与客户端 AMD 注册表同结构的 React 组件表。
 */
export async function loadSsrComponentRegistry(
  types: string[],
  ssrUrlByType: Record<string, string>,
): Promise<Record<string, ComponentType<Record<string, unknown>>>> {
  const missing = types.filter((t) => !ssrUrlByType[t]?.trim());
  if (missing.length > 0) {
    throw new Error(`SSR URL 缺失: ${missing.join(', ')}`);
  }
  const urls = types.map((t) => ssrUrlByType[t]!);
  const modules = await Promise.all(urls.map((u) => requireCjsModuleFromUrl(u)));
  return buildSsrRegistryFromModules(types, modules);
}

/** 单测或进程内清理缓存 */
export function resetSsrCjsMemoryCacheForTests(): void {
  moduleByUrl.clear();
  inflightByUrl.clear();
}
