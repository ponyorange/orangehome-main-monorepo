import { IsString, IsNotEmpty, IsOptional, IsJSON } from 'class-validator';

export class SavePageContentDto {
  @IsString()
  @IsNotEmpty({ message: '页面ID不能为空' })
  pageId: string;

  @IsString()
  @IsNotEmpty({ message: '页面内容不能为空' })
  @IsJSON({ message: '页面内容必须是JSON格式' })
  pageSchemaJson: string;

  @IsString()
  @IsNotEmpty({ message: '用户ID不能为空' })
  userId: string;
}

export class PageVersionResponseDto {
  id: string;
  pageId: string;
  versionNumber: number;
  comment?: string;
  pageSchemaJson: string;
  isLatestDraft: boolean;
  isPublished: boolean;
  publishedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ListPageVersionsQueryDto {
  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;
}
