import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { PasswordTransportCryptoService, LOGIN_CRYPTO_VERSION } from './password-transport-crypto.service';
import type { LoginRequestDto } from './dto/auth.dto';

function encryptPasswordLikeClient(plain: string, publicKeyPem: string, keyId: string): LoginRequestDto {
  const publicKey = crypto.createPublicKey(publicKeyPem);
  const aesKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const wrappedKey = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    aesKey,
  );

  return {
    email: 'u@test.com',
    version: LOGIN_CRYPTO_VERSION,
    keyId,
    ciphertext: enc.toString('base64'),
    iv: iv.toString('base64'),
    wrappedKey: wrappedKey.toString('base64'),
    authTag: authTag.toString('base64'),
  };
}

describe('PasswordTransportCryptoService', () => {
  let privatePem: string;
  let publicPem: string;
  const keyId = 'test-key-id';

  beforeAll(() => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    privatePem = privateKey;
    publicPem = publicKey;
  });

  function createService(): PasswordTransportCryptoService {
    const mockConfig = {
      get: (key: string) => {
        if (key === 'LOGIN_RSA_PRIVATE_KEY_PEM') return privatePem;
        if (key === 'LOGIN_RSA_KEY_ID') return keyId;
        if (key === 'ALLOW_PLAIN_PASSWORD_LOGIN') return 'false';
        return undefined;
      },
    } as unknown as ConfigService;
    const svc = new PasswordTransportCryptoService(mockConfig);
    svc.onModuleInit();
    return svc;
  }

  it('decrypts payload encrypted with matching public key', () => {
    const svc = createService();
    const plain = 'mySecretPwd123';
    const dto = encryptPasswordLikeClient(plain, publicPem, keyId);
    const out = svc.decryptPasswordFromProtectedLogin(dto);
    expect(out).toBe(plain);
  });

  it('rejects tampered ciphertext', () => {
    const svc = createService();
    const dto = encryptPasswordLikeClient('secret', publicPem, keyId);
    const buf = Buffer.from(dto.ciphertext!, 'base64');
    buf[0] ^= 0xff;
    dto.ciphertext = buf.toString('base64');
    expect(() => svc.decryptPasswordFromProtectedLogin(dto)).toThrow();
  });
});
