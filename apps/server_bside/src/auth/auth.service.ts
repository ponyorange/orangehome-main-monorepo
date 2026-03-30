import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  SendEmailCodeDto,
  RegisterDto,
  LoginRequestDto,
  ResetPasswordDto,
  LoginResponseDto,
  UserResponseDto,
} from './dto/auth.dto';
import { PasswordTransportCryptoService } from './password-transport-crypto.service';

@Injectable()
export class AuthService {
  private readonly coreServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly passwordCrypto: PasswordTransportCryptoService,
  ) {
    this.coreServiceUrl = this.configService.get<string>('CORE_SERVICE_HTTP_URL') || 'http://localhost:3000';
  }

  private async proxyRequest<T>(method: string, path: string, data?: any, headers?: any): Promise<T> {
    try {
      const url = `${this.coreServiceUrl}${path}`;
      const response = await firstValueFrom(
        this.httpService.request<T>({
          method,
          url,
          data,
          headers,
        }),
      );
      return response.data;
    } catch (error) {
      const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.response?.data?.message || error.message || '请求失败';
      throw new HttpException(message, status);
    }
  }

  async sendEmailCode(dto: SendEmailCodeDto): Promise<{ message: string }> {
    return this.proxyRequest('POST', '/api/auth/send-email-code', dto);
  }

  async register(dto: RegisterDto): Promise<LoginResponseDto> {
    if (dto.password !== dto.confirmPassword) {
      throw new HttpException('两次密码不一致', HttpStatus.BAD_REQUEST);
    }
    return this.proxyRequest('POST', '/api/auth/register', dto);
  }

  async login(dto: LoginRequestDto): Promise<LoginResponseDto> {
    if (this.passwordCrypto.isProtectedLogin(dto)) {
      const password = this.passwordCrypto.decryptPasswordFromProtectedLogin(dto);
      return this.proxyRequest('POST', '/api/auth/login', { email: dto.email, password });
    }

    if (dto.password !== undefined && dto.password !== '') {
      if (!this.passwordCrypto.isPlainAllowed()) {
        throw new HttpException('请使用当前页面支持的加密方式登录', HttpStatus.BAD_REQUEST);
      }
      return this.proxyRequest('POST', '/api/auth/login', { email: dto.email, password: dto.password });
    }

    throw new HttpException('无效的登录请求', HttpStatus.BAD_REQUEST);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    return this.proxyRequest('POST', '/api/auth/reset-password', dto);
  }

  async logout(accessToken: string): Promise<{ message: string }> {
    return this.proxyRequest('POST', '/api/auth/logout', {}, {
      Authorization: `Bearer ${accessToken}`,
    });
  }

  async getCurrentUser(accessToken: string): Promise<UserResponseDto> {
    return this.proxyRequest('GET', '/api/auth/me', undefined, {
      Authorization: `Bearer ${accessToken}`,
    });
  }
}
