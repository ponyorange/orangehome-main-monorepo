import forge from 'node-forge';
import type { LoginCryptoParams, ProtectedLoginPayload } from './types.js';
import { SUPPORTED_CRYPTO_VERSION } from './types.js';

function randomBytes(length: number): Uint8Array {
  const arr = new Uint8Array(length);
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues(arr);
    return arr;
  }
  const s = forge.random.getBytesSync(length);
  for (let i = 0; i < length; i++) arr[i] = s.charCodeAt(i) & 0xff;
  return arr;
}

function uint8ToBinaryString(u: Uint8Array): string {
  let s = '';
  for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]);
  return s;
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

/**
 * 与 {@link encryptLoginPassword} 的 Web Crypto 路径输出一致，供 HTTP 等非安全上下文使用（不依赖 crypto.subtle）。
 * RSA-OAEP 与 Node `oaepHash: 'sha256'` 对齐；AES-256-GCM、IV=12、tag=128 bit。
 */
export function encryptLoginPasswordWithForge(
  plainPassword: string,
  params: LoginCryptoParams,
): ProtectedLoginPayload {
  if (params.version !== SUPPORTED_CRYPTO_VERSION) {
    throw new Error(`Unsupported crypto protocol version: ${params.version}`);
  }

  const publicKey = forge.pki.publicKeyFromPem(params.publicKey);

  const aesKeyBytes = randomBytes(32);
  const iv = randomBytes(12);
  const keyBin = uint8ToBinaryString(aesKeyBytes);
  const ivBin = uint8ToBinaryString(iv);

  const cipher = forge.cipher.createCipher('AES-GCM', keyBin);
  cipher.start({
    iv: ivBin,
    tagLength: 128,
  });
  cipher.update(forge.util.createBuffer(plainPassword, 'utf8'));
  cipher.finish();

  const ciphertextStr = cipher.output.getBytes();
  const tagBuffer = cipher.mode.tag as forge.util.ByteBuffer;
  const authTagStr = tagBuffer.getBytes();

  const ciphertext = new Uint8Array(ciphertextStr.length);
  for (let i = 0; i < ciphertextStr.length; i++) ciphertext[i] = ciphertextStr.charCodeAt(i) & 0xff;
  const authTag = new Uint8Array(authTagStr.length);
  for (let i = 0; i < authTagStr.length; i++) authTag[i] = authTagStr.charCodeAt(i) & 0xff;

  const oaepOptions = {
    md: forge.md.sha256.create(),
    mgf1: { md: forge.md.sha256.create() },
  };
  const wrappedBinary = publicKey.encrypt(keyBin, 'RSA-OAEP', oaepOptions);
  const wrappedKey = new Uint8Array(wrappedBinary.length);
  for (let i = 0; i < wrappedBinary.length; i++) wrappedKey[i] = wrappedBinary.charCodeAt(i) & 0xff;

  return {
    email: '',
    version: params.version,
    keyId: params.keyId,
    ciphertext: toBase64(ciphertext),
    iv: toBase64(iv),
    wrappedKey: toBase64(wrappedKey),
    authTag: toBase64(authTag),
  };
}
