import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePageDto {
  @IsString()
  @IsNotEmpty({ message: '项目ID不能为空' })
  projectId: string;

  @IsString()
  @IsNotEmpty({ message: '页面路径不能为空' })
  path: string;

  @IsString()
  @IsNotEmpty({ message: '页面标题不能为空' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdatePageDto {
  @IsString()
  @IsOptional()
  path?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class PageResponseDto {
  id: string;
  projectId: string;
  projectName: string;
  path: string;
  title: string;
  description?: string;
  publishedVersionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ListPagesQueryDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;
}
