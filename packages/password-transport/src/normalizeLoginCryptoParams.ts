import type { LoginCryptoParams } from './types.js';

function tryPick(o: Record<string, unknown>): LoginCryptoParams | null {
  const publicKey = o.publicKey;
  if (typeof publicKey !== 'string' || !publicKey.includes('PUBLIC KEY')) {
    return null;
  }
  return {
    version: String(o.version ?? ''),
    keyId: String(o.keyId ?? ''),
    publicKey,
    algorithm: String(o.algorithm ?? ''),
  };
}

/**
 * 将 GET /auth/login-crypto-params 的响应整理为 {@link LoginCryptoParams}。
 * 兼容网关/统一响应包装：`{ data: { version, keyId, publicKey, ... } }`。
 */
export function normalizeLoginCryptoParams(raw: unknown): LoginCryptoParams {
  if (raw == null || typeof raw !== 'object') {
    throw new Error('登录加密参数为空或格式错误');
  }

  const top = raw as Record<string, unknown>;
  const direct = tryPick(top);
  if (direct) return direct;

  const nested = top.data;
  if (nested != null && typeof nested === 'object') {
    const fromData = tryPick(nested as Record<string, unknown>);
    if (fromData) return fromData;
  }

  throw new Error(
    '登录加密参数缺少公钥字段。若经 API 网关返回，请确认响应体是否为 { data: { publicKey, ... } } 等形式。',
  );
}
