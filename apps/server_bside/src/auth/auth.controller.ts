import { Controller, Post, Get, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { PasswordTransportCryptoService } from './password-transport-crypto.service';
import {
  SendEmailCodeDto,
  RegisterDto,
  LoginRequestDto,
  ResetPasswordDto,
  UserResponseDto,
  LoginCryptoParamsResponseDto,
} from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordCrypto: PasswordTransportCryptoService,
  ) {}

  @Get('login-crypto-params')
  @ApiOperation({ summary: '获取登录密码加密参数（RSA 公钥等）' })
  @ApiResponse({ status: 200, description: '成功', type: LoginCryptoParamsResponseDto })
  @ApiResponse({ status: 503, description: '密钥未配置' })
  getLoginCryptoParams(): LoginCryptoParamsResponseDto {
    return this.passwordCrypto.getLoginCryptoParams();
  }

  @Post('send-email-code')
  @ApiOperation({ summary: '发送邮箱验证码' })
  @ApiResponse({ status: 200, description: '验证码发送成功' })
  async sendEmailCode(@Body() dto: SendEmailCodeDto) {
    return this.authService.sendEmailCode(dto);
  }

  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ status: 201, description: '注册成功', type: Object })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: '用户登录（支持加密负载或开发环境明文）' })
  @ApiResponse({ status: 200, description: '登录成功', type: Object })
  async login(@Body() dto: LoginRequestDto) {
    return this.authService.login(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: '重置密码' })
  @ApiResponse({ status: 200, description: '密码重置成功' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: '用户登出' })
  @ApiResponse({ status: 200, description: '登出成功' })
  async logout(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    return this.authService.logout(token);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '获取成功', type: UserResponseDto })
  async getCurrentUser(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    return this.authService.getCurrentUser(token);
  }
}
