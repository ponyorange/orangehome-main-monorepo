import type { LoginCryptoParams, ProtectedLoginPayload } from './types.js';
import { SUPPORTED_CRYPTO_VERSION } from './types.js';

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\s/g, '');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function randomBytes(length: number): Uint8Array {
  const arr = new Uint8Array(length);
  globalThis.crypto.getRandomValues(arr);
  return arr;
}

/**
 * Encrypt password for transport using RSA-OAEP (SHA-256) + AES-256-GCM.
 * 优先使用浏览器 `crypto.subtle`；无 subtle（如 HTTP 公网 IP）时按需加载 `node-forge` 实现，与 BFF 解密一致。
 */
export async function encryptLoginPassword(
  plainPassword: string,
  params: LoginCryptoParams,
): Promise<ProtectedLoginPayload> {
  if (params.version !== SUPPORTED_CRYPTO_VERSION) {
    throw new Error(`Unsupported crypto protocol version: ${params.version}`);
  }

  if (!globalThis.crypto?.subtle) {
    const { encryptLoginPasswordWithForge } = await import('./encryptForge.js');
    return encryptLoginPasswordWithForge(plainPassword, params);
  }

  const subtle = globalThis.crypto.subtle;

  const rsaPub = await subtle.importKey(
    'spki',
    pemToArrayBuffer(params.publicKey),
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt'],
  );

  const aesKey = await subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt']);

  const iv = randomBytes(12);
  const enc = new TextEncoder();
  const plainBuf = enc.encode(plainPassword);

  const combined = new Uint8Array(
    await subtle.encrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      aesKey,
      plainBuf,
    ),
  );

  const authTag = combined.slice(combined.length - 16);
  const ciphertext = combined.slice(0, combined.length - 16);

  const rawAes = await subtle.exportKey('raw', aesKey);
  const wrappedKey = new Uint8Array(
    await subtle.encrypt({ name: 'RSA-OAEP' }, rsaPub, rawAes),
  );

  const toBase64 = (bytes: Uint8Array): string => {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  return {
    email: '', // caller fills email
    version: params.version,
    keyId: params.keyId,
    ciphertext: toBase64(ciphertext),
    iv: toBase64(iv),
    wrappedKey: toBase64(wrappedKey),
    authTag: toBase64(authTag),
  };
}
