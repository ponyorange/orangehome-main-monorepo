import { BadGatewayException } from '@nestjs/common';
import { unwrapString } from '../core-grpc/grpc-value.util';
import {
  assertHttpOrHttpsMaterialUrl,
  urlFromOrangehomeMaterialObjectKey,
} from './material-cdn-url.util';

/**
 * 构建物料 uid → SSR bundle URL 映射（ssrFileUrl，缺失时用 ssrFileObjectKey 按 CDN 规则拼 URL）。
 * 任一 uid 缺 SSR 地址即抛错（供将来「真·全量 SSR」使用）。
 */
export function buildComponentsSsrMap(
  uids: string[],
  rows: unknown[],
  versionStatuses: readonly number[],
): Record<string, string> {
  const map: Record<string, string> = {};
  if (uids.length === 0) {
    return map;
  }

  const byUid = new Map<string, Record<string, unknown>>();
  for (const row of rows) {
    if (row !== null && typeof row === 'object' && !Array.isArray(row)) {
      const r = row as Record<string, unknown>;
      const material = r.material as Record<string, unknown> | undefined;
      const uid = material?.materialUid;
      if (typeof uid === 'string') {
        byUid.set(uid, r);
      }
    }
  }

  const statusHint = versionStatuses.join(',');
  for (const uid of uids) {
    const row = byUid.get(uid);
    const latestVersion = row?.latestVersion as
      | Record<string, unknown>
      | undefined;
    if (!latestVersion || typeof latestVersion !== 'object') {
      throw new BadGatewayException(
        `No material version for ${uid} (allowed versionStatus=[${statusHint}])`,
      );
    }
    const ssrKey = unwrapString(latestVersion.ssrFileObjectKey);
    let url = unwrapString(latestVersion.ssrFileUrl);
    if (ssrKey?.trim()) {
      url = urlFromOrangehomeMaterialObjectKey(ssrKey);
    }
    if (!url?.trim()) {
      throw new BadGatewayException(
        `Empty SSR material URL for ${uid} (ssrFileUrl/ssrFileObjectKey)`,
      );
    }
    assertHttpOrHttpsMaterialUrl(url);
    map[uid] = url;
  }

  return map;
}

/**
 * 与 {@link buildComponentsSsrMap} 相同数据源，但 **缺 ssrFileUrl/ssrFileObjectKey 的 uid 跳过不抛错**，
 * 便于当前「仅占位 SSR HTML + 浏览器水合」阶段上线；待 Node 端真实 `require` CJS 时再改为严格模式或配置开关。
 */
export function buildComponentsSsrMapBestEffort(
  uids: string[],
  rows: unknown[],
): Record<string, string> {
  const map: Record<string, string> = {};
  if (uids.length === 0) {
    return map;
  }

  const byUid = new Map<string, Record<string, unknown>>();
  for (const row of rows) {
    if (row !== null && typeof row === 'object' && !Array.isArray(row)) {
      const r = row as Record<string, unknown>;
      const material = r.material as Record<string, unknown> | undefined;
      const uid = material?.materialUid;
      if (typeof uid === 'string') {
        byUid.set(uid, r);
      }
    }
  }

  for (const uid of uids) {
    const row = byUid.get(uid);
    const latestVersion = row?.latestVersion as
      | Record<string, unknown>
      | undefined;
    if (!latestVersion || typeof latestVersion !== 'object') {
      continue;
    }
    const ssrKey = unwrapString(latestVersion.ssrFileObjectKey);
    let url = unwrapString(latestVersion.ssrFileUrl);
    if (ssrKey?.trim()) {
      url = urlFromOrangehomeMaterialObjectKey(ssrKey);
    }
    if (!url?.trim()) {
      continue;
    }
    try {
      assertHttpOrHttpsMaterialUrl(url);
    } catch {
      continue;
    }
    map[uid] = url;
  }

  return map;
}
