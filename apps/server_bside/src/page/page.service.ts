import { Injectable, NotFoundException, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { GrpcClientService } from '../config/grpc-client.service';
import { PageVersionService } from '../page-version/page-version.service';
import { CreatePageDto, UpdatePageDto, PageResponseDto } from './dto/page.dto';
import { firstValueFrom } from 'rxjs';
import { DEFAULT_PAGE_SCHEMA_JSON } from './default-page-schema';

@Injectable()
export class PageService {
  constructor(
    private readonly grpcClient: GrpcClientService,
    private readonly authService: AuthService,
    private readonly pageVersionService: PageVersionService,
  ) {}

  private normalizeTimestamp(value: any): Date {
    if (!value) {
      return new Date(0);
    }

    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? new Date(0) : date;
    }

    if (typeof value === 'object' && value.seconds !== undefined) {
      const seconds = Number(value.seconds) || 0;
      const nanos = Number(value.nanos) || 0;
      return new Date(seconds * 1000 + Math.floor(nanos / 1_000_000));
    }

    return new Date(0);
  }

  async create(dto: CreatePageDto, authHeader?: string): Promise<PageResponseDto> {
    let createdPage: PageResponseDto | null = null;
    try {
      const metadata = this.grpcClient.createAuthMetadata(authHeader);
      const result = await firstValueFrom(
        this.grpcClient.page.createPage({
          projectId: dto.projectId,
          path: dto.path,
          title: dto.title,
          description: this.grpcClient.wrapStringValue(dto.description),
        }, metadata),
      );
      createdPage = this.mapToDto(result.data);

      const accessToken = authHeader?.replace(/^Bearer\s+/i, '').trim();
      if (!accessToken) {
        throw new UnauthorizedException('请提供有效的 Bearer Token');
      }

      const currentUser = await this.authService.getCurrentUser(accessToken);
      await this.pageVersionService.saveContent(
        {
          pageId: createdPage.id,
          pageSchemaJson: DEFAULT_PAGE_SCHEMA_JSON,
          userId: currentUser.id,
        },
        authHeader,
      );

      return createdPage;
    } catch (error) {
      if (createdPage?.id) {
        try {
          const metadata = this.grpcClient.createAuthMetadata(authHeader);
          await firstValueFrom(this.grpcClient.page.deletePage({ id: createdPage.id, permanent: false }, metadata));
        } catch {
          // Ignore rollback failures and preserve the original error.
        }
      }
      this.handleGrpcError(error);
    }
  }

  async update(id: string, dto: UpdatePageDto, authHeader?: string): Promise<PageResponseDto> {
    try {
      const metadata = this.grpcClient.createAuthMetadata(authHeader);
      const result = await firstValueFrom(
        this.grpcClient.page.updatePage({
          id,
          path: this.grpcClient.wrapStringValue(dto.path),
          title: this.grpcClient.wrapStringValue(dto.title),
          description: this.grpcClient.wrapStringValue(dto.description),
        }, metadata),
      );
      return this.mapToDto(result.data);
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async delete(id: string, permanent: boolean = false, authHeader?: string): Promise<void> {
    try {
      const metadata = this.grpcClient.createAuthMetadata(authHeader);
      await firstValueFrom(this.grpcClient.page.deletePage({ id, permanent }, metadata));
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async findOne(id: string, authHeader?: string): Promise<PageResponseDto> {
    try {
      const metadata = this.grpcClient.createAuthMetadata(authHeader);
      const result = await firstValueFrom(this.grpcClient.page.getPage({ id }, metadata));
      return this.mapToDto(result.data);
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async findByProject(projectId: string, query: { page?: number; limit?: number; search?: string }, authHeader?: string): Promise<{
    data: PageResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const metadata = this.grpcClient.createAuthMetadata(authHeader);

      const result = await firstValueFrom(
        this.grpcClient.page.listPages({
          projectId,
          page,
          limit,
          search: query.search ? this.grpcClient.wrapStringValue(query.search) : undefined,
        }, metadata),
      );

      return {
        data: result.data?.map((item: any) => this.mapToDto(item)) || [],
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  private mapToDto(data: any): PageResponseDto {
    return {
      id: data.id,
      projectId: data.projectId,
      projectName: data.projectName,
      path: data.path,
      title: data.title,
      description: data.description || undefined,
      publishedVersionId: data.publishedVersionId || undefined,
      createdAt: this.normalizeTimestamp(data.createdAt),
      updatedAt: this.normalizeTimestamp(data.updatedAt),
    };
  }

  private handleGrpcError(error: any): never {
    if (error instanceof HttpException) {
      throw error;
    }
    if (error.code === 5) {
      throw new NotFoundException('资源不存在');
    }
    if (error.code === 16) {
      throw new UnauthorizedException(error.details || error.message || '请提供有效的 Bearer Token');
    }
    throw new HttpException(error.details || error.message || '服务错误', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
