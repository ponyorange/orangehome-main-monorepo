import { Injectable, NotFoundException, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { GrpcClientService } from '../config/grpc-client.service';
import { SavePageContentDto, PageVersionResponseDto } from './dto/page-version.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PageVersionService {
  constructor(private readonly grpcClient: GrpcClientService) {}

  async saveContent(dto: SavePageContentDto, authHeader?: string): Promise<PageVersionResponseDto> {
    try {
      const metadata = this.grpcClient.createAuthMetadata(authHeader);
      const result = await firstValueFrom(
        this.grpcClient.pageVersion.savePageContent({
          pageId: dto.pageId,
          pageSchemaJson: dto.pageSchemaJson,
          userId: dto.userId,
        }, metadata),
      );
      return this.mapToDto(result.data);
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async publish(versionId: string, authHeader?: string): Promise<PageVersionResponseDto> {
    try {
      const metadata = this.grpcClient.createAuthMetadata(authHeader);
      const result = await firstValueFrom(this.grpcClient.pageVersion.publishPageVersion({ id: versionId }, metadata));
      return this.mapToDto(result.data);
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async delete(versionId: string, authHeader?: string): Promise<void> {
    try {
      const metadata = this.grpcClient.createAuthMetadata(authHeader);
      await firstValueFrom(this.grpcClient.pageVersion.deletePageVersion({ id: versionId }, metadata));
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async findOne(versionId: string, authHeader?: string): Promise<PageVersionResponseDto> {
    try {
      const metadata = this.grpcClient.createAuthMetadata(authHeader);
      const result = await firstValueFrom(this.grpcClient.pageVersion.getPageVersion({ id: versionId }, metadata));
      return this.mapToDto(result.data);
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async findByPage(pageId: string, query: { page?: number; limit?: number }, authHeader?: string): Promise<{
    data: PageVersionResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const metadata = this.grpcClient.createAuthMetadata(authHeader);

      const result = await firstValueFrom(
        this.grpcClient.pageVersion.listPageVersions({
          pageId,
          page,
          limit,
        }, metadata),
      );

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

  async findLatestByPage(pageId: string, authHeader?: string): Promise<PageVersionResponseDto> {
    const result = await this.findByPage(
      pageId,
      {
        page: 1,
        limit: 100,
      },
      authHeader,
    );

    const latestVersion = result.data.find((item) => item.isLatestDraft) || result.data[0];
    if (!latestVersion) {
      throw new NotFoundException('页面暂无版本');
    }

    return latestVersion;
  }

  async rollback(versionId: string, userId: string, authHeader?: string): Promise<PageVersionResponseDto> {
    try {
      const metadata = this.grpcClient.createAuthMetadata(authHeader);
      const result = await firstValueFrom(
        this.grpcClient.pageVersion.rollbackPageVersion({
          id: versionId,
          userId,
        }, metadata),
      );
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
    if (error.code === 16) {
      throw new UnauthorizedException(error.details || error.message || '请提供有效的 Bearer Token');
    }
    throw new HttpException(error.message || '服务错误', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
