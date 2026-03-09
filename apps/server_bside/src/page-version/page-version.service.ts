import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { GrpcClientService } from '../config/grpc-client.service';
import { SavePageContentDto, PageVersionResponseDto } from './dto/page-version.dto';

@Injectable()
export class PageVersionService {
  constructor(private readonly grpcClient: GrpcClientService) {}

  async saveContent(dto: SavePageContentDto): Promise<PageVersionResponseDto> {
    try {
      const result = await this.grpcClient.pageVersion.savePageContent({
        pageId: dto.pageId,
        pageSchemaJson: dto.pageSchemaJson,
        userId: dto.userId,
      });
      return this.mapToDto(result.data);
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async publish(versionId: string): Promise<PageVersionResponseDto> {
    try {
      const result = await this.grpcClient.pageVersion.publishPageVersion({ id: versionId });
      return this.mapToDto(result.data);
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async delete(versionId: string): Promise<void> {
    try {
      await this.grpcClient.pageVersion.deletePageVersion({ id: versionId });
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async findOne(versionId: string): Promise<PageVersionResponseDto> {
    try {
      const result = await this.grpcClient.pageVersion.getPageVersion({ id: versionId });
      return this.mapToDto(result.data);
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async findByPage(pageId: string, query: { page?: number; limit?: number }): Promise<{
    data: PageVersionResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;

      const result = await this.grpcClient.pageVersion.listPageVersions({
        pageId,
        page,
        limit,
      });

      return {
        data: result.data.map((item: any) => this.mapToDto(item)),
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async rollback(versionId: string, userId: string): Promise<PageVersionResponseDto> {
    try {
      const result = await this.grpcClient.pageVersion.rollbackPageVersion({
        id: versionId,
        userId,
      });
      return this.mapToDto(result.data);
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  private mapToDto(data: any): PageVersionResponseDto {
    return {
      id: data.id,
      pageId: data.pageId,
      versionNumber: data.versionNumber,
      comment: data.comment || undefined,
      pageSchemaJson: data.pageSchemaJson,
      isLatestDraft: data.isLatestDraft,
      isPublished: data.isPublished,
      publishedAt: data.publishedAt || undefined,
      createdBy: data.createdBy,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  private handleGrpcError(error: any): never {
    if (error.code === 5) {
      throw new NotFoundException('资源不存在');
    }
    throw new HttpException(error.message || '服务错误', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
