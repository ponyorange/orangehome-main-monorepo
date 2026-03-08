import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePageDto } from './create-page.dto';
import { IsOptional, IsString, IsObject } from 'class-validator';

export class UpdatePageDto extends PartialType(CreatePageDto) {
  @ApiProperty({ description: 'Page name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Page schema data', required: false })
  @IsOptional()
  @IsObject()
  schema?: Record<string, any>;
}
