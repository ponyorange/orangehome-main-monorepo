import { BadGatewayException } from '@nestjs/common';

export function parsePageSchemaJson(raw: unknown): unknown {
  const s = typeof raw === 'string' ? raw : '';
  if (!s.trim()) return {};
  try {
    return JSON.parse(s) as unknown;
  } catch {
    throw new BadGatewayException('Invalid page schema');
  }
}

/**
 * core 存盘常见为 `{ "schema": { "id", "type", "children", ... } }`；
 * 注入前端的 ORANGEHOME_DATA 应为 `{ schema: <根节点> }`，故取内层根节点。
 */
export function unwrapPageSchemaRoot(parsed: unknown): unknown {
  if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const o = parsed as Record<string, unknown>;
    const inner = o.schema;
    if (inner !== null && inner !== undefined && typeof inner === 'object') {
      return inner;
    }
  }
  return parsed;
}
