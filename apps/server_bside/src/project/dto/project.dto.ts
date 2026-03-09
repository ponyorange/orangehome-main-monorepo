import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty({ message: '项目编码不能为空' })
  projectCode: string;

  @IsString()
  @IsNotEmpty({ message: '项目名称不能为空' })
  projectName: string;

  @IsString()
  @IsUUID()
  @IsNotEmpty({ message: '业务线ID不能为空' })
  businessId: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  config?: string;
}

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  projectName?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  config?: string;
}

export class ProjectResponseDto {
  id: string;
  projectCode: string;
  projectName: string;
  businessId: string;
  businessName: string;
  description?: string;
  config?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ListProjectsQueryDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  businessId?: string;

  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;
}
