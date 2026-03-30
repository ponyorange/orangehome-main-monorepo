import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class LoginCryptoParamsResponseDto {
  @ApiProperty({ example: '1' })
  version: string;

  @ApiProperty()
  keyId: string;

  @ApiProperty({ description: 'SPKI PEM' })
  publicKey: string;

  @ApiProperty({ example: 'RSA-OAEP-256+AES-256-GCM' })
  algorithm: string;
}

/** Plain or protected login body (mutually exclusive fields validated in AuthService). */
export class LoginRequestDto {
  @ApiProperty()
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;

  @ApiPropertyOptional({ description: '仅当 ALLOW_PLAIN_PASSWORD_LOGIN=true（开发调试用）' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  keyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ciphertext?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  iv?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  wrappedKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  authTag?: string;
}

export class SendEmailCodeDto {
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;
}

export class RegisterDto {
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度至少6位' })
  @MaxLength(50, { message: '密码长度最多50位' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: '确认密码不能为空' })
  confirmPassword: string;

  @IsString()
  @IsNotEmpty({ message: '验证码不能为空' })
  code: string;

  @IsString()
  @IsOptional()
  nickname?: string;
}

/** @deprecated Use LoginRequestDto — kept for Swagger samples only */
export class LoginDto {
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;
}

export class ResetPasswordDto {
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: '验证码不能为空' })
  code: string;

  @IsString()
  @IsNotEmpty({ message: '新密码不能为空' })
  @MinLength(6, { message: '密码长度至少6位' })
  @MaxLength(50, { message: '密码长度最多50位' })
  newPassword: string;
}

export class UserResponseDto {
  id: string;
  email: string;
  nickname: string;
  avatar?: string;
}

export class LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserResponseDto;
}
