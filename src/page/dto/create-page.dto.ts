import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreatePageDto {
  @ApiProperty({ description: 'Page name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Project ID this page belongs to' })
  @IsString()
  projectId: string;

  @ApiProperty({ description: 'Page description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Page schema data', required: false })
  @IsOptional()
  @IsObject()
  schema?: Record<string, any>;

  @ApiProperty({ description: 'Page preview image URL', required: false })
  @IsOptional()
  @IsString()
  preview?: string;
}
