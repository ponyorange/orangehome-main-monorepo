import {
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { LoginCryptoParamsResponseDto, LoginRequestDto } from './dto/auth.dto';

export const LOGIN_CRYPTO_VERSION = '1';

@Injectable()
export class PasswordTransportCryptoService implements OnModuleInit {
  private readonly logger = new Logger(PasswordTransportCryptoService.name);
  private privateKeyObject: crypto.KeyObject | null = null;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const pem = this.config.get<string>('LOGIN_RSA_PRIVATE_KEY_PEM')?.trim();
    const keyId = this.config.get<string>('LOGIN_RSA_KEY_ID')?.trim();
    const allowPlain = this.isPlainAllowed();

    if (!allowPlain && (!pem || !keyId)) {
      throw new Error(
        'LOGIN_RSA_PRIVATE_KEY_PEM and LOGIN_RSA_KEY_ID are required unless ALLOW_PLAIN_PASSWORD_LOGIN=true',
      );
    }

    if (pem) {
      try {
        this.privateKeyObject = crypto.createPrivateKey({ key: this.normalizePem(pem), format: 'pem' });
      } catch (e) {
        this.logger.error(e);
        throw new Error('Invalid LOGIN_RSA_PRIVATE_KEY_PEM');
      }
    }

    if (process.env.NODE_ENV === 'production' && allowPlain) {
      this.logger.warn('ALLOW_PLAIN_PASSWORD_LOGIN is enabled — never use in real production');
    }
  }

  private normalizePem(pem: string): string {
    if (pem.includes('BEGIN')) return pem.replace(/\\n/g, '\n');
    return pem;
  }

  isPlainAllowed(): boolean {
    return this.config.get<string>('ALLOW_PLAIN_PASSWORD_LOGIN') === 'true';
  }

  isProtectedLogin(body: LoginRequestDto): boolean {
    return !!(
      body.ciphertext &&
      body.wrappedKey &&
      body.iv &&
      body.authTag &&
      body.version !== undefined &&
      body.keyId
    );
  }

  getLoginCryptoParams(): LoginCryptoParamsResponseDto {
    if (!this.privateKeyObject) {
      throw new ServiceUnavailableException('登录加密未配置');
    }
    const keyId = this.config.get<string>('LOGIN_RSA_KEY_ID');
    if (!keyId) {
      throw new ServiceUnavailableException('LOGIN_RSA_KEY_ID 未配置');
    }
    const pub = crypto.createPublicKey(this.privateKeyObject);
    const publicKey = pub.export({ type: 'spki', format: 'pem' }) as string;
    return {
      version: LOGIN_CRYPTO_VERSION,
      keyId,
      publicKey,
      algorithm: 'RSA-OAEP-256+AES-256-GCM',
    };
  }

  decryptPasswordFromProtectedLogin(dto: LoginRequestDto): string {
    if (!this.privateKeyObject) {
      throw new ServiceUnavailableException('登录加密未配置');
    }
    const expectedKeyId = this.config.get<string>('LOGIN_RSA_KEY_ID');
    if (dto.version !== LOGIN_CRYPTO_VERSION) {
      throw new BadRequestException('不支持的加密协议版本，请刷新页面后重试');
    }
    if (!expectedKeyId || dto.keyId !== expectedKeyId) {
      throw new BadRequestException('加密密钥已更新，请刷新页面后重试');
    }

    try {
      const wrappedKeyBuf = Buffer.from(dto.wrappedKey!, 'base64');
      const aesKeyBuf = crypto.privateDecrypt(
        {
          key: this.privateKeyObject,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        wrappedKeyBuf,
      );

      const iv = Buffer.from(dto.iv!, 'base64');
      const ciphertext = Buffer.from(dto.ciphertext!, 'base64');
      const authTag = Buffer.from(dto.authTag!, 'base64');

      const decipher = crypto.createDecipheriv('aes-256-gcm', aesKeyBuf, iv);
      decipher.setAuthTag(authTag);
      const dec = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      return dec.toString('utf8');
    } catch {
      throw new UnauthorizedException('登录失败');
    }
  }
}
