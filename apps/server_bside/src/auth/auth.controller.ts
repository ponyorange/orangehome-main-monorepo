import { Controller, Post, Get, Body, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SendEmailCodeDto, RegisterDto, LoginDto, ResetPasswordDto, UserResponseDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功', type: Object })
  async login(@Body() dto: LoginDto) {
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
