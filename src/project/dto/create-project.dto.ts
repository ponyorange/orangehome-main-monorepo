import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ description: 'Project name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Project description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Project cover image URL', required: false })
  @IsOptional()
  @IsString()
  cover?: string;

  @ApiProperty({ description: 'User ID of the project owner' })
  @IsString()
  ownerId: string;
}
