import { BadGatewayException } from '@nestjs/common';
import { unwrapString } from '../core-grpc/grpc-value.util';
import {
  assertHttpOrHttpsMaterialUrl,
  urlFromOrangehomeMaterialObjectKey,
} from './material-cdn-url.util';

/**
 * 由 `GetMaterialsWithLatestVersion` 的 `data` 行构建 uid → **浏览器运行时**脚本 URL（fileUrl / fileObjectKey）。
 * 与 `RuntimeService` 原 `buildComponentsMapWithMaterialVersionStatus` 中循环逻辑一致。
 */
export function buildComponentsAmdMapFromRows(
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
    const fileKey = unwrapString(latestVersion.fileObjectKey);
    let url = unwrapString(latestVersion.fileUrl);
    if (fileKey?.trim()) {
      url = urlFromOrangehomeMaterialObjectKey(fileKey);
    }
    if (!url?.trim()) {
      throw new BadGatewayException(`Empty material URL for ${uid}`);
    }
    assertHttpOrHttpsMaterialUrl(url);
    map[uid] = url;
  }

  return map;
}
