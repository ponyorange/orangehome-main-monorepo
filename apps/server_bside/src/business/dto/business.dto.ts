import { IsOptional, IsString } from 'class-validator';

export class BusinessPlatformDto {
  platformId: string;
  platformCode: string;
  platformName: string;
}

export class BusinessResponseDto {
  id: string;
  businessCode: string;
  businessName: string;
  description?: string;
  owner?: string;
  platforms: BusinessPlatformDto[];
  config?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ListBusinessesQueryDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  platformId?: string;

  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;
}
