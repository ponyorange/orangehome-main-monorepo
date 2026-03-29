import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { PageResponseDto } from '../../page/dto/page.dto';
import { PageVersionResponseDto } from '../../page-version/dto/page-version.dto';
import { ProjectResponseDto } from '../../project/dto/project.dto';

export class BuilderInitResponseDto {
  project: ProjectResponseDto;
  page: PageResponseDto;
  pageVersion: PageVersionResponseDto;
}

export class GetComponentListQueryDto {
  @ApiProperty({ description: '页面ID' })
  @IsString()
  @IsNotEmpty({ message: 'pageId 不能为空' })
  pageId: string;

  @ApiProperty({
    enum: ['online', 'dev'],
    description: 'online：仅已上线（已发布）的最新版本；dev：开发中或已上线的最新版本',
  })
  @IsString()
  @IsIn(['online', 'dev'], { message: 'type 必须为 online 或 dev' })
  type: 'online' | 'dev';
}

export class ComponentMaterialDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  materialUid: string;

  @ApiProperty()
  materialName: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  icon?: string;

  @ApiProperty()
  platformId: string;

  @ApiProperty()
  platformName: string;

  @ApiProperty()
  typeId: string;

  @ApiProperty()
  typeName: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  categoryName: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  visibility: string;

  @ApiPropertyOptional()
  businessId?: string;

  @ApiPropertyOptional()
  businessName?: string;
}

export class ComponentVersionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  materialId: string;

  @ApiProperty()
  version: string;

  @ApiProperty()
  versionCode: number;

  @ApiPropertyOptional()
  changelog?: string;

  @ApiProperty()
  fileObjectKey: string;

  @ApiPropertyOptional()
  fileUrl?: string;

  @ApiPropertyOptional()
  sourceObjectKey?: string;

  @ApiPropertyOptional()
  sourceUrl?: string;

  @ApiProperty({ description: '0 开发中 1 测试中 2 已发布(上线) 3 已下线' })
  status: number;

  @ApiProperty()
  isPublished: boolean;

  @ApiPropertyOptional()
  editorConfigJson?: string;

  @ApiPropertyOptional()
  releaseTime?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ComponentListItemDto {
  @ApiProperty({ type: ComponentMaterialDto })
  material: ComponentMaterialDto;

  @ApiPropertyOptional({ type: ComponentVersionDto, nullable: true, description: '无满足条件的版本时为 null' })
  latestVersion: ComponentVersionDto | null;
}

export class GetComponentListResponseDto {
  @ApiProperty({ description: '页面所属项目业务线 ID' })
  businessId: string;

  @ApiProperty({ description: '官方物料库业务线 ID（与 businessId 的物料合并返回）' })
  officialBusinessId: string;

  @ApiProperty({ type: [ComponentListItemDto] })
  items: ComponentListItemDto[];
}
