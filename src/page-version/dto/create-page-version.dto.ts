import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsBoolean } from 'class-validator';

export class CreatePageVersionDto {
  @ApiProperty({ description: 'Page ID this version belongs to' })
  @IsString()
  pageId: string;

  @ApiProperty({ description: 'Version name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Version description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Page schema data for this version' })
  @IsObject()
  schema: Record<string, any>;

  @ApiProperty({ description: 'Is this a published version', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiProperty({ description: 'Version creator user ID' })
  @IsString()
  creatorId: string;
}
