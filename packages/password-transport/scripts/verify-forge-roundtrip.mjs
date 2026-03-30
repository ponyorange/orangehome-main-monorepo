/**
 * 验证 encryptForge 与 Node crypto.createDecipheriv 一致（需先 npm run build）
 */
import crypto from 'node:crypto';
import { encryptLoginPasswordWithForge } from '../dist/encryptForge.js';

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const pubPem = publicKey.export({ type: 'spki', format: 'pem' });

const params = {
  version: '1',
  keyId: 'test-key',
  publicKey: pubPem,
  algorithm: 'RSA-OAEP-256+AES-256-GCM',
};

const payload = encryptLoginPasswordWithForge('hello-世界', params);

const wrappedKeyBuf = Buffer.from(payload.wrappedKey, 'base64');
const aesKeyBuf = crypto.privateDecrypt(
  {
    key: privateKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256',
  },
  wrappedKeyBuf,
);

const iv = Buffer.from(payload.iv, 'base64');
const ciphertext = Buffer.from(payload.ciphertext, 'base64');
const authTag = Buffer.from(payload.authTag, 'base64');

const decipher = crypto.createDecipheriv('aes-256-gcm', aesKeyBuf, iv);
decipher.setAuthTag(authTag);
const dec = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
const ok = dec.toString('utf8') === 'hello-世界';
console.log(ok ? 'verify-forge-roundtrip: OK' : 'verify-forge-roundtrip: FAIL');
process.exit(ok ? 0 : 1);
