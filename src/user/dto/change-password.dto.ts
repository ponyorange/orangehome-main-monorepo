import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Old password' })
  @IsString()
  oldPassword: string;

  @ApiProperty({ description: 'New password, minimum 6 characters' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
